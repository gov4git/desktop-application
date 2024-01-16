import { beforeAll, describe, expect, test } from '@jest/globals'

import {
  GitService,
  Services,
  UserService,
} from '../src/electron/services/index.js'
import { config } from './config.js'

export default function run(services: Services) {
  let gitService: GitService
  let userService: UserService

  describe('User Tests', () => {
    beforeAll(async () => {
      gitService = services.load<GitService>('git')
      userService = services.load<UserService>('user')
    })

    describe('Invalid user credentials', () => {
      test('Missing fields', async () => {
        // Act
        const allFields = await userService.authenticate('', '')

        // Assert
        expect(allFields.length).toEqual(2)
      })

      test('Invalid PAT token', async () => {
        // Act
        const errors = await userService.authenticate(
          config.user.username,
          'NOT_A_TOKEN',
        )

        // Assert
        expect(errors.length).toEqual(1)
      })
    })

    describe('Authenticating User', () => {
      test('Authenticate', async () => {
        // Act
        // const userErrors = await userService.authenticate(
        //   config.user.username,
        //   config.user.pat,
        // )
        // expect(userErrors.length).toEqual(0)

        // // Act
        // const shouldExist1 = await gitService.doesRemoteRepoExist(
        //   config.publicRepo,
        //   config.user,
        // )
        // const shouldExist2 = await gitService.doesRemoteRepoExist(
        //   config.privateRepo,
        //   config.user,
        // )

        // // Assert
        // expect(shouldExist1).toEqual(true)
        // expect(shouldExist2).toEqual(true)

        await userService.insertUser(config.user.username, config.user.pat)
        const errors = await userService.initializeIdRepos()
        expect(errors).not.toBeNull()
        expect(errors?.length).toEqual(0)
      })
    })
  })
}
