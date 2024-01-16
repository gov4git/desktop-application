import { beforeAll, describe, expect, test } from '@jest/globals'

import { Community, User } from '../src/electron/db/schema.js'
import {
  CommunityService,
  GitService,
  Gov4GitService,
  MotionService,
  Services,
  UserService,
} from '../src/electron/services/index.js'
import { config } from './config.js'

export default function run(services: Services) {
  let motionService: MotionService
  let userService: UserService
  let communityService: CommunityService
  let govService: Gov4GitService
  let gitService: GitService
  let user: User | null
  let community: Community | null

  describe('Motions', () => {
    beforeAll(async () => {
      motionService = services.load<MotionService>('motion')
      userService = services.load<UserService>('user')
      communityService = services.load<CommunityService>('community')
      govService = services.load<Gov4GitService>('gov4git')
      gitService = services.load<GitService>('git')

      user = await userService.getUser()
      if (user == null) {
        throw new Error('No User to use')
      }

      const hasCommits = await gitService.hasCommits(config.communityUrl, user)
      if (!hasCommits) {
        await govService.mustRun(['init-gov'])
      }

      community = await communityService.getCommunity()
      if (community == null) {
        throw new Error('No selected community to use')
      }

      if (!community.isMember) {
        await govService.mustRun([
          'user',
          'add',
          '--name',
          user.username,
          '--repo',
          config.publicRepo,
          '--branch',
          'main',
        ])
      }
      await govService.mustRun([
        'account',
        'issue',
        '--asset',
        'plural',
        '--to',
        `user:${user.username}`,
        '--quantity',
        '10',
      ])

      const currentMotions = await motionService.getMotions()
      if (currentMotions.motions.length === 0) {
        await govService.mustRun([
          'motion',
          'open',
          '--author',
          user.username,
          'desc',
          'Testing Motions',
          '--name',
          'motionTest1',
          '--policy',
          'pmp-concern-policy',
          '--title',
          'Motion Test 1',
          '--type',
          'concern',
        ])
        await motionService.loadMotions()
      }
    })

    test('Vote Flow', async () => {
      if (user == null || community == null) {
        throw new Error('User or Community is null')
      }

      let motions = (await motionService.getMotions()).motions
      expect(motions.length).toEqual(1)
      let motion = motions[0]!
      expect(motion.motionId).toEqual('motionTest1')
      expect(motion.score).toEqual(0)
      expect(motion.userScore).toEqual(0)
      expect(motion.userVoted).toEqual(false)
      expect(motion.userVotePending).toEqual(false)

      await motionService.vote({
        name: motion.ballotId,
        choice: motion.choice,
        strength: '4',
      })
      await motionService.loadMotions()
      motions = (await motionService.getMotions()).motions
      expect(motions.length).toEqual(1)
      motion = motions[0]!
      expect(motion.motionId).toEqual('motionTest1')
      expect(motion.score).toEqual(0)
      expect(motion.userScore).toEqual(2)
      expect(motion.userVoted).toEqual(true)
      expect(motion.userVotePending).toEqual(true)

      await govService.mustRun(['ballot', 'tally', '--name', motion.ballotId])
      await motionService.loadMotions()
      motions = (await motionService.getMotions()).motions
      expect(motions.length).toEqual(1)
      motion = motions[0]!
      expect(motion.motionId).toEqual('motionTest1')
      expect(motion.score).toEqual(2)
      expect(motion.userScore).toEqual(2)
      expect(motion.userVoted).toEqual(true)
      expect(motion.userVotePending).toEqual(false)
    })
  })
}
