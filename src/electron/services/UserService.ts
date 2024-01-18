import { existsSync, rmSync } from 'node:fs'

import { eq } from 'drizzle-orm'

import { AbstractUserService, serialAsync } from '~/shared'

import { DB } from '../db/db.js'
import { communities, motions, User, users } from '../db/schema.js'
import { GitHubService } from './GitHubService.js'
import { Services } from './Services.js'

export type UserServiceOptions = {
  services: Services
  identityRepoName?: string
}
export class UserService extends AbstractUserService {
  private declare readonly services: Services
  private declare readonly gitHubService: GitHubService
  private declare readonly identityRepoName: string
  private declare readonly repoUrlBase: string
  private declare readonly db: DB

  constructor({
    services,
    identityRepoName = 'gov4git-identity',
  }: UserServiceOptions) {
    super()
    this.services = services
    this.db = this.services.load<DB>('db')
    this.gitHubService = this.services.load<GitHubService>('github')
    this.identityRepoName = identityRepoName
    this.repoUrlBase = 'https://github.com'
  }

  private deleteDBTables = async () => {
    await Promise.all([
      this.db.delete(users),
      this.db.delete(motions),
      this.db.delete(communities),
    ])
  }

  public getUser = async (): Promise<User | null> => {
    const userInfo = (await this.db.select().from(users).limit(1))[0]

    return userInfo ?? null
  }

  /**
   * Bypasses interactive user login flow and verification.
   * Only used in unit tests to skip interactive login flow
   */
  public insertUser = async (username: string, pat: string) => {
    await this.db
      .insert(users)
      .values({
        username,
        pat,
        memberPublicUrl: '',
        memberPrivateUrl: '',
        memberPrivateBranch: '',
        memberPublicBranch: '',
      })
      .onConflictDoUpdate({
        target: users.username,
        set: {
          username,
          pat,
        },
      })
  }

  public initializeIdRepos = serialAsync(async () => {
    const errors: string[] = []
    const user = (await this.db.select().from(users).limit(1))[0]

    if (user == null) {
      return [`Cannot create ID repos as user is not logged in.`]
    }

    const repos = [
      `${this.identityRepoName}-public`,
      `${this.identityRepoName}-private`,
    ]

    const userInfo: Partial<User> = {}

    for (const repo of repos) {
      const repoUrl = `${this.repoUrlBase}/${user.username}/${repo}.git`
      const keyPrefix = repo.endsWith('private')
        ? 'memberPrivate'
        : 'memberPublic'
      userInfo[`${keyPrefix}Url`] = repoUrl
      try {
        const existingRepo = await this.gitHubService.getRepoInfo({
          repoName: repo,
          username: user.username,
          token: user.pat,
        })
        userInfo[`${keyPrefix}Branch`] = existingRepo.data.default_branch
      } catch (ex: any) {
        if (ex.status === 404) {
          try {
            await this.gitHubService.createRepo({
              token: user.pat,
              repoName: repo,
              isPrivate: repo.endsWith('private'),
            })
            userInfo[`${keyPrefix}Branch`] = 'main'
          } catch (er) {
            errors.push(
              `Error initializing ${repo}. ${ex.status}: ${JSON.stringify(
                ex,
                undefined,
                2,
              )}`,
            )
          }
        } else {
          errors.push(
            `Error checking satus of ${repo}. ${ex.status}: ${JSON.stringify(
              ex,
              undefined,
              2,
            )}`,
          )
        }
      }
    }
    if (errors.length > 0) {
      return errors
    }

    await this.db
      .update(users)
      .set(userInfo)
      .where(eq(users.username, user.username))

    return []
  })

  public startLoginFlow = async () => {
    return await this.gitHubService.startLoginFlow()
  }

  public finishLoginFlow = async (): Promise<string[] | null> => {
    const [tokenInfo, errors] = await this.gitHubService.finishLoginFlow()

    if (errors.length > 0) {
      return errors
    }
    if (tokenInfo == null) {
      return [`Failed to retrieve access token`]
    }

    let username = ''
    try {
      const response = await this.gitHubService.getAuthenticatedUser(
        tokenInfo.token,
      )
      username = response.data.login.toLowerCase()
    } catch (ex: any) {
      return [
        `Error retreiving user info. ${ex.status}: ${JSON.stringify(
          ex.response.data,
        )}`,
      ]
    }

    const existingUser = (await this.db.select().from(users).limit(1))[0]

    if (existingUser != null && existingUser.username !== username) {
      await this.deleteDBTables()
    }

    await this.db
      .insert(users)
      .values({
        username,
        pat: tokenInfo.token,
        memberPublicUrl: '',
        memberPrivateUrl: '',
        memberPrivateBranch: '',
        memberPublicBranch: '',
      })
      .onConflictDoUpdate({
        target: users.username,
        set: {
          username,
          pat: tokenInfo.token,
        },
      })

    return await this.initializeIdRepos()
  }

  public logout = serialAsync(async () => {
    const allCommunities = await this.db.select().from(communities)

    for (const community of allCommunities) {
      if (existsSync(community.configPath)) {
        rmSync(community.configPath)
      }
    }
    await this.deleteDBTables()
  })
}
