import { AbstractMotionService } from '~/shared'

import { proxyService } from './proxyService.js'

const MotionService = proxyService<typeof AbstractMotionService>('motion')

export const motionService = new MotionService()
