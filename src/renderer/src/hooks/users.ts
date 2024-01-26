import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import { userService } from '../services/index.js'
import { userAtom, userLoadedAtom } from '../state/user.js'
import { useRefreshCache } from './cache.js'
import { useCatchError } from './useCatchError.js'

export function useFetchUser() {
  const setUser = useSetAtom(userAtom)
  const setUserLoaded = useSetAtom(userLoadedAtom)
  const catchError = useCatchError()
  const _getUser = useCallback(async () => {
    try {
      const user = await userService.getUser()
      setUser(user)
      setUserLoaded(true)
    } catch (ex) {
      await catchError(`Failed to load user information. ${ex}`)
    }
  }, [catchError, setUser, setUserLoaded])

  return useMemo(() => {
    return serialAsync(_getUser)
  }, [_getUser])
}

export function useStartLoginFlow() {
  const catchError = useCatchError()
  const _login = useCallback(async () => {
    try {
      return await userService.startLoginFlow()
    } catch (ex) {
      await catchError(`Failed to login. ${ex}`)
      return null
    }
  }, [catchError])

  return useMemo(() => {
    return serialAsync(_login)
  }, [_login])
}

export function useFinishLoginFlow() {
  const catchError = useCatchError()
  const _login = useCallback(async () => {
    try {
      return await userService.finishLoginFlow()
    } catch (ex) {
      await catchError(`Failed to login. ${ex}`)
      return null
    }
  }, [catchError])

  return useMemo(() => {
    return serialAsync(_login)
  }, [_login])
}

export function useLogout() {
  const refreshCache = useRefreshCache()
  const catchError = useCatchError()
  const _logout = useCallback(async () => {
    try {
      await userService.logout()
      await refreshCache()
    } catch (ex) {
      await catchError(`Failed to logout. ${ex}`)
    }
  }, [catchError, refreshCache])

  return useMemo(() => {
    return serialAsync(_logout)
  }, [_logout])
}

export function useGetUserAdminOrgs() {
  const catchError = useCatchError()

  const _getOrgs = useCallback(async () => {
    try {
      return userService.getUserAdminOrgs()
    } catch (ex) {
      await catchError(`Failed to load user orgs. ${ex}`)
      return []
    }
  }, [catchError])

  return useMemo(() => {
    return serialAsync(_getOrgs)
  }, [_getOrgs])
}

export function useGetOrgRepos() {
  const catchError = useCatchError()

  const _getRepos = useCallback(
    async (org: string) => {
      try {
        return userService.getPublicOrgRepos(org)
      } catch (ex) {
        await catchError(`Failed to load Repos for ${org}. ${ex}`)
        return []
      }
    },
    [catchError],
  )

  return useMemo(() => {
    return serialAsync(_getRepos)
  }, [_getRepos])
}
