import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import type {
  DeployCommunityArgs,
  IssueVotingCreditsArgs,
  ManageIssueArgs,
} from '../../../electron/services/CommunityService.js'
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

  const _insertCommunity = useCallback(async () => {
    try {
      setCommunityErrors([])
      const insertErrors = await communityService.insertCommunity(newProjectUrl)
      setCommunityErrors(insertErrors)
      if (insertErrors.length === 0) {
        await refreshCache()
      }
    } catch (ex) {
      await catchError(`Failed to join community ${newProjectUrl}. ${ex}`)
    }
  }, [catchError, newProjectUrl, setCommunityErrors, refreshCache])

  return useMemo(() => {
    return serialAsync(_insertCommunity)
  }, [_insertCommunity])
}

export function useSelectCommunity() {
  const catchError = useCatchError()
  const refreshCache = useRefreshCache()
  const setSelectedCommunityUrl = useSetAtom(selectedCommunityUrlAtom)

  const _selectCommunity = useCallback(
    async (urlToSelect: string) => {
      try {
        setSelectedCommunityUrl(urlToSelect)
        await communityService.selectCommunity(urlToSelect)
        await refreshCache()
      } catch (ex) {
        await catchError(`Failed to select community ${urlToSelect}, ${ex}`)
      }
    },
    [catchError, refreshCache, setSelectedCommunityUrl],
  )

  return useMemo(() => {
    return serialAsync(_selectCommunity)
  }, [_selectCommunity])
}

export function useDeployCommunity() {
  const catchError = useCatchError()
  const refreshCache = useRefreshCache()

  const _deploy = useCallback(
    async (args: DeployCommunityArgs) => {
      try {
        await communityService.deployCommunity(args)
        await refreshCache()
      } catch (ex) {
        await catchError(`Failed to deploy community. ${ex}`)
      }
    },
    [catchError, refreshCache],
  )

  return useMemo(() => {
    return serialAsync(_deploy)
  }, [_deploy])
}

export function useFetchCommunityUsers() {
  const catchError = useCatchError()

  const _getCommunityUsers = useCallback(
    async (communityUrl: string) => {
      try {
        return await communityService.getCommunityUsers(communityUrl)
      } catch (ex) {
        await catchError(`Failed to load users for ${communityUrl}. ${ex}`)
        return []
      }
    },
    [catchError],
  )

  return useMemo(() => {
    return serialAsync(_getCommunityUsers)
  }, [_getCommunityUsers])
}

export function useIssueVotingCredits() {
  const catchError = useCatchError()
  const refreshCache = useRefreshCache()
  const _issueCredits = useCallback(
    async (args: IssueVotingCreditsArgs) => {
      try {
        await communityService.issueVotingCredits(args)
        await refreshCache()
      } catch (ex) {
        await catchError(`Failed to issue voting credits. ${ex}`)
      }
    },
    [catchError, refreshCache],
  )

  return useMemo(() => {
    return serialAsync(_issueCredits)
  }, [_issueCredits])
}

export function useFetchCommunityIssues() {
  const catchError = useCatchError()

  const _getCommunityIssues = useCallback(
    async (communityUrl: string) => {
      try {
        return await communityService.getCommunityIssues(communityUrl)
      } catch (ex) {
        await catchError(`Failed to load issues for ${communityUrl}. ${ex}`)
        return []
      }
    },
    [catchError],
  )

  return useMemo(() => {
    return serialAsync(_getCommunityIssues)
  }, [_getCommunityIssues])
}

export function useManageIssue() {
  const catchError = useCatchError()

  const _manage = useCallback(
    async (args: ManageIssueArgs) => {
      try {
        await communityService.manageIssue(args)
      } catch (ex) {
        await catchError(`Failed to manage issue. ${ex}`)
      }
    },
    [catchError],
  )

  return useMemo(() => {
    return serialAsync(_manage)
  }, [_manage])
}
