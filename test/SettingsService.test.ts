import { beforeAll, describe, expect, test } from '@jest/globals'
import { eq } from 'drizzle-orm'
import { existsSync } from 'fs'

import { DB } from '../src/electron/db/db.js'
import { communities } from '../src/electron/db/schema.js'
import { urlToRepoSegments } from '../src/electron/lib/github.js'
import {
  GitHubService,
  Services,
  SettingsService,
  UserService,
  ValidationService,
} from '../src/electron/services/index.js'
import { config } from './config.js'

export default function run(services: Services) {
  let settingsService: SettingsService
  let validationService: ValidationService
  let gitHubService: GitHubService
  let userService: UserService
  let db: DB

  describe('Settings Tests', () => {
    beforeAll(async () => {
      settingsService = services.load<SettingsService>('settings')
      validationService = services.load<ValidationService>('validation')
      db = services.load<DB>('db')
      gitHubService = services.load<GitHubService>('github')
      userService = services.load<UserService>('user')
    })

    describe('Generate Config', () => {
      test('Generate', async () => {
        await settingsService.generateConfigs()

        const selectedCommunity = (
          await db
            .select()
            .from(communities)
            .where(eq(communities.selected, true))
            .limit(1)
        )[0]

        if (selectedCommunity == null) {
          throw new Error(`No selected community`)
        }
        const user = await userService.getUser()
        if (user == null) {
          throw new Error(`No user`)
        }

        const shouldExist1 = existsSync(selectedCommunity.configPath)

        const publicRepoSegments = urlToRepoSegments(config.publicRepo)
        const shouldHaveCommits1 = await gitHubService.hasCommits({
          repoName: publicRepoSegments.repo,
          username: publicRepoSegments.owner,
          token: user.pat,
        })

        const privateRepoSegments = urlToRepoSegments(config.privateRepo)
        const shouldHaveCommits2 = await gitHubService.hasCommits({
          repoName: privateRepoSegments.repo,
          username: privateRepoSegments.owner,
          token: user.pat,
        })

        expect(shouldExist1).toEqual(true)
        expect(shouldHaveCommits1).toEqual(true)
        expect(shouldHaveCommits2).toEqual(true)
      })
    })

    describe('Validate', () => {
      test('Validate', async () => {
        const errors = await validationService.validateConfig()

        expect(errors.length).toEqual(0)
      })
    })
  })
}
