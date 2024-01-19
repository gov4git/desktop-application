import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import { cacheService } from '../services/index.js'
import { useFetchCommunities } from './communities.js'
import { useFetchMotions } from './motions.js'
import { useCatchError } from './useCatchError.js'
import { useFetchUser } from './users.js'

export function useRefreshCache() {
  const catchError = useCatchError()
  const getUser = useFetchUser()
  const getCommunities = useFetchCommunities()
  const getMotions = useFetchMotions()
  const _refreshCache = useCallback(async () => {
    try {
      await cacheService.refreshCache()
      await Promise.all([getUser(), getCommunities(), getMotions()])
    } catch (ex) {
      await catchError(`Failed to refresh cache. ${ex}`)
    }
  }, [catchError, getUser, getCommunities, getMotions])

  return useMemo(() => {
    return serialAsync(_refreshCache)
  }, [_refreshCache])
}
