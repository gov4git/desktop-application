import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import type { BallotSearch } from '../../../electron/db/schema.js'
import { ballotService } from '../services/index.js'
import {
  issuesAtom,
  issueSearchOptionsAtom,
  issuesSearchResultsAtom,
  pullRequestsAtom,
  pullRequestsearchOptionsAtom,
  pullRequestsSearchResultsAtom,
} from '../state/ballots.js'
import { useCatchError } from './useCatchError.js'

function useFetchBallots() {
  const catchError = useCatchError()

  const _getBallots = useCallback(
    async (search: BallotSearch) => {
      try {
        return await ballotService.getBallots(search)
      } catch (ex) {
        catchError(`Failed to load ballots. ${ex}`)
        return {
          totalCount: 0,
          matchingCount: 0,
          ballots: [],
        }
      }
    },
    [catchError],
  )

  return useMemo(() => {
    return serialAsync(_getBallots)
  }, [_getBallots])
}

export function useFetchIssues() {
  const setIssues = useSetAtom(issuesAtom)
  const issuesOptions = useAtomValue(issueSearchOptionsAtom)
  const setIssueSearchResults = useSetAtom(issuesSearchResultsAtom)
  const fetchBallots = useFetchBallots()
  const catchError = useCatchError()

  return useCallback(async () => {
    try {
      const issuesResults = await fetchBallots(issuesOptions)
      setIssues(issuesResults.ballots)
      setIssueSearchResults({
        totalCount: issuesResults.totalCount,
        matchingCount: issuesResults.matchingCount,
      })
    } catch (ex) {
      catchError(`Failed to fetch issues. ${ex}`)
    }
  }, [
    setIssues,
    issuesOptions,
    fetchBallots,
    catchError,
    setIssueSearchResults,
  ])
}

export function useFetchPullRequests() {
  const setPullRequests = useSetAtom(pullRequestsAtom)
  const searchOptions = useAtomValue(pullRequestsearchOptionsAtom)
  const setPullRequestsSearchResults = useSetAtom(pullRequestsSearchResultsAtom)
  const fetchBallots = useFetchBallots()
  const catchError = useCatchError()

  return useCallback(async () => {
    try {
      const pullRequestResults = await fetchBallots(searchOptions)
      setPullRequests(pullRequestResults.ballots)
      setPullRequestsSearchResults({
        totalCount: pullRequestResults.totalCount,
        matchingCount: pullRequestResults.matchingCount,
      })
    } catch (ex) {
      catchError(`Failed to fetch issues. ${ex}`)
    }
  }, [
    setPullRequests,
    searchOptions,
    fetchBallots,
    catchError,
    setPullRequestsSearchResults,
  ])
}
