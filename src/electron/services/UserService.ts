import { existsSync, rmSync } from 'node:fs'

import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device'
import type {
  OAuthAppAuthentication,
  Verification,
} from '@octokit/auth-oauth-device/dist-types/types.js'
import { request } from '@octokit/request'
import { eq } from 'drizzle-orm'

import { AbstractUserService, serialAsync } from '~/shared'

import { DB } from '../db/db.js'
import { communities, motions, User, UserInsert, users } from '../db/schema.js'
import { GitService } from './GitService.js'
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
  private declare authVerification: Verification | null
  private declare authorization: Promise<OAuthAppAuthentication> | null

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
    this.authVerification = null
    this.authorization = null
  }

  private deleteDBTables = async () => {
    await Promise.all([
      this.db.delete(users),
      this.db.delete(motions),
      this.db.delete(communities),
    ])
  }

  private requireFields = (username: string, pat: string): string[] => {
    const errors: string[] = []
    if (username.trim() === '') {
      errors.push('Username is a required field')
    }
    if (pat.trim() === '') {
      errors.push('Personal Access Token is a required field')
    }
    return errors
  }

  public validateUser = async (
    username: string,
    pat: string,
  ): Promise<string[]> => {
    username = username.toLowerCase().trim()
    pat = pat.trim()
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
    username = username.toLowerCase().trim()
    pat = pat.trim()
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
    username = username.toLowerCase().trim()
    pat = pat.trim()
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

  public getUser = async (): Promise<User | null> => {
    const userInfo = (await this.db.select().from(users).limit(1))[0]

    return userInfo ?? null
  }

  /**
   * Access token login
   */

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

  private awaitAuthCode = async (): Promise<Verification> => {
    return new Promise((res) => {
      const interval = setInterval(() => {
        if (this.authVerification != null) {
          clearInterval(interval)
          res(this.authVerification)
        }
      }, 100)
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

    const requestWithAuth = request.defaults({
      headers: {
        authorization: `Bearer ${user.pat}`,
      },
    })

    const userInfo: Partial<User> = {}

    for (const repo of repos) {
      const repoUrl = `${this.repoUrlBase}/${user.username}/${repo}.git`
      const keyPrefix = repo.endsWith('private')
        ? 'memberPrivate'
        : 'memberPublic'
      userInfo[`${keyPrefix}Url`] = repoUrl
      try {
        const existingRepo = await requestWithAuth(
          'GET /repos/{owner}/{repo}',
          {
            owner: user.username,
            repo: repo,
          },
        )
        userInfo[`${keyPrefix}Branch`] = existingRepo.data.default_branch
      } catch (ex: any) {
        if (ex.status === 404) {
          try {
            await requestWithAuth('POST /user/repos', {
              name: repo,
              private: repo.endsWith('private'),
              auto_init: false,
            })
            userInfo[`${keyPrefix}Branch`] = 'main'
          } catch (er) {
            errors.push(
              `Error initializing ${repo}. ${ex.status}: ${ex.response.data.message}`,
            )
          }
        } else {
          errors.push(
            `Error checking satus of ${repo}. ${ex.status}: ${ex.response.data.message}`,
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
    this.authVerification = null
    this.authorization = null
    const auth = createOAuthDeviceAuth({
      clientType: 'oauth-app',
      clientId: '912c0ab18e0f0b4a1abe',
      scopes: ['repo'],
      onVerification: (verification) => {
        this.authVerification = verification
      },
    })

    this.authorization = auth({ type: 'oauth' })
    return this.awaitAuthCode()
  }

  public finishLoginFlow = async (): Promise<string[] | null> => {
    if (this.authorization == null) {
      return null
    }

    const errors: string[] = []
    let tokenInfo: OAuthAppAuthentication
    try {
      tokenInfo = await this.authorization
    } catch (ex: any) {
      return [`Failed to log in. ${ex.response.data.error}`]
    }
    const scopes = tokenInfo.scopes[0]!.split(',')
    if (!scopes.includes('repo')) {
      errors.push(
        'Authorization has insufficient privileges. Must approve the repo scope.',
      )
    }
    if (errors.length > 0) {
      return errors
    }

    const requestWithAuth = request.defaults({
      headers: {
        authorization: `Bearer ${tokenInfo.token}`,
      },
    })

    let username = ''
    try {
      const response = await requestWithAuth('GET /user')
      username = response.data.login.toLowerCase()
    } catch (ex: any) {
      return [
        `Error retreiving user info. ${ex.status}: ${ex.response.data.message}`,
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
