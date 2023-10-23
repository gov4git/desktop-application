import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { eq } from 'drizzle-orm'
import validator from 'validator'

import { AbstractConfigService, Config, ConfigMeta } from '~/shared'

import { DB } from '../db/db.js'
import {
  configs,
  configStore,
  ConfigStoreDB,
  InsertConfigDB,
  InsertConfigStoreDB,
} from '../db/schema.js'
import { hashString, toResolvedPath } from '../lib/paths.js'
import { mergeDeep } from '../lib/records.js'
import { GitService, GitUserInfo } from './GitService.js'
import { Gov4GitService } from './Gov4GitService.js'
import { Services } from './Services.js'

export class ConfigService extends AbstractConfigService {
  protected declare configDir: string
  protected declare services: Services
  protected declare gitService: GitService
  protected declare govService: Gov4GitService
  protected declare db: DB
  protected declare identityRepoName: string

  constructor(
    services: Services,
    configDir = '~/.gov4git',
    identityRepoName = 'gov4git-identity',
  ) {
    super()
    this.configDir = toResolvedPath(configDir)
    this.services = services
    this.db = this.services.load<DB>('db')
    this.gitService = this.services.load<GitService>('git')
    this.govService = this.services.load<Gov4GitService>('gov4git')
    this.identityRepoName = identityRepoName
  }

  protected getSelectedConfig = async (): Promise<ConfigStoreDB | null> => {
    const configs = await this.db.select().from(configStore).limit(1)
    if (configs.length === 0) return null
    return configs[0]!
  }

  protected readConfig = async (configPath: string): Promise<Config | null> => {
    const confPath = resolve(this.configDir, configPath)
    if (!existsSync(confPath)) return null
    try {
      const configContents = await readFile(confPath, 'utf-8')
      const config = JSON.parse(configContents) as Config
      return config
    } catch (ex) {
      throw new Error(`Unable to load config ${confPath}. Error: ${ex}`)
    }
  }

  public getConfig = async (): Promise<Config | null> => {
    const selectedConfig = await this.getSelectedConfig()
    if (selectedConfig == null) return null
    const config = await this.readConfig(selectedConfig.path)
    if (config != null) {
      this.govService.setConfigPath(selectedConfig.path)
      const configRecord = {
        communityUrl: selectedConfig.communityUrl,
        path: selectedConfig.path,
        name: selectedConfig.name,
        projectUrl: selectedConfig.projectUrl,
      }
      await this.db.insert(configs).values(configRecord).onConflictDoUpdate({
        target: configs.communityUrl,
        set: configRecord,
      })
    }
    return config
  }

  public deleteConfig = async (url: string) => {
    const communityUrl = this.getCommunityUrl(url)
    this.throwIfNotUrl(communityUrl, 'deleteConfig')
    const confToDelete = (
      await this.db
        .select()
        .from(configs)
        .where(eq(configs.communityUrl, communityUrl))
        .limit(1)
    )[0]
    if (confToDelete != null) {
      if (existsSync(confToDelete.path)) {
        await rm(confToDelete.path)
      }
      await this.db
        .delete(configs)
        .where(eq(configs.communityUrl, communityUrl))
    }
    const newConf = (await this.db.select().from(configs).limit(1))[0]
    const selectedConfig = (
      await this.db.select().from(configStore).limit(1)
    )[0]
    if (
      selectedConfig != null &&
      selectedConfig.communityUrl === communityUrl
    ) {
      if (newConf != null) {
        const insertRecord: InsertConfigStoreDB = {
          id: 1,
          ...newConf,
        }
        await this.db
          .insert(configStore)
          .values(insertRecord)
          .onConflictDoUpdate({
            target: configStore.id,
            set: insertRecord,
          })
      } else {
        await this.db.delete(configStore)
      }
    }
  }

  public getAvailableConfigs = async (): Promise<ConfigMeta[]> => {
    return await this.db.select().from(configs)
  }

  protected isUrl = (url: string): boolean => {
    return validator.isURL(url)
  }

  protected throwIfNotUrl = (url: string, from: string) => {
    if (!this.isUrl(url)) {
      throw new Error(`${url} is not a valid url. From: ${from}`)
    }
  }

  protected getCommunityName = (url: string): string => {
    const projectUrl = this.getProjectUrl(url)
    return projectUrl.split('/').at(-1)!
  }

  protected getCommunityUrl = (url: string): string => {
    return `${url
      .replace(/\.git/i, '')
      .replace(/-gov\.public$/i, '')}-gov.public.git`
  }

  protected getProjectUrl = (url: string): string => {
    return `${url.replace(/\.git/i, '').replace(/-gov\.public$/i, '')}`
  }

  protected write = async (location: string, obj: any) => {
    const path = resolve(this.configDir, location)
    const dir = dirname(path)
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    await writeFile(path, JSON.stringify(obj, undefined, 2), 'utf-8')
  }

  protected getConfigFilePath = async (url: string) => {
    this.throwIfNotUrl(url, 'getConfigFilePath')
    const communityUrl = this.getCommunityUrl(url)
    return resolve(this.configDir, (await hashString(communityUrl)) + '.json')
  }

  public selectConfig = async (url: string) => {
    this.throwIfNotUrl(url, 'selectConfig')
    const projectUrl = this.getProjectUrl(url)
    const communityUrl = this.getCommunityUrl(url)
    const configPath = await this.getConfigFilePath(communityUrl)
    const communityName = this.getCommunityName(communityUrl)
    const configStoreRecord: InsertConfigStoreDB = {
      id: 1,
      communityUrl,
      projectUrl,
      name: communityName,
      path: configPath,
    }
    this.govService.setConfigPath(configPath)
    await this.db
      .insert(configStore)
      .values(configStoreRecord)
      .onConflictDoUpdate({
        target: configStore.id,
        set: configStoreRecord,
      })
  }

  public createOrUpdateConfig = async (
    config: Partial<Config>,
  ): Promise<string[]> => {
    let newConfig: Partial<Config> = config
    if (newConfig.gov_public_url) {
      await this.selectConfig(newConfig.gov_public_url)
    }
    const currentConfig = await this.getConfig()
    newConfig = mergeDeep({}, structuredClone(currentConfig ?? {}), newConfig)

    const errors = await this.validateConfig(newConfig)
    if (errors.length > 0) return errors

    const fullConfig = newConfig as Config
    if (fullConfig.gov_public_url) {
      await this.selectConfig(fullConfig.gov_public_url)
    }
    await this.write(
      await this.getConfigFilePath(fullConfig.gov_public_url),
      fullConfig,
    )
    const insertRecord: InsertConfigDB = {
      communityUrl: fullConfig.gov_public_url,
      name: fullConfig.community_name,
      path: await this.getConfigFilePath(fullConfig.gov_public_url),
      projectUrl: fullConfig.project_repo,
    }
    await this.db.insert(configs).values(insertRecord).onConflictDoUpdate({
      target: configs.communityUrl,
      set: insertRecord,
    })
    await this.runGov4GitInit(fullConfig)
    return errors
  }

  protected runGov4GitInit = async (config: Partial<Config>) => {
    const user = config.user!
    const isPublicEmpty = !(await this.gitService.hasCommits(
      config.member_public_url!,
      user,
    ))
    const isPrivateEmpty = !(await this.gitService.hasCommits(
      config.member_private_url!,
      user,
    ))

    if (isPublicEmpty || isPrivateEmpty) {
      this.govService.mustRun('init-id')
    }
  }

  public validateSettings = async (): Promise<string[]> => {
    const config = await this.getConfig()
    if (config == null) return []
    return this.validateConfig(config)
  }

  protected validateConfig = async (
    config: Partial<Config>,
  ): Promise<string[]> => {
    let errors: string[] = []

    errors = [...this.requireFields(config)]
    if (errors.length > 0) return errors

    errors = [...(await this.validateUser(config))]
    if (errors.length > 0) return errors

    errors = [...(await this.validatePublicCommunityUrl(config))]
    if (errors.length > 0) return errors

    await this.validateIdentityRepos(config)
    this.validateAuthTokens(config)

    return errors
  }

  protected requireFields = (config: Partial<Config>): string[] => {
    const errors: string[] = []
    if (
      !('user' in config) ||
      !('username' in config.user!) ||
      config.user.username === ''
    ) {
      errors.push(`Username is required. Please provide a username`)
    }

    if (
      !('user' in config) ||
      !('pat' in config.user!) ||
      config.user.pat === ''
    ) {
      errors.push(
        `Personal Access Token is required. Please provide a valid GitHub Access Token`,
      )
    }

    config.project_repo = (config.project_repo ?? '').replace(
      /(\/|\.git)$/i,
      '',
    )

    config.community_name = config.project_repo.split('/').at(-1)

    if (
      !('project_repo' in config) ||
      config.project_repo === '' ||
      !validator.isURL(config.project_repo!)
    ) {
      errors.push(
        `Community URL is required. Please enter a valid Community URL.`,
      )
    } else {
      config.gov_public_url = this.getCommunityUrl(config.project_repo)
    }
    return errors
  }

  protected validateUser = async (
    config: Partial<Config>,
  ): Promise<string[]> => {
    const errors: string[] = []
    const user = config.user ?? {}

    if (!(await this.gitService.doesUserExist(user as GitUserInfo))) {
      errors.push(`Invalid user credentials`)
    }

    return errors
  }

  protected validatePublicCommunityUrl = async (
    config: Partial<Config>,
  ): Promise<string[]> => {
    const errors: string[] = []
    const user = config.user!

    if (
      !(await this.gitService.doesRemoteRepoExist(config.gov_public_url!, user))
    ) {
      errors.push(
        `Community url, ${config.gov_public_url}, does not exist. Please enter a valid community URL.`,
      )
      return errors
    }

    const communityMainBranch =
      (await this.gitService.getDefaultBranch(config.gov_public_url!, user)) ??
      'main'
    config.gov_public_branch = communityMainBranch
    return errors
  }

  protected validateIdentityRepos = async (
    config: Partial<Config>,
  ): Promise<void> => {
    const user = config.user!

    config.member_public_url =
      config.member_public_url ??
      `https://github.com/${user.username}/${this.identityRepoName}-public.git`
    config.member_private_url =
      config.member_private_url ??
      `https://github.com/${user.username}/${this.identityRepoName}-private.git`

    if (
      !(await this.gitService.doesRemoteRepoExist(
        config.member_public_url!,
        user,
      ))
    ) {
      await this.gitService.initializeRemoteRepo(
        config.member_public_url,
        user,
        false,
      )
    }

    config.member_public_branch =
      (await this.gitService.getDefaultBranch(
        config.member_public_url!,
        user,
      )) ?? 'main'

    if (
      !(await this.gitService.doesRemoteRepoExist(
        config.member_private_url!,
        user,
      ))
    ) {
      await this.gitService.initializeRemoteRepo(
        config.member_private_url,
        user,
      )
    }
    config.member_private_branch =
      (await this.gitService.getDefaultBranch(
        config.member_private_url!,
        user,
      )) ?? 'main'
  }

  protected validateAuthTokens = (config: Partial<Config>): void => {
    config.auth = config.auth ?? {}
    const user = config.user!

    config.auth![config.gov_public_url!] = {
      access_token: user.pat!,
    }
    config.auth![config.member_public_url!] = {
      access_token: user.pat!,
    }
    config.auth![config.member_private_url!] = {
      access_token: user.pat!,
    }
  }
}
