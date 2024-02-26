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

export type DeployCommunityArgs = {
  org: string
  repo: string
  token: string
}

export type UserCredits = {
  username: string
  credits: number
}

export type IssueVotingCreditsArgs = {
  communityUrl: string
  username: string
  credits: string
}

export type ManageIssueArgs = {
  communityUrl: string
  issueNumber: number
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
      community.isMaintainer ||
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

  private getCommunityMembers = async (community: Community) => {
    const command = ['group', 'list', '--name', 'everybody']
    return await this.govService.mustRun<string[]>(command, community)
  }

  private isCommunityMember = async (
    user: User,
    community: Community,
  ): Promise<boolean> => {
    const users = await this.getCommunityMembers(community)
    return users.includes(user.username)
  }

  private isCommunityMaintainer = async (
    community: Community,
  ): Promise<boolean> => {
    const orgs = await this.userService.getUserAdminOrgs()
    const repoSegments = urlToRepoSegments(community.url)
    const ind = orgs.findIndex((o) => {
      return o.organizationName === repoSegments.owner
    })
    return ind !== -1
  }

  private getMembershipStatus = async (user: User, community: Community) => {
    return {
      isMember: await this.isCommunityMember(user, community),
      isMaintainer: await this.isCommunityMaintainer(community),
    }
  }

  private getJoinRequestStatus = async (
    user: User,
    community: Community,
  ): Promise<{ status: 'open' | 'closed'; url: string } | null> => {
    const repoSegments = urlToRepoSegments(community.projectUrl)
    const userJoinRequest = (
      await this.gitHubService.searchRepoIssues({
        repoOwner: repoSegments.owner,
        repoName: repoSegments.repo,
        creator: user.username,
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
    const [membershipStatus, joinRequestStatus] = await Promise.all([
      this.getMembershipStatus(user, community),
      this.getJoinRequestStatus(user, community),
    ])

    const syncedCommunity = (
      await this.db
        .update(communities)
        .set({
          isMember: membershipStatus.isMember,
          isMaintainer: membershipStatus.isMaintainer,
          joinRequestStatus: joinRequestStatus?.status ?? null,
          joinRequestUrl: joinRequestStatus?.url ?? null,
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
      return [null, `${ex}`]
    }
  }

  public insertCommunity = async (
    projectUrl: string,
  ): Promise<[string, string[]]> => {
    const user = await this.userService.getUser()
    if (user == null)
      return ['', ['Unauthorized. Please log in to join a new community']]
    if (projectUrl === '') {
      return ['', [`Community URL is a required field.`]]
    }

    const projectRepoUrl = projectUrl
      .replace(/(\/|\.git)$/i, '')
      .replace(/-gov\.(?:public|private)$/i, '')
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
      return ['', [projectRepoError]]
    }

    const [communityMainBranch, communityRepoError] =
      await this.getDefaultBranchFromUrl(user, communityUrl)
    if (communityRepoError != null) {
      return ['', [communityRepoError]]
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

    const initializationResults = await this.govService.initId()
    if (!initializationResults.ok) {
      return ['', [initializationResults.error]]
    }

    const syncedCommunity = await this.syncCommunity(user, currentCommunity)

    await this.requestToJoin(user, syncedCommunity)

    return [syncedCommunity.url, []]
  }

  public deployCommunity = async ({
    org,
    repo,
    token,
  }: DeployCommunityArgs) => {
    const user = await this.userService.getUser()

    if (user == null) {
      return
    }

    const command = [
      'github',
      'deploy',
      '--token',
      token,
      '--project',
      `${org}/${repo}`,
      '--release',
      'v2.2.0',
    ]
    await this.govService.mustRun(command, undefined, true)

    const projectUrl = `https://github.com/${org}/${repo}`

    const [communityUrl, errors] = await this.insertCommunity(projectUrl)
    const communityCount = await this.db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(communities)
    if (communityCount.length === 0 || communityCount[0]?.count === 1) {
      await this.selectCommunity(communityUrl)
    }

    if (errors.length) {
      throw new Error(JSON.stringify(errors, undefined, 2))
    }
    const community = (
      await this.db
        .select()
        .from(communities)
        .where(eq(communities.projectUrl, projectUrl))
        .limit(1)
    )[0]

    if (community == null) {
      throw new Error(`Failed to insert community while deploying.`)
    }

    await this.govService.mustRun(
      [
        'user',
        'add',
        '--name',
        user.username,
        '--repo',
        user.memberPublicUrl,
        '--branch',
        user.memberPublicBranch,
      ],
      community,
    )
  }

  private getCommunityByUrl = async (url: string) => {
    const community = (
      await this.db
        .select()
        .from(communities)
        .where(eq(communities.url, url))
        .limit(1)
    )[0]

    return community ?? null
  }

  private getUserCredits = async (
    username: string,
    community: Community,
  ): Promise<UserCredits> => {
    const command = [
      'account',
      'balance',
      '--id',
      `user:${username}`,
      '--asset',
      'plural',
    ]
    const credits = await this.govService.mustRun<number>(command, community)
    return { username, credits }
  }

  public getCommunityUsers = async (url: string): Promise<UserCredits[]> => {
    const community = await this.getCommunityByUrl(url)

    if (community == null) {
      throw new Error(
        `Failed to load users for ${url}. Community not present in application.`,
      )
    }

    const users = await this.getCommunityMembers(community)

    return await Promise.all(
      users.map((u) => this.getUserCredits(u, community)),
    )
  }

  public issueVotingCredits = async ({
    communityUrl,
    username,
    credits,
  }: IssueVotingCreditsArgs) => {
    const community = await this.getCommunityByUrl(communityUrl)
    if (community == null) {
      throw new Error(
        `Failed to issue voting credits. ${communityUrl} not present in application.`,
      )
    }
    if (!community.isMaintainer) {
      throw new Error(
        `Failed to issue voting credits. Current user does not have sufficient privileges to issue credits for ${communityUrl}.`,
      )
    }

    const command = [
      'account',
      'issue',
      '--asset',
      'plural',
      '--to',
      `user:${username}`,
      '--quantity',
      credits,
    ]
    await this.govService.mustRun(command, community)
  }

  public getCommunityIssues = async (communityUrl: string) => {
    const user = await this.userService.getUser()
    if (user == null) {
      throw new Error(
        `Faild to load issues for ${communityUrl}. Unauthenticated. Please log in first.`,
      )
    }

    const community = await this.getCommunityByUrl(communityUrl)
    if (community == null) {
      throw new Error(
        `Failed to load issues for ${communityUrl}. ${communityUrl} not present in application.`,
      )
    }
    if (!community.isMaintainer) {
      throw new Error(
        `Failed to load issues for ${communityUrl}. Current user does not have sufficient privileges to view issues.`,
      )
    }

    const repoSegments = urlToRepoSegments(community.projectUrl)
    return await this.gitHubService.searchRepoIssues({
      repoOwner: repoSegments.owner,
      repoName: repoSegments.repo,
      token: user.pat,
      state: 'open',
    })
  }

  public manageIssue = async ({
    communityUrl,
    issueNumber,
  }: ManageIssueArgs) => {
    const user = await this.userService.getUser()
    if (user == null) {
      throw new Error(
        `Faild to manage issue #${issueNumber} for ${communityUrl}. Unauthenticated. Please log in first.`,
      )
    }

    const community = await this.getCommunityByUrl(communityUrl)
    if (community == null) {
      throw new Error(
        `Failed to manage issue #${issueNumber}for ${communityUrl}. ${communityUrl} not present in application.`,
      )
    }
    if (!community.isMaintainer) {
      throw new Error(
        `Failed to manage issue #${issueNumber} for ${communityUrl}. Current user does not have sufficient privileges to view issues.`,
      )
    }

    const repoSegments = urlToRepoSegments(community.projectUrl)
    await this.gitHubService.updateIssue({
      owner: repoSegments.owner,
      repo: repoSegments.repo,
      token: user.pat,
      issueNumber,
      labels: ['gov4git:pmp-v1'],
    })
  }
}
