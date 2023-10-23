import { AbstractBallotService } from '~/shared'

import { proxyService } from './proxyService.js'

const BallotService = proxyService<typeof AbstractBallotService>('ballots')

export const ballotService = new BallotService()
