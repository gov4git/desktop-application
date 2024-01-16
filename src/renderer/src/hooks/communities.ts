import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import { communityService } from '../services/index.js'
import { communitiesAtom } from '../state/community.js'
import { useCatchError } from './useCatchError.js'

export function useFetchCommunities() {
  const setCommunities = useSetAtom(communitiesAtom)
  const catchError = useCatchError()
  const _getCommunities = useCallback(async () => {
    try {
      const communities = await communityService.getCommunities()
      setCommunities(communities)
    } catch (ex) {
      await catchError(`Failed to load user information. ${ex}`)
    }
  }, [catchError, setCommunities])

  return useMemo(() => {
    return serialAsync(_getCommunities)
  }, [_getCommunities])
}
