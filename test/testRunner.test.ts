import { afterAll, beforeAll, describe } from '@jest/globals'
import { rm } from 'fs/promises'
import { resolve } from 'path'

import { DB, loadDb } from '../src/electron/db/db.js'
import { migrateDb } from '../src/electron/db/migrate.js'
import {
  BallotService,
  CommunityService,
  GitService,
  Gov4GitService,
  LogService,
  Services,
  SettingsService,
  UserService,
} from '../src/electron/services/index.js'
// eslint-disable-next-line
import runBallotTests from './BallotService.test'
// eslint-disable-next-line
import runCommunityTests from './CommunityService.test'
import { config } from './config.js'
// eslint-disable-next-line
import runGitTests from './GitService.test'
// eslint-disable-next-line
import runSettingsTests from './SettingsService.test'
// eslint-disable-next-line
import runUserTests from './UserService.test'

const services = new Services()

beforeAll(async () => {
  const dbService = await loadDb(config.dbPath)
  await migrateDb(config.dbPath)
  services.register('db', dbService)
  const loggingService = new LogService(resolve(config.configDir, 'logs.txt'))
  services.register('log', loggingService)
  const gitService = new GitService()
  services.register('git', gitService)
  const govService = new Gov4GitService(services)
  services.register('gov4git', govService)
  const userService = new UserService({
    services,
    identityRepoName: config.identityName,
  })
  services.register('user', userService)
  const ballotService = new BallotService({
    services,
  })
  services.register('ballots', ballotService)

  const communityService = new CommunityService({
    services,
    configDir: config.configDir,
  })
  services.register('community', communityService)

  const settingsService = new SettingsService({
    services,
  })
  services.register('settings', settingsService)

  await gitService.initializeRemoteRepo(
    config.projectRepo,
    config.user,
    false,
    true,
  )
  await gitService.initializeRemoteRepo(
    config.communityUrl,
    config.user,
    false,
    true,
  )
}, 30000)

afterAll(async () => {
  const gitService = services.load<GitService>('git')
  const dbService = services.load<DB>('db')
  const loggingService = services.load<LogService>('log')
  await gitService.deleteRepo(config.projectRepo, config.user)
  await gitService.deleteRepo(config.communityUrl, config.user)
  await gitService.deleteRepo(config.publicRepo, config.user)
  await gitService.deleteRepo(config.privateRepo, config.user)
  loggingService.close()
  dbService.close()
  await rm(config.configDir, { recursive: true, force: true })
})

describe('Run tests', () => {
  runGitTests()
  runUserTests(services)
  runCommunityTests(services)
  runSettingsTests(services)
  runBallotTests(services)
})
