import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import { userService } from '../services/index.js'
import { userAtom, userLoadedAtom } from '../state/user.js'
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
