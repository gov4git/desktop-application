import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import { communityService } from '../services/index.js'
import {
  communitiesAtom,
  insertCommunityErrors,
  newProjectUrlAtom,
  selectedCommunityUrlAtom,
} from '../state/community.js'
import { useRefreshCache } from './cache.js'
import { useCatchError } from './useCatchError.js'

export function useFetchCommunities() {
  const setCommunities = useSetAtom(communitiesAtom)
  const catchError = useCatchError()
  const _getCommunities = useCallback(async () => {
    try {
      const communities = await communityService.getCommunities()
      setCommunities(communities)
    } catch (ex) {
      await catchError(`Failed to load community information. ${ex}`)
    }
  }, [catchError, setCommunities])

  return useMemo(() => {
    return serialAsync(_getCommunities)
  }, [_getCommunities])
}

export function useInsertCommunity() {
  const setCommunityErrors = useSetAtom(insertCommunityErrors)
  const newProjectUrl = useAtomValue(newProjectUrlAtom)
  const catchError = useCatchError()
  const refreshCache = useRefreshCache()
  const getCommunities = useFetchCommunities()

  const _insertCommunity = useCallback(async () => {
    try {
      setCommunityErrors([])
      const insertErrors = await communityService.insertCommunity(newProjectUrl)
      setCommunityErrors(insertErrors)
      if (insertErrors.length === 0) {
        await refreshCache()
        await getCommunities()
      }
    } catch (ex) {
      await catchError(`Failed to join community ${newProjectUrl}. ${ex}`)
    }
  }, [
    catchError,
    newProjectUrl,
    setCommunityErrors,
    refreshCache,
    getCommunities,
  ])

  return useMemo(() => {
    return serialAsync(_insertCommunity)
  }, [_insertCommunity])
}

export function useSelectCommunity() {
  const getCommunities = useFetchCommunities()
  const catchError = useCatchError()
  const refreshCache = useRefreshCache()
  const setSelectedCommunityUrl = useSetAtom(selectedCommunityUrlAtom)

  const _selectCommunity = useCallback(
    async (urlToSelect: string) => {
      try {
        setSelectedCommunityUrl(urlToSelect)
        await communityService.selectCommunity(urlToSelect)
        await refreshCache()
        await getCommunities()
      } catch (ex) {
        await catchError(`Failed to select community ${urlToSelect}, ${ex}`)
      }
    },
    [getCommunities, catchError, refreshCache, setSelectedCommunityUrl],
  )

  return useMemo(() => {
    return serialAsync(_selectCommunity)
  }, [_selectCommunity])
}
