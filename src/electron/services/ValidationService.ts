import { eq } from 'drizzle-orm'
import { existsSync } from 'fs'

import { AbstractValidationService, type ServiceResponse } from '~/shared'

import { DB } from '../db/db.js'
import { communities, type Community, type User, users } from '../db/schema.js'
import { urlToRepoSegments } from '../lib/github.js'
import { CommunityService } from './CommunityService.js'
import { GitHubService } from './GitHubService.js'
import { Gov4GitService } from './Gov4GitService.js'
import { Services } from './Services.js'
import { SettingsService } from './SettingsService.js'
import { UserService } from './UserService.js'

export type ValidationServiceOptions = {
  services: Services
}

export class ValidationService extends AbstractValidationService {
  private declare readonly services: Services
  private declare readonly communityService: CommunityService
  private declare readonly userService: UserService
  private declare readonly settingsService: SettingsService
  private declare readonly db: DB
  private declare readonly gitHubService: GitHubService
  private declare readonly govService: Gov4GitService

  constructor({ services }: ValidationServiceOptions) {
    super()
    this.services = services
    this.communityService = this.services.load<CommunityService>('community')
    this.userService = this.services.load<UserService>('user')
    this.settingsService = this.services.load<SettingsService>('settings')
    this.db = this.services.load<DB>('db')
    this.gitHubService = this.services.load<GitHubService>('github')
    this.govService = this.services.load<Gov4GitService>('gov4git')
  }

  private validateUserCredentials = async (
    user: User,
  ): Promise<ServiceResponse<null>> => {
    if (user.username === '' || user.pat === '') {
      return {
        ok: false,
        statusCode: 401,
        error: 'Missing user credentials. Please login.',
      }
    }

    try {
      await this.gitHubService.getAuthenticatedUser(user.pat)
      return {
        ok: true,
        statusCode: 200,
        data: null,
      }
    } catch (ex: any) {
      if (ex instanceof Error) {
        console.log(`======================== ${ex.message}`)
        try {
          const error = JSON.parse(ex.message)
          if ('status' in error && error.status === 500) {
            return {
              ok: false,
              statusCode: 400,
              error: `Failed to reach https://api.github.com. The Service may be down. Please try again at a later time.`,
            }
          } else {
            return {
              ok: false,
              statusCode: 401,
              error: 'User credentials have expired. Please login.',
            }
          }
        } catch (error) {
          return {
            ok: false,
            statusCode: 500,
            error: `${ex}`,
          }
        }
      } else {
        return {
          ok: false,
          statusCode: 500,
          error: `${ex}`,
        }
      }
    }
  }

  private repoExists = async (
    user: User,
    repoUrl: string,
  ): Promise<boolean> => {
    const repoSegments = urlToRepoSegments(repoUrl)

    return this.gitHubService.doesRepoExist({
      repoName: repoSegments.repo,
      username: repoSegments.owner,
      token: user.pat,
    })
  }

  private validateIdRepos = async (
    user: User,
  ): Promise<ServiceResponse<null>> => {
    const repos: string[] = [user.memberPublicUrl, user.memberPrivateUrl]

    for (const repoUrl of repos) {
      const repoExists = await this.repoExists(user, repoUrl)
      if (!repoExists) {
        return {
          ok: false,
          statusCode: 401,
          error: `Missing personal identity repo ${repoUrl}. Please try logging in to resolve the issue.`,
        }
      }
    }

    return {
      ok: true,
      statusCode: 200,
      data: null,
    }
  }

  private getUser = async (): Promise<User | null> => {
    return (await this.db.select().from(users).limit(1))[0] ?? null
  }

  private validateUser = async (
    user: User | null,
  ): Promise<ServiceResponse<null>> => {
    if (user == null) {
      return {
        ok: false,
        statusCode: 401,
        error: 'Unauthenticated. Please login.',
      }
    }

    const credentialsValidation = await this.validateUserCredentials(user)
    if (!credentialsValidation.ok) {
      return credentialsValidation
    }

    const idRepoValidation = await this.validateIdRepos(user)
    if (!idRepoValidation.ok) {
      return idRepoValidation
    }

    return {
      ok: true,
      statusCode: 200,
      data: null,
    }
  }

  private validateCommunityRepos = async (
    user: User,
    community: Community,
  ): Promise<ServiceResponse<null>> => {
    const projectRepoExists = await this.repoExists(user, community.projectUrl)
    if (!projectRepoExists) {
      return {
        ok: false,
        statusCode: 404,
        error: `404. ${community.projectUrl} does not exist or is not public.`,
      }
    }

    const communityRepoExists = await this.repoExists(user, community.url)
    if (!communityRepoExists) {
      return {
        ok: false,
        statusCode: 400,
        error: `${community.projectUrl} is not a Gov4Git managed repo.`,
      }
    }

    return {
      ok: true,
      statusCode: 200,
      data: null,
    }
  }

  private validateConfigFile = async (
    user: User,
    community: Community,
  ): Promise<ServiceResponse<null>> => {
    if (!existsSync(community.configPath)) {
      const createConfigResponse = await this.settingsService.generateConfig(
        user,
        community,
      )
      if (!createConfigResponse.ok) {
        return createConfigResponse
      }
      return {
        ok: true,
        statusCode: 201,
        data: null,
      }
    }

    return {
      ok: true,
      statusCode: 200,
      data: null,
    }
  }

  private getCommunity = async (): Promise<Community | null> => {
    return (
      (
        await this.db
          .select()
          .from(communities)
          .where(eq(communities.selected, true))
          .limit(1)
      )[0] ?? null
    )
  }

  private validateCommunity = async (
    user: User,
    community: Community | null,
  ): Promise<ServiceResponse<null>> => {
    if (community == null) {
      return {
        ok: false,
        statusCode: 401,
        error: `No selected community. Please select or join a community`,
      }
    }

    const repoValidation = await this.validateCommunityRepos(user, community)
    if (!repoValidation.ok) {
      return repoValidation
    }

    const configValidation = await this.validateConfigFile(user, community)
    if (!configValidation.ok) {
      return configValidation
    }

    const initializeResponse = await this.govService.initId()
    return initializeResponse
  }

  public validate = async (): Promise<ServiceResponse<null>> => {
    const user = await this.getUser()
    const userValidation = await this.validateUser(user)
    if (!userValidation.ok) {
      return userValidation
    }

    const community = await this.getCommunity()
    const communityValidation = await this.validateCommunity(user!, community)
    if (!communityValidation.ok) {
      return communityValidation
    }

    return {
      ok: true,
      statusCode: 200,
      data: null,
    }
  }
}
