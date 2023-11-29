import { and, eq } from 'drizzle-orm'

import { AbstractUserService, serialAsync } from '~/shared'

import { DB } from '../db/db.js'
import {
  ballots,
  communities,
  userCommunities,
  UserInsert,
  users,
} from '../db/schema.js'
import { GitService } from './GitService.js'
import { Gov4GitService } from './Gov4GitService.js'
import { Services } from './Services.js'

export type UserServiceOptions = {
  services: Services
  identityRepoName?: string
}
export class UserService extends AbstractUserService {
  private declare readonly services: Services
  private declare readonly identityRepoName: string
  private declare readonly repoUrlBase: string
  private declare readonly db: DB
  private declare readonly gitService: GitService
  private declare readonly govService: Gov4GitService

  constructor({
    services,
    identityRepoName = 'gov4git-identity',
  }: UserServiceOptions) {
    super()
    this.services = services
    this.identityRepoName = identityRepoName
    this.repoUrlBase = 'https://github.com'
    this.db = this.services.load<DB>('db')
    this.gitService = this.services.load<GitService>('git')
    this.govService = this.services.load<Gov4GitService>('gov4git')
  }

  private deleteDBTables = async () => {
    await this.db.delete(userCommunities)
    await Promise.all([
      this.db.delete(users),
      this.db.delete(ballots),
      this.db.delete(communities),
    ])
  }

  private requireFields = (username: string, pat: string): string[] => {
    const errors: string[] = []
    if (username === '') {
      errors.push('Username is a required field')
    }
    if (pat === '') {
      errors.push('Personal Access Token is a required field')
    }
    return errors
  }

  public validateUser = async (
    username: string,
    pat: string,
  ): Promise<string[]> => {
    const missingErrors = this.requireFields(username, pat)
    if (missingErrors.length > 0) {
      return missingErrors
    }
    const errors: string[] = []
    const scopes = await this.gitService.getOAuthScopes(pat)
    if (!scopes.includes('repo')) {
      errors.push(
        'Personal Access Token has insufficient privileges. Please ensure PAT has rights to top-level repo scope.',
      )
      return errors
    }

    if (
      !(await this.gitService.doesUserExist({
        username,
        pat,
      }))
    ) {
      errors.push(`Invalid user credentials`)
    }

    return errors
  }

  private getOpenBallots = async () => {
    const community = (
      await this.db
        .select()
        .from(communities)
        .where(eq(communities.selected, true))
    )[0]
    if (community == null) {
      return []
    }
    const results = await this.db
      .select()
      .from(ballots)
      .where(and(eq(ballots.status, 'open')))
    return results
  }

  private isCommunityMember = async (
    username: string,
  ): Promise<string | null> => {
    const command = ['group', 'list', '--name', 'everybody']
    const users = await this.govService.mustRun<string[]>(...command)
    const existingInd = users.findIndex((u) => {
      return u.toLocaleLowerCase() === username.toLocaleLowerCase()
    })
    if (existingInd !== -1) {
      return users[existingInd]!
    }
    return null
  }

  private getVotingCredits = async (username: string): Promise<number> => {
    const command = [
      'balance',
      'get',
      '--user',
      username,
      '--key',
      'voting_credits',
    ]
    const [credits, openTallies] = await Promise.all([
      this.govService.mustRun<number>(...command),
      this.getOpenBallots(),
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

  private validateIdRepo = async (
    username: string,
    pat: string,
    isPrivate: boolean,
  ) => {
    const url = `${this.repoUrlBase}/${username}/${this.identityRepoName}-${
      isPrivate ? 'private' : 'public'
    }.git`

    if (!(await this.gitService.doesRemoteRepoExist(url, { username, pat }))) {
      await this.gitService.initializeRemoteRepo(
        url,
        { username, pat },
        isPrivate,
      )
    }

    const branch =
      (await this.gitService.getDefaultBranch(url, { username, pat })) ?? 'main'

    return { url, branch }
  }

  private constructUser = async (
    username: string,
    pat: string,
  ): Promise<UserInsert> => {
    const publicRepo = await this.validateIdRepo(username, pat, false)
    const privateRepo = await this.validateIdRepo(username, pat, true)

    return {
      username,
      pat,
      memberPublicUrl: publicRepo.url,
      memberPublicBranch: publicRepo.branch,
      memberPrivateUrl: privateRepo.url,
      memberPrivateBranch: privateRepo.branch,
    }
  }

  public authenticate = async (
    username: string,
    pat: string,
  ): Promise<string[]> => {
    const validationErrors = await this.validateUser(username, pat)
    if (validationErrors.length > 0) {
      return validationErrors
    }

    const [existingUsers, newUser] = await Promise.all([
      this.db.select().from(users),
      this.constructUser(username, pat),
    ])

    const existingUser = existingUsers[0]
    if (existingUser != null && existingUser.username !== newUser.username) {
      await this.deleteDBTables()
    }

    await this.db.insert(users).values(newUser).onConflictDoUpdate({
      target: users.username,
      set: newUser,
    })
    return []
  }

  public loadUser = serialAsync(async () => {
    const [allUsers, selectedCommunities] = await Promise.all([
      this.db.select().from(users),
      this.db.select().from(communities).where(eq(communities.selected, true)),
    ])
    const user = allUsers[0]
    const community = selectedCommunities[0]

    if (user == null) {
      return {
        users: null,
        communities: null,
        userCommunities: null,
      }
    }
    if (community == null) {
      return {
        users: user,
        communities: null,
        userCommunities: null,
      }
    }

    const newUsername = await this.isCommunityMember(user.username)
    const isMember = newUsername != null
    const votingCredits = isMember
      ? await this.getVotingCredits(newUsername)
      : 0
    const votingScore = Math.sqrt(Math.abs(votingCredits))

    if (newUsername != null && newUsername !== user.username) {
      await this.db
        .update(users)
        .set({ username: newUsername })
        .where(eq(users.username, user.username))
    }

    const userCommunity = {
      userId: newUsername ?? user.username,
      communityId: community.url,
      isMember: isMember,
      isMaintainer: false,
      votingCredits: votingCredits,
      votingScore: votingScore,
    }

    await this.db
      .insert(userCommunities)
      .values(userCommunity)
      .onConflictDoUpdate({
        target: userCommunities.communityId,
        set: userCommunity,
      })

    return {
      users: {
        ...user,
        username: newUsername ?? user.username,
      },
      communities: community,
      userCommunities: userCommunity,
    }
  })

  public getUser = async () => {
    const userInfos = (
      await this.db
        .select()
        .from(userCommunities)
        .rightJoin(
          communities,
          eq(userCommunities.communityId, communities.url),
        )
        .leftJoin(users, eq(userCommunities.userId, users.username))
        .where(eq(communities.selected, true))
        .limit(1)
    )[0]

    if (
      userInfos == null ||
      userInfos.userCommunities == null ||
      userInfos.users == null
    ) {
      const newUserInfo = await this.loadUser()
      if (newUserInfo.users == null) {
        return null
      } else if (newUserInfo.userCommunities == null) {
        return {
          ...newUserInfo.users,
          communityId: '',
          isMember: false,
          isMaintainer: false,
          votingCredits: 0,
          votingScore: 0,
        }
      } else {
        return {
          ...newUserInfo.users,
          communityId: newUserInfo.userCommunities.communityId,
          isMember: newUserInfo.userCommunities.isMember,
          isMaintainer: false,
          votingCredits: newUserInfo.userCommunities.votingCredits,
          votingScore: newUserInfo.userCommunities.votingScore,
        }
      }
    } else {
      return {
        ...userInfos.users,
        communityId: userInfos.userCommunities.communityId,
        isMember: userInfos.userCommunities.isMember,
        isMaintainer: false,
        votingCredits: userInfos.userCommunities.votingCredits,
        votingScore: userInfos.userCommunities.votingScore,
      }
    }
  }
}
