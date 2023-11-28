import { beforeAll, describe, expect, test } from '@jest/globals'

import {
  BallotService,
  GitService,
  Gov4GitService,
  Services,
  UserService,
} from '../src/electron/services/index.js'
import { config } from './config.js'

export default function run(services: Services) {
  let userService: UserService
  let govService: Gov4GitService
  let ballotService: BallotService
  let gitService: GitService

  describe('Ballots', () => {
    beforeAll(async () => {
      gitService = services.load<GitService>('git')
      govService = services.load<Gov4GitService>('gov4git')
      ballotService = services.load<BallotService>('ballots')
      userService = services.load<UserService>('user')

      await userService.loadUser()
      const user = await userService.getUser()

      if (user == null) {
        throw new Error(`No User to use`)
      }

      const hasCommits = await gitService.hasCommits(config.communityUrl, user)

      if (!hasCommits) {
        await govService.mustRun('init-gov')
      }

      if (!user?.isMember) {
        await govService.mustRun(
          'user',
          'add',
          '--name',
          config.user.username,
          '--repo',
          config.publicRepo,
          '--branch',
          'main',
        )
      }
      await govService.mustRun(
        'balance',
        'add',
        '--user',
        config.user.username,
        '--key',
        'voting_credits',
        '--value',
        '10',
      )
    })
    test('Vote flow', async () => {
      expect(true).toEqual(true)
      await userService.loadUser()
      const user1 = await userService.getUser()
      if (user1 == null) {
        throw new Error(`No user to load`)
      }
      let ballots = await ballotService.getBallots()
      if (ballots.length === 0) {
        await ballotService.createBallot({
          type: 'issues',
          title: '12',
          description: 'Testing',
        })
      }
      await ballotService.vote({
        name: `github/issues/12`,
        choice: 'prioritize',
        strength: '4',
      })
      await ballotService.tallyBallot(`github/issues/12`)
      await ballotService.loadBallots()
      ballots = await ballotService.getBallots()
      const user2 = await userService.getUser()
      expect(ballots.length).toEqual(1)
      const ballot = ballots[0]
      if (ballot == null) {
        throw new Error(`No ballots`)
      }
      expect(ballot.score).toEqual(2)
      expect(user2?.votingCredits).toEqual(user1.votingCredits - 4)
    }, 1200000)
  })
}
