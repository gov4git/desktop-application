import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import type { MotionSearch } from '../../../electron/db/schema.js'
import { motionService } from '../services/index.js'
import {
  concernsAtom,
  concernSeachOptionsAtom,
  concernSearchResultsAtom,
  proposalsAtom,
  proposalsSearchOptionsAtom,
  proposalsSearchResultsAtom,
} from '../state/motions.js'
import { useCatchError } from './useCatchError.js'

function useFetchMotions() {
  const catchError = useCatchError()

  const _getMotions = useCallback(
    async (search: MotionSearch) => {
      try {
        return await motionService.getMotions(search)
      } catch (ex) {
        await catchError(`Failed to load motions. ${ex}`)
        return {
          totalCount: 0,
          matchingCount: 0,
          motions: [],
        }
      }
    },
    [catchError],
  )

  return useMemo(() => {
    return serialAsync(_getMotions)
  }, [_getMotions])
}

export function useFetchIssues() {
  const setIssues = useSetAtom(concernsAtom)
  const issuesOptions = useAtomValue(concernSeachOptionsAtom)
  const setIssueSearchResults = useSetAtom(concernSearchResultsAtom)
  const fetchMotions = useFetchMotions()
  const catchError = useCatchError()

  return useCallback(async () => {
    try {
      const issuesResults = await fetchMotions(issuesOptions)
      setIssues(issuesResults.motions)
      setIssueSearchResults({
        totalCount: issuesResults.totalCount,
        matchingCount: issuesResults.matchingCount,
      })
    } catch (ex) {
      await catchError(`Failed to fetch issues. ${ex}`)
    }
  }, [
    setIssues,
    issuesOptions,
    fetchMotions,
    catchError,
    setIssueSearchResults,
  ])
}

export function useFetchPullRequests() {
  const setPullRequests = useSetAtom(proposalsAtom)
  const searchOptions = useAtomValue(proposalsSearchOptionsAtom)
  const setPullRequestsSearchResults = useSetAtom(proposalsSearchResultsAtom)
  const fetchMotions = useFetchMotions()
  const catchError = useCatchError()

  return useCallback(async () => {
    try {
      const pullRequestResults = await fetchMotions(searchOptions)
      setPullRequests(pullRequestResults.motions)
      setPullRequestsSearchResults({
        totalCount: pullRequestResults.totalCount,
        matchingCount: pullRequestResults.matchingCount,
      })
    } catch (ex) {
      await catchError(`Failed to fetch pull requests. ${ex}`)
    }
  }, [
    setPullRequests,
    searchOptions,
    fetchMotions,
    catchError,
    setPullRequestsSearchResults,
  ])
}
