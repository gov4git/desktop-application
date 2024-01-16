import { afterAll, beforeAll, describe } from '@jest/globals'
import { rm } from 'fs/promises'
import { resolve } from 'path'

import { DB, loadDb } from '../src/electron/db/db.js'
import { migrateDb } from '../src/electron/db/migrate.js'
import {
  CommunityService,
  GitService,
  Gov4GitService,
  LogService,
  MotionService,
  Services,
  SettingsService,
  UserService,
  ValidationService,
} from '../src/electron/services/index.js'
// eslint-disable-next-line
// import runBallotTests from './BallotService.test'
// eslint-disable-next-line
import runCommunityTests from './CommunityService.test'
import { config } from './config.js'
// eslint-disable-next-line
import runGitTests from './GitService.test'
// eslint-disable-next-line
import runMotionTests from './MotionService.test'
// eslint-disable-next-line
import runSettingsTests from './SettingsService.test'
// eslint-disable-next-line
import runUserTests from './UserService.test'

const services = new Services()

beforeAll(async () => {
  const loggingService = new LogService(resolve(config.configDir, 'logs.txt'))
  services.register('log', loggingService)
  const dbService = await loadDb(config.dbPath)
  await migrateDb(config.dbPath)
  services.register('db', dbService)
  const gitService = new GitService()
  services.register('git', gitService)
  const govService = new Gov4GitService(services)
  services.register('gov4git', govService)
  const settingsService = new SettingsService({
    services,
  })
  services.register('settings', settingsService)

  const userService = new UserService({
    services,
    identityRepoName: config.identityName,
  })
  services.register('user', userService)
  const communityService = new CommunityService({
    services,
    configDir: config.configDir,
  })
  services.register('community', communityService)
  const motionService = new MotionService({
    services,
  })
  services.register('motion', motionService)
  const validationService = new ValidationService({
    services,
  })
  services.register('validation', validationService)

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
    false,
  )
  await gitService.initializeRemoteRepo(
    config.privateCommunityUrl,
    config.user,
    true,
    false,
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
  await gitService.deleteRepo(config.privateCommunityUrl, config.user)
  loggingService.close()
  dbService.close()
  await rm(config.configDir, { recursive: true, force: true })
})

describe('Run tests', () => {
  runGitTests()
  runUserTests(services)
  runCommunityTests(services)
  runSettingsTests(services)
  runMotionTests(services)
})
