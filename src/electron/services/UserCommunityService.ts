import { and, eq, isNull } from 'drizzle-orm'

import { DB } from '../db/db.js'
import {
  ballots,
  communities,
  Community,
  FullUserCommunity,
  User,
  userCommunities,
  UserCommunityInsert,
  users,
} from '../db/schema.js'
import { GitService } from './GitService.js'
import { Gov4GitService } from './Gov4GitService.js'
import { Services } from './Services.js'
import { SettingsService } from './SettingsService.js'

export type UserCommunityServiceOptions = {
  services: Services
}

export class UserCommunityService {
  private declare readonly services: Services
  private declare readonly db: DB
  private declare readonly gitService: GitService
  private declare readonly govService: Gov4GitService
  private declare readonly settingsService: SettingsService

  constructor({ services }: UserCommunityServiceOptions) {
    this.services = services
    this.db = this.services.load<DB>('db')
    this.gitService = this.services.load<GitService>('git')
    this.govService = this.services.load<Gov4GitService>('gov4git')
    this.settingsService = this.services.load<SettingsService>('settings')
  }

  private updateUserCommunities = async () => {
    const rows = await this.db
      .select()
      .from(userCommunities)
      .where(isNull(userCommunities.uniqueId))

    for (const row of rows) {
      const uniqueId = `${row.userId}-${row.communityId}`
      await this.db
        .update(userCommunities)
        .set({
          uniqueId,
        })
        .where(eq(userCommunities.id, row.id))
    }
  }

  private isCommunityMember = async (
    user: User,
    community: Community,
  ): Promise<string | null> => {
    const command = ['group', 'list', '--name', 'everybody']
    const users = await this.govService.mustRun<string[]>(
      command,
      community.configPath,
    )
    const existingInd = users.findIndex((u) => {
      return u.toLocaleLowerCase() === user.username.toLocaleLowerCase()
    })
    if (existingInd !== -1) {
      return users[existingInd]!
    }
    return null
  }

  private getOpenBallots = async (community: Community) => {
    const results = await this.db
      .select()
      .from(ballots)
      .where(
        and(
          eq(ballots.status, 'open'),
          eq(ballots.communityUrl, community.url),
        ),
      )
    return results
  }

  private getVotingCredits = async (
    username: string,
    community: Community,
  ): Promise<number> => {
    const command = [
      'balance',
      'get',
      '--user',
      username,
      '--key',
      'voting_credits',
    ]
    const [credits, openTallies] = await Promise.all([
      this.govService.mustRun<number>(command, community.configPath),
      this.getOpenBallots(community),
    ])
    const totalPendingSpentCredits = openTallies.reduce((acc, cur) => {
      const spentCredits = cur.user.talliedCredits
      const score = cur.user.newScore
      const scoreSign = score < 0 ? -1 : 1
      const totalCredits = scoreSign * Math.pow(score, 2)
      const additionalCosts = Math.abs(totalCredits) - Math.abs(spentCredits)
      return acc + additionalCosts
    }, 0)
    return credits - totalPendingSpentCredits
  }

  private getMembershipStatus = async (
    user: User,
    community: Community,
  ): Promise<{ status: 'open' | 'closed'; url: string } | null> => {
    const userJoinRequest = (
      await this.gitService.searchUserIssues({
        url: community.projectUrl,
        user,
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

  private loadUserCommunity = async (
    user: User,
    community: Community,
  ): Promise<FullUserCommunity> => {
    const newUsername = await this.isCommunityMember(user, community)
    const isMember = newUsername != null
    const votingCredits = isMember
      ? await this.getVotingCredits(newUsername, community)
      : 0
    const votingScore = Math.sqrt(Math.abs(votingCredits))

    if (newUsername != null && newUsername !== user.username) {
      await this.db
        .update(users)
        .set({ username: newUsername })
        .where(eq(users.username, user.username))
    }

    const membership = await this.getMembershipStatus(user, community)

    const userCommunity: UserCommunityInsert = {
      userId: newUsername ?? user.username,
      communityId: community.url,
      uniqueId: `${user.username}-${community.url}`,
      isMember: isMember,
      isMaintainer: false,
      votingCredits: votingCredits,
      votingScore: votingScore,
      ...(membership != null
        ? {
            joinRequestStatus: membership.status,
            joinRequestUrl: membership.url,
          }
        : null),
    }

    const insertedUserCommunity = (
      await this.db
        .insert(userCommunities)
        .values(userCommunity)
        .onConflictDoUpdate({
          target: userCommunities.uniqueId,
          set: userCommunity,
        })
        .returning()
    )[0]!

    return {
      ...insertedUserCommunity,
      ...community,
    }
  }

  public loadUserCommunities = async (): Promise<FullUserCommunity[]> => {
    await this.updateUserCommunities()

    const user = (await this.db.select().from(users).limit(1))[0]

    if (user == null) {
      return []
    }

    const communityRows = await this.db.select().from(communities)

    if (communityRows.length === 0) {
      return []
    }

    await this.settingsService.generateConfigs()

    const updates = communityRows.map((r) => {
      return this.loadUserCommunity(user, r)
    })

    return await Promise.all(updates)
  }
}
