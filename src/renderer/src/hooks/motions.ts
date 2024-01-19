import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import { MotionVoteOption } from '../../../electron/db/schema.js'
import { motionService } from '../services/index.js'
import {
  motionsAtom,
  motionsSearchOptionsAtom,
  motionsSearchResultsAtom,
  motionsSearchTermAtom,
  motionsStatusAtom,
  motionsVoteStatusAtom,
} from '../state/motions.js'
import { useRefreshCache } from './cache.js'
import { useCatchError } from './useCatchError.js'

export function useFetchMotions() {
  const setMotions = useSetAtom(motionsAtom)
  const motionsSearchOptions = useAtomValue(motionsSearchOptionsAtom)
  const setMotionsSearchResults = useSetAtom(motionsSearchResultsAtom)
  const catchError = useCatchError()

  const _search = useCallback(async () => {
    try {
      const motionsSearchResults =
        await motionService.getMotions(motionsSearchOptions)
      setMotionsSearchResults({
        totalCount: motionsSearchResults.totalCount,
        matchingCount: motionsSearchResults.matchingCount,
      })
      setMotions(motionsSearchResults.motions)
    } catch (ex) {
      await catchError(`Failed to load motions. ${ex}`)
    }
  }, [setMotions, motionsSearchOptions, setMotionsSearchResults, catchError])

  return useMemo(() => {
    return serialAsync(_search)
  }, [_search])
}

export function useResetMotionSearchOptions() {
  const setMotionSearchTerm = useSetAtom(motionsSearchTermAtom)
  const setMotionsStatus = useSetAtom(motionsStatusAtom)
  const setMotionsVoteState = useSetAtom(motionsVoteStatusAtom)

  return useCallback(() => {
    setMotionSearchTerm('')
    setMotionsStatus(['open'])
    setMotionsVoteState([])
  }, [setMotionSearchTerm, setMotionsStatus, setMotionsVoteState])
}

export function useVote() {
  const refreshCache = useRefreshCache()
  const catchError = useCatchError()

  return useCallback(
    async (voteOptions: MotionVoteOption): Promise<null | string> => {
      try {
        await motionService.vote(voteOptions)
        await refreshCache()
        return null
      } catch (ex: any) {
        if (
          ex != null &&
          ex.message != null &&
          typeof ex.message === 'string' &&
          (ex.message as string).toLowerCase().endsWith('ballot is closed')
        ) {
          return 'Sorry, this ballot is closed to voting. Please refresh the page to get the latest list of ballots.'
        } else {
          await catchError(`Failed to cast vote. ${ex}`)
          return `There was an error voting. Please view the full logs at the top of the page.`
        }
      }
    },
    [refreshCache, catchError],
  )
}
