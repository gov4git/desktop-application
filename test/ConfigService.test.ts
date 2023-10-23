import 'dotenv/config'

import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import { existsSync } from 'fs'
import { rm } from 'fs/promises'
import { resolve } from 'path'

import { DB, loadDb } from '../src/electron/db/db.js'
import { migrateDb } from '../src/electron/db/migrate.js'
import {
  ConfigService,
  GitService,
  type GitUserInfo,
  Gov4GitService,
  LogService,
  Services,
} from '../src/electron/services/index.js'

const user: GitUserInfo = {
  username: process.env['GH_USER']!,
  pat: process.env['GH_TOKEN']!,
}
const baseUrl = 'https://github.com'
const identityName = 'test-gov4git-identity'
const projectRepo = `${baseUrl}/${user.username}/test-gov4git-project-repo`
const communityUrl = `${projectRepo}-gov.public.git`
const publicRepo = `${baseUrl}/${user.username}/${identityName}-public.git`
const privateRepo = `${baseUrl}/${user.username}/${identityName}-private.git`

const configDir = resolve(__dirname, 'config')
const dbPath = resolve(configDir, 'gov4git.db')
const services = new Services()
let dbService: DB
let loggingService: LogService
let gitService: GitService
let govService: Gov4GitService
let configService: ConfigService

beforeAll(async () => {
  dbService = await loadDb(dbPath)
  await migrateDb(dbPath)
  services.register('db', dbService)
  loggingService = new LogService(resolve(configDir, 'logs.txt'))
  services.register('log', loggingService)
  gitService = new GitService()
  services.register('git', gitService)
  govService = new Gov4GitService(services)
  services.register('gov4git', govService)
  configService = new ConfigService(services, configDir, identityName)
  await gitService.initializeRemoteRepo(projectRepo, user, false, true)
  await gitService.initializeRemoteRepo(communityUrl, user, false, true)
}, 30000)

afterAll(async () => {
  await gitService.deleteRepo(projectRepo, user)
  await gitService.deleteRepo(communityUrl, user)
  await gitService.deleteRepo(publicRepo, user)
  await gitService.deleteRepo(privateRepo, user)
  loggingService.close()
  dbService.close()
  await rm(configDir, { recursive: true, force: true })
}, 30000)

describe('Setup and teardown', () => {
  test('Setup', async () => {
    // Act
    const shouldNotExist = !(await gitService.doesRemoteRepoExist(
      publicRepo,
      user,
    ))
    const shouldNotExist2 = !(await gitService.doesRemoteRepoExist(
      privateRepo,
      user,
    ))
    await configService.createOrUpdateConfig({
      user: user,
      project_repo: projectRepo,
    })
    const shouldExist = await gitService.doesRemoteRepoExist(publicRepo, user)
    const shouldExist2 = await gitService.doesRemoteRepoExist(privateRepo, user)
    // Assert
    expect(shouldNotExist).toEqual(true)
    expect(shouldNotExist2).toEqual(true)
    expect(shouldExist).toEqual(true)
    expect(shouldExist2).toEqual(true)
  }, 30000)

  test('teardown', async () => {
    // Act
    const availableConfigs = await configService.getAvailableConfigs()
    const existingInd = availableConfigs.findIndex(
      (c) => c.communityUrl === communityUrl,
    )
    const selectedConfigPath = availableConfigs[existingInd]!.path
    await configService.selectConfig(communityUrl)
    const shouldNotBeNull = await configService.getConfig()

    const fileShouldExist = existsSync(selectedConfigPath)

    await configService.deleteConfig(projectRepo)
    const nowAvailableConfigs = await configService.getAvailableConfigs()
    const nonExisitingInd = nowAvailableConfigs.findIndex(
      (c) => c.communityUrl === communityUrl,
    )
    const fileShouldNotExist = !existsSync(selectedConfigPath)
    await configService.selectConfig(communityUrl)
    const shouldBeNull = await configService.getConfig()
    // Assert
    expect(existingInd).not.toEqual(-1)
    expect(shouldNotBeNull).not.toBeNull()
    expect(fileShouldExist).toEqual(true)
    expect(nonExisitingInd).toEqual(-1)
    expect(fileShouldNotExist).toEqual(true)
    expect(shouldBeNull).toBeNull()

    // Cleanup
    await gitService.deleteRepo(publicRepo, user)
    await gitService.deleteRepo(privateRepo, user)
    const noLongerExists = !(await gitService.doesRemoteRepoExist(
      publicRepo,
      user,
    ))
    const noLongerExists2 = !(await gitService.doesRemoteRepoExist(
      publicRepo,
      user,
    ))
    expect(noLongerExists).toEqual(true)
    expect(noLongerExists2).toEqual(true)
  }, 30000)
})

describe('Partial Initialization', () => {
  test('Initialize from existing repos', async () => {
    // Act
    await gitService.initializeRemoteRepo(publicRepo, user, false)
    await gitService.initializeRemoteRepo(privateRepo, user, true)
    const shouldExist = await gitService.doesRemoteRepoExist(publicRepo, user)
    const shouldExist2 = await gitService.doesRemoteRepoExist(privateRepo, user)
    const shouldNotHaveCommits = !(await gitService.hasCommits(
      publicRepo,
      user,
    ))
    const shouldNotHaveCommits2 = !(await gitService.hasCommits(
      privateRepo,
      user,
    ))

    await configService.createOrUpdateConfig({
      user: user,
      project_repo: projectRepo,
    })
    await new Promise((res) => {
      setTimeout(res, 5000)
    })
    const shouldHaveCommits = await gitService.hasCommits(publicRepo, user)
    const shouldHaveCommits2 = await gitService.hasCommits(privateRepo, user)

    // Assert
    expect(shouldExist).toEqual(true)
    expect(shouldExist2).toEqual(true)
    expect(shouldNotHaveCommits).toEqual(true)
    expect(shouldNotHaveCommits2).toEqual(true)
    expect(shouldHaveCommits).toEqual(true)
    expect(shouldHaveCommits2).toEqual(true)
  }, 30000)
})
