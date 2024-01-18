import { eq, sql } from 'drizzle-orm'
import { resolve } from 'path'

import { AbstractCommunityService } from '~/shared'

import { DB } from '../db/db.js'
import { communities, Community, User } from '../db/schema.js'
import { RepoSegments, urlToRepoSegments } from '../lib/index.js'
import { hashString, toResolvedPath } from '../lib/paths.js'
import { GitHubService } from './GitHubService.js'
import { Gov4GitService } from './Gov4GitService.js'
import { Services } from './Services.js'
import { SettingsService } from './SettingsService.js'
import { UserService } from './UserService.js'

export type CommunityServiceOptions = {
  services: Services
  configDir?: string
}

export class CommunityService extends AbstractCommunityService {
  private declare readonly services: Services
  private declare readonly configDir: string
  private declare readonly db: DB
  private declare readonly userService: UserService
  private declare readonly settingsService: SettingsService
  private declare readonly govService: Gov4GitService
  private declare readonly gitHubService: GitHubService

  constructor({ services, configDir = '~/.gov4git' }: CommunityServiceOptions) {
    super()
    this.services = services
    this.configDir = toResolvedPath(configDir)
    this.db = this.services.load<DB>('db')
    this.gitHubService = this.services.load<GitHubService>('github')
    this.userService = this.services.load<UserService>('user')
    this.settingsService = this.services.load<SettingsService>('settings')
    this.govService = this.services.load<Gov4GitService>('gov4git')
  }

  public getCommunity = async (): Promise<Community | null> => {
    const user = await this.userService.getUser()
    if (user == null) return null
    const community = (
      await this.db
        .select()
        .from(communities)
        .where(eq(communities.selected, true))
        .limit(1)
    )[0]
    if (community == null) return null
    return await this.syncCommunity(user, community)
  }

  public getCommunities = async () => {
    const user = await this.userService.getUser()
    if (user == null) return []
    const allCommunities = await this.db.select().from(communities)
    const syncCommunities = allCommunities.map((c) => {
      return this.syncCommunity(user, c)
    })
    return await Promise.all(syncCommunities)
  }

  public setUserVotingCredits = async (votingCredits: number) => {
    await this.db
      .update(communities)
      .set({ userVotingCredits: votingCredits })
      .where(eq(communities.selected, true))
  }

  public selectCommunity = async (url: string) => {
    const community = (
      await this.db.select().from(communities).where(eq(communities.url, url))
    )[0]

    if (community == null) {
      throw new Error(`Invalid community url ${url} to select`)
    }

    await this.db.update(communities).set({ selected: false })
    await this.db
      .update(communities)
      .set({ selected: true })
      .where(eq(communities.url, url))
  }

  private requestToJoin = async (
    user: User,
    community: Community,
  ): Promise<void> => {
    if (
      community.isMember ||
      (community.joinRequestUrl != null && community.joinRequestStatus != null)
    ) {
      return
    }

    const repoSegments = urlToRepoSegments(community.projectUrl)

    const title = "I'd like to join this project's community"
    const body = `### Your public repo

${user.memberPublicUrl}

### Your public branch

${user.memberPublicBranch}`
    const labels = ['gov4git:join']

    const url = await this.gitHubService.createIssue({
      repoName: repoSegments.repo,
      username: repoSegments.owner,
      token: user.pat,
      title,
      body,
      labels,
    })

    await this.db
      .update(communities)
      .set({
        joinRequestUrl: url,
        joinRequestStatus: 'open',
      })
      .where(eq(communities.url, community.url))
  }

  private isCommunityMember = async (
    user: User,
    community: Community,
  ): Promise<boolean> => {
    const command = ['group', 'list', '--name', 'everybody']
    const users = await this.govService.mustRun<string[]>(
      command,
      community.configPath,
    )
    return users.includes(user.username)
  }

  private getMembershipStatus = async (
    user: User,
    community: Community,
  ): Promise<{ status: 'open' | 'closed'; url: string } | null> => {
    const repoSegments = urlToRepoSegments(community.projectUrl)
    const userJoinRequest = (
      await this.gitHubService.searchUserIssues({
        repoOwner: repoSegments.owner,
        repoName: repoSegments.repo,
        username: user.username,
        token: user.pat,
        title: "I'd like to join this project's community",
      })
    )[0]

    if (userJoinRequest == null) {
      return null
    } else {
      return {
        status: userJoinRequest.state,
        url: userJoinRequest.html_url,
      }
    }
  }

  private syncCommunity = async (
    user: User,
    community: Community,
  ): Promise<Community> => {
    const [isCommunityMember, membershipStatus] = await Promise.all([
      this.isCommunityMember(user, community),
      this.getMembershipStatus(user, community),
    ])

    const syncedCommunity = (
      await this.db
        .update(communities)
        .set({
          isMember: isCommunityMember,
          joinRequestStatus: membershipStatus?.status ?? null,
          joinRequestUrl: membershipStatus?.url ?? null,
        })
        .where(eq(communities.url, community.url))
        .returning()
    )[0]!

    return syncedCommunity
  }

  private getDefaultBranchFromUrl = async (
    user: User,
    repoUrl: string,
  ): Promise<[string | null, string | null]> => {
    let repoSegments: RepoSegments
    try {
      repoSegments = urlToRepoSegments(repoUrl)
    } catch (ex: any) {
      return [null, ex.message as string]
    }
    try {
      return [
        await this.gitHubService.getDefaultBranch({
          repoName: repoSegments.repo,
          username: repoSegments.owner,
          token: user.pat,
        }),
        null,
      ]
    } catch (ex: any) {
      return [null, ex.message]
    }
  }

  public insertCommunity = async (projectUrl: string): Promise<string[]> => {
    const user = await this.userService.getUser()
    if (user == null)
      return ['Unauthorized. Please log in to join a new community']
    if (projectUrl === '') {
      return [`Community URL is a required field.`]
    }

    const projectRepoUrl = projectUrl.replace(/(\/|\.git)$/i, '')
    const communityName = projectRepoUrl.split('/').at(-1)!
    const communityUrl = `${projectRepoUrl.replace(
      /-gov\.public$/i,
      '',
    )}-gov.public.git`
    const privateCommunityUrl = `${projectRepoUrl.replace(
      /-gov\.public$/i,
      '',
    )}-gov.private.git`

    const [, projectRepoError] = await this.getDefaultBranchFromUrl(
      user,
      projectRepoUrl,
    )
    if (projectRepoError != null) {
      return [projectRepoError]
    }

    const [communityMainBranch, communityRepoError] =
      await this.getDefaultBranchFromUrl(user, communityUrl)
    if (communityRepoError != null) {
      return [communityRepoError]
    }

    const configPath = resolve(
      this.configDir,
      (await hashString(communityUrl)) + '.json',
    )

    const community = {
      url: communityUrl,
      privateUrl: privateCommunityUrl,
      branch: communityMainBranch!,
      name: communityName,
      projectUrl: projectRepoUrl,
      configPath,
      selected: false,
    }
    const communityCount = await this.db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(communities)
    const currentCommunity = (
      await this.db
        .insert(communities)
        .values(community)
        .onConflictDoUpdate({
          target: communities.url,
          set: community,
        })
        .returning()
    )[0]!
    if (communityCount.length === 0 || communityCount[0]?.count === 0) {
      await this.selectCommunity(community.url)
    }

    await this.settingsService.generateConfig(user, currentCommunity)

    const syncedCommunity = await this.syncCommunity(user, currentCommunity)

    await this.requestToJoin(user, syncedCommunity)

    return []
  }
}
