import 'dotenv/config'

import { describe } from 'node:test'

import { beforeAll, expect, test } from '@jest/globals'

import {
  GitService,
  type GitUserInfo,
} from '../src/electron/services/GitService.js'

const gitService = new GitService()
const user: GitUserInfo = {
  username: process.env['GH_USER']!,
  pat: process.env['GH_TOKEN']!,
}

const baseUrl = 'https://github.com'
const projectRepo = `${baseUrl}/${user.username}/test-gov4git-creating-deleting-repos`

export default function run() {
  beforeAll(async () => {
    await gitService.deleteRepo(projectRepo, user)
  }, 30000)

  describe('Working with Repos', () => {
    test('Does public repo exist', async () => {
      // Act
      const shouldNotExist = !(await gitService.doesPublicRepoExist(
        projectRepo,
      ))

      // Assert
      expect(shouldNotExist).toEqual(true)
    })

    test('Create Repo', async () => {
      // Arrange
      await gitService.initializeRemoteRepo(projectRepo, user, false, true)

      // Act
      const shouldExist = await gitService.doesRemoteRepoExist(
        projectRepo,
        user,
      )

      // Assert
      expect(shouldExist).toEqual(true)
    })

    test('Get default branch', async () => {
      // Act
      const shouldBeMain = await gitService.getDefaultBranch(projectRepo, user)

      // Assert
      expect(shouldBeMain).toEqual('main')
    })

    test('Has commits', async () => {
      // Act
      const shouldHaveCommits = await gitService.hasCommits(projectRepo, user)

      // Assert
      expect(shouldHaveCommits).toEqual(true)
    })

    test('Remove Repo', async () => {
      // Act
      const shouldExist = await gitService.doesRemoteRepoExist(
        projectRepo,
        user,
      )
      await gitService.deleteRepo(projectRepo, user)
      const noLongerExists = !(await gitService.doesRemoteRepoExist(
        projectRepo,
        user,
      ))

      // Assert
      expect(shouldExist).toEqual(true)
      expect(noLongerExists).toEqual(true)
    })
  })
}
