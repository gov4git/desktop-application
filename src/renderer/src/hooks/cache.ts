import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import { eventBus } from '../lib/eventBus.js'
import { cacheService } from '../services/index.js'
import { useCatchError } from './useCatchError.js'

export function useRefreshCache() {
  const catchError = useCatchError()
  const _refreshCache = useCallback(async () => {
    try {
      await cacheService.refreshCache()
      eventBus.emit('cache-refreshed')
    } catch (ex) {
      await catchError(`Failed to refresh cache. ${ex}`)
    }
  }, [catchError])

  return useMemo(() => {
    return serialAsync(_refreshCache)
  }, [_refreshCache])
}
