import { beforeAll, describe, expect, test } from '@jest/globals'
import { eq } from 'drizzle-orm'

import { DB } from '../src/electron/db/db.js'
import { communities } from '../src/electron/db/schema.js'
import { CommunityService, Services } from '../src/electron/services/index.js'
import { config } from './config.js'

export default function run(services: Services) {
  let communityService: CommunityService
  let db: DB

  describe('Community Tests', () => {
    beforeAll(async () => {
      communityService = services.load<CommunityService>('community')
      db = services.load<DB>('db')
    })

    describe('Inserting new community', () => {
      test('Insert', async () => {
        const errors = await communityService.insertCommunity(
          config.projectRepo,
        )
        expect((errors[1] ?? []).length).toEqual(0)

        const selectedCommunity = (
          await db
            .select()
            .from(communities)
            .where(eq(communities.selected, true))
            .limit(1)
        )[0]

        expect(selectedCommunity).not.toBeUndefined()
        expect(selectedCommunity?.projectUrl).toEqual(config.projectRepo)
        expect(selectedCommunity?.joinRequestUrl).not.toBeNull()
        expect(selectedCommunity?.joinRequestStatus).toEqual('open')
      })
    })
  })
}
