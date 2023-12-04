import { eq } from 'drizzle-orm'

import { AbstractUserService, serialAsync } from '~/shared'

import { DB } from '../db/db.js'
import {
  ballots,
  communities,
  FullUser,
  userCommunities,
  UserInsert,
  users,
} from '../db/schema.js'
import { GitService } from './GitService.js'
import { Services } from './Services.js'
import { UserCommunityService } from './UserCommunityService.js'

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
  private declare readonly userCommunityService: UserCommunityService

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
    this.userCommunityService =
      this.services.load<UserCommunityService>('userCommunity')
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
    return await this.gitService.validateUser({
      username,
      pat,
    })
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

    await this.userCommunityService.loadUserCommunities()

    return []
  }

  public loadUser = serialAsync(async (): Promise<FullUser | null> => {
    const user = (await this.db.select().from(users).limit(1))[0]

    if (user == null) {
      return null
    }

    const allUserCommunities =
      await this.userCommunityService.loadUserCommunities()

    return {
      ...user,
      communities: allUserCommunities,
    }
  })

  public getUser = async (): Promise<FullUser | null> => {
    const userInfo = await this.db
      .select()
      .from(userCommunities)
      .innerJoin(users, eq(userCommunities.userId, users.username))
      .innerJoin(communities, eq(userCommunities.communityId, communities.url))

    if (userInfo.length === 0) {
      return await this.loadUser()
    }

    const userRecord = userInfo.reduce<Record<string, FullUser>>((acc, cur) => {
      const user = cur.users
      const userCommunity = cur.userCommunities
      const community = cur.communities

      if (!(user.username in acc)) {
        acc[user.username] = user as FullUser
      }

      const fullUser = acc[user.username]!

      fullUser.communities = [
        ...(fullUser.communities ?? []),
        {
          ...userCommunity,
          ...community,
        },
      ]
      return acc
    }, {})

    return userRecord[userInfo[0]!.users.username]!
  }
}
