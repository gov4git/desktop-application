import { AbstractCacheService } from '~/shared'

import { proxyService } from './proxyService.js'

const CacheService = proxyService<typeof AbstractCacheService>('cache')

export const cacheService = new CacheService()
