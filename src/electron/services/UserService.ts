import { eq } from 'drizzle-orm'
import { existsSync, rmSync } from 'fs'

import { AbstractUserService, serialAsync } from '~/shared'

import { DB } from '../db/db.js'
import { communities, motions, User, users } from '../db/schema.js'
import { GitHubService } from './GitHubService.js'
import { Gov4GitService } from './Gov4GitService.js'
import { Services } from './Services.js'
import { SettingsService } from './SettingsService.js'

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
  private declare readonly settingsService: SettingsService
  private declare readonly govService: Gov4GitService
  private declare initialized: boolean

  constructor({
    services,
    identityRepoName = 'gov4git-identity',
  }: UserServiceOptions) {
    super()
    this.initialized = false
    this.services = services
    this.db = this.services.load<DB>('db')
    this.govService = this.services.load<Gov4GitService>('gov4git')
    this.gitHubService = this.services.load<GitHubService>('github')
    this.settingsService = this.services.load<SettingsService>('settings')
    this.identityRepoName = identityRepoName
    this.repoUrlBase = 'https://github.com'
  }

  private clearData = async () => {
    const allCommunities = await this.db.select().from(communities)

    for (const community of allCommunities) {
      if (existsSync(community.configPath)) {
        rmSync(community.configPath)
      }
    }
    await Promise.all([
      this.db.delete(users),
      this.db.delete(motions),
      this.db.delete(communities),
    ])
  }

  public getUser = serialAsync(async (): Promise<User | null> => {
    const userInfo = (await this.db.select().from(users).limit(1))[0]

    if (!this.initialized) {
      const errors = await this.initializeIdRepos()
      if (errors.length === 0) {
        await this.govService.initId()
      }
      this.initialized = true
    }

    return userInfo ?? null
  })

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

  private initializeIdRepos = serialAsync(async () => {
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
        if (ex instanceof Error) {
          try {
            const error = JSON.parse(ex.message)
            if ('status' in error && error.status === 404) {
              try {
                await this.gitHubService.createRepo({
                  token: user.pat,
                  repoName: repo,
                  isPrivate: repo.endsWith('private'),
                })
                userInfo[`${keyPrefix}Branch`] = 'main'
              } catch (er) {
                errors.push(`Error initializing ${repo}. ${er}`)
              }
            } else {
              errors.push(`Error checking satus of ${repo}. ${ex}`)
            }
          } catch (error) {
            errors.push(`Error checking satus of ${repo}. ${ex}`)
          }
        } else {
          errors.push(`Error checking satus of ${repo}. ${ex}`)
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
      return [`Error retreiving user info. ${ex}`]
    }

    const existingUser = (await this.db.select().from(users).limit(1))[0]

    if (existingUser == null || existingUser.username !== username) {
      await this.clearData()
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

    const idErrors = await this.initializeIdRepos()

    await this.settingsService.generateConfigs()

    return idErrors
  }

  public logout = serialAsync(async () => {
    await this.clearData()
  })

  public getUserAdminOrgs = serialAsync(async () => {
    const user = await this.getUser()
    if (user == null) {
      return []
    }

    return await this.gitHubService.getOrgs({
      token: user.pat,
      state: 'active',
      role: 'admin',
    })
  })

  public getPublicOrgRepos = serialAsync(async (org: string) => {
    const user = await this.getUser()
    if (user == null) {
      return []
    }

    return await this.gitHubService.getOrgRepos({
      org: org,
      token: user.pat,
      type: 'public',
    })
  })
}
