import { beforeAll, describe, expect, test } from '@jest/globals'
import { eq } from 'drizzle-orm'
import { existsSync } from 'fs'

import { DB } from '../src/electron/db/db.js'
import { communities } from '../src/electron/db/schema.js'
import {
  GitService,
  Services,
  SettingsService,
} from '../src/electron/services/index.js'
import { config } from './config.js'

export default function run(services: Services) {
  let settingsService: SettingsService
  let gitService: GitService
  let db: DB

  describe('Settings Tests', () => {
    beforeAll(async () => {
      settingsService = services.load<SettingsService>('settings')
      db = services.load<DB>('db')
      gitService = services.load<GitService>('git')
    })

    describe('Generate Config', () => {
      test('Generate', async () => {
        await settingsService.generateConfig()

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

        const shouldExist1 = existsSync(selectedCommunity.configPath)
        const shouldExist2 = await gitService.doesRemoteRepoExist(
          config.publicRepo,
          config.user,
        )
        const shouldExist3 = await gitService.doesRemoteRepoExist(
          config.privateRepo,
          config.user,
        )
        const shouldHaveCommits1 = await gitService.hasCommits(
          config.publicRepo,
          config.user,
        )
        const shouldHaveCommits2 = await gitService.hasCommits(
          config.privateRepo,
          config.user,
        )

        expect(shouldExist1).toEqual(true)
        expect(shouldExist2).toEqual(true)
        expect(shouldExist3).toEqual(true)
        expect(shouldHaveCommits1).toEqual(true)
        expect(shouldHaveCommits2).toEqual(true)
      })
    })

    describe('Validate', () => {
      test('Validate', async () => {
        const errors = await settingsService.validateConfig()

        expect(errors.length).toEqual(0)
      })
    })
  })
}
