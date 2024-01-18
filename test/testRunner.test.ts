import { afterAll, beforeAll, describe } from '@jest/globals'
import { rm } from 'fs/promises'
import { resolve } from 'path'

import { DB, loadDb } from '../src/electron/db/db.js'
import { migrateDb } from '../src/electron/db/migrate.js'
import { urlToRepoSegments } from '../src/electron/lib/github.js'
import {
  CommunityService,
  GitHubService,
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
import runMotionTests from './MotionService.test'
// eslint-disable-next-line
import runSettingsTests from './SettingsService.test'
// eslint-disable-next-line
import runUserTests from './UserService.test'

const services = new Services()

describe('Run tests', () => {
  beforeAll(async () => {
    const loggingService = new LogService(resolve(config.configDir, 'logs.txt'))
    services.register('log', loggingService)
    const dbService = await loadDb(config.dbPath)
    await migrateDb(config.dbPath)
    services.register('db', dbService)
    const gitHubService = new GitHubService({
      services,
      clientId: config.clientId,
    })
    services.register('github', gitHubService)
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

    const projectRepoSegments = urlToRepoSegments(config.projectRepo)
    await gitHubService.createRepo({
      repoName: projectRepoSegments.repo,
      token: config.user.pat,
      isPrivate: false,
      autoInit: true,
    })

    const communityRepoSegments = urlToRepoSegments(config.communityUrl)
    await gitHubService.createRepo({
      repoName: communityRepoSegments.repo,
      token: config.user.pat,
      isPrivate: false,
      autoInit: false,
    })

    const privateCommunityRepoSegments = urlToRepoSegments(
      config.privateCommunityUrl,
    )
    await gitHubService.createRepo({
      repoName: privateCommunityRepoSegments.repo,
      token: config.user.pat,
      isPrivate: true,
      autoInit: false,
    })
  }, 30000)

  afterAll(async () => {
    const gitHubService = services.load<GitHubService>('github')
    const dbService = services.load<DB>('db')
    const loggingService = services.load<LogService>('log')

    const projectRepoSegments = urlToRepoSegments(config.projectRepo)
    await gitHubService.deleteRepo({
      repoName: projectRepoSegments.repo,
      repoOwner: projectRepoSegments.owner,
      token: config.user.pat,
    })

    const communitySegments = urlToRepoSegments(config.communityUrl)
    await gitHubService.deleteRepo({
      repoName: communitySegments.repo,
      repoOwner: communitySegments.owner,
      token: config.user.pat,
    })

    const publicSegments = urlToRepoSegments(config.publicRepo)
    await gitHubService.deleteRepo({
      repoName: publicSegments.repo,
      repoOwner: publicSegments.owner,
      token: config.user.pat,
    })

    const privateSegments = urlToRepoSegments(config.privateRepo)
    await gitHubService.deleteRepo({
      repoName: privateSegments.repo,
      repoOwner: privateSegments.owner,
      token: config.user.pat,
    })

    const privateCommunitySegments = urlToRepoSegments(
      config.privateCommunityUrl,
    )
    await gitHubService.deleteRepo({
      repoName: privateCommunitySegments.repo,
      repoOwner: privateCommunitySegments.owner,
      token: config.user.pat,
    })
    loggingService.close()
    dbService.close()
    await rm(config.configDir, { recursive: true, force: true })
  })

  runUserTests(services)
  runCommunityTests(services)
  runSettingsTests(services)
  runMotionTests(services)
})
