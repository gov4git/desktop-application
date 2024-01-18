import { beforeAll, describe, expect, test } from '@jest/globals'

import { Services, UserService } from '../src/electron/services/index.js'
import { config } from './config.js'

export default function run(services: Services) {
  let userService: UserService

  describe('User Tests', () => {
    beforeAll(async () => {
      userService = services.load<UserService>('user')
    })

    describe('Authenticating User', () => {
      test('Authenticate', async () => {
        await userService.insertUser(config.user.username, config.user.pat)
        const errors = await userService.initializeIdRepos()
        expect(errors).not.toBeNull()
        expect(errors?.length).toEqual(0)
      })
    })
  })
}
