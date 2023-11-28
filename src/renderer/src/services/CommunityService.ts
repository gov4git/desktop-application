import { AbstractCommunityService } from '~/shared'

import { proxyService } from './proxyService.js'

const CommunityService =
  proxyService<typeof AbstractCommunityService>('community')

export const communityService = new CommunityService()
