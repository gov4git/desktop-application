import { runGov4Git } from '@gov4git/js-client'
import { eq } from 'drizzle-orm'
import { existsSync } from 'fs'

import { retryAsync, ServiceResponse } from '../../shared/index.js'
import { DB } from '../db/db.js'
import { communities, type Community, type User, users } from '../db/schema.js'
import { urlToRepoSegments } from '../lib/index.js'
import { GitHubService } from './GitHubService.js'
import { LogService } from './LogService.js'
import { Services } from './Services.js'
import { SettingsService } from './SettingsService.js'

export type SuccessResponse<T> = {
  status: 'success'
  returned: T
}

export type ErrorResponse = {
  status: 'error'
  msg: string
}

export type Response<T> = ErrorResponse | SuccessResponse<T>

export class Gov4GitService {
  private declare readonly services: Services
  private declare readonly log: LogService
  private declare readonly db: DB
  private declare readonly settingsService: SettingsService
  private declare readonly gitHubService: GitHubService

  constructor(services: Services) {
    this.services = services
    this.log = this.services.load<LogService>('log')
    this.db = this.services.load<DB>('db')
    this.settingsService = this.services.load<SettingsService>('settings')
    this.gitHubService = this.services.load<GitHubService>('github')
  }

  private getUser = async (): Promise<User | null> => {
    return (await this.db.select().from(users).limit(1))[0] ?? null
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

  private loadConfigPath = async (
    community?: Community,
  ): Promise<ServiceResponse<string>> => {
    const selectedCommunity = community ?? (await this.getCommunity())

    if (selectedCommunity == null) {
      return {
        ok: false,
        statusCode: 401,
        error: `Failed to load config path. Please select a community.`,
      }
    }

    if (!existsSync(selectedCommunity?.configPath)) {
      const user = await this.getUser()
      if (user == null) {
        return {
          ok: false,
          statusCode: 401,
          error: `Unauthenticated. Failed to load config path. Please login.`,
        }
      }
      const response = await this.settingsService.generateConfig(
        user,
        selectedCommunity,
      )
      if (!response.ok) {
        return response
      }
    }

    return {
      ok: true,
      statusCode: 200,
      data: selectedCommunity.configPath,
    }
  }

  private parse = <T>(stdout: string, cmd: string[]): T => {
    try {
      if (stdout.trim() === '') return '' as T
      const response = JSON.parse(stdout ?? '') as Response<T>
      if (response.status === 'error') {
        throw new Error(
          `Gov4Git Error Response for command ${cmd.join(' ')}: ${stdout}`,
        )
      }
      return response.returned
    } catch (ex) {
      throw new Error(
        `Unable to parse stdout for command ${cmd.join(' ')}: ${stdout}`,
      )
    }
  }

  public mustRun = async <T>(
    command: string[],
    community?: Community,
    skipConfig = false,
    configPath = '',
  ): Promise<T> => {
    if (!skipConfig && configPath === '') {
      const configPathResponse = await this.loadConfigPath(community)
      if (!configPathResponse.ok) {
        throw new Error(`${configPathResponse.error}`)
      } else {
        command.push('--config', configPathResponse.data)
      }
    } else if (configPath !== '') {
      command.push('--config', configPath)
    }

    command.push('-v')

    const run = async () => {
      const { stdout, stderr } = await runGov4Git(...command)
      this.log.info('Running Gov4Git')
      this.log.info(`Command: ${command.join(' ')}`)
      this.log.info('Gov4Git Logs:', stderr)
      const output = this.parse<T>(stdout, command)
      this.log.info('Gov4Git Response:', output)
      return output
    }

    try {
      return await retryAsync(run, 2)()
    } catch (ex: any) {
      this.log.error(`Exception running Gov4Git`)
      this.log.error(`Command: ${command.join(' ')}`)
      this.log.error(`stdout: ${ex.stdout}`)
      this.log.error(`stderr: ${ex.stderr}`)
      throw ex
    }
  }

  public initId = async (): Promise<ServiceResponse<null>> => {
    const user = await this.getUser()
    if (user == null) {
      return {
        ok: false,
        statusCode: 401,
        error: `Unauthenticed. Failed to initialize Gov4Git identity repos. Please login.`,
      }
    }
    const publicRepoSegments = urlToRepoSegments(user.memberPublicUrl)
    const isPublicEmpty = !(await this.gitHubService.hasCommits({
      repoName: publicRepoSegments.repo,
      username: publicRepoSegments.owner,
      token: user.pat,
    }))

    const privateRepoSegments = urlToRepoSegments(user.memberPrivateUrl)
    const isPrivateEmpty = !(await this.gitHubService.hasCommits({
      repoName: privateRepoSegments.repo,
      username: privateRepoSegments.owner,
      token: user.pat,
    }))

    if (isPublicEmpty || isPrivateEmpty) {
      try {
        const response = await this.settingsService.generateConfig(user)
        if (!response.ok) {
          return response
        }
        await this.mustRun(['init-id'], undefined, false, response.data)
        return {
          ok: true,
          statusCode: 201,
          data: null,
        }
      } catch (ex) {
        return {
          ok: false,
          statusCode: 500,
          error: `Failed to initialize Gov4Git identity repos. ${ex}`,
        }
      }
    }

    return {
      ok: true,
      statusCode: 200,
      data: null,
    }
  }
}
