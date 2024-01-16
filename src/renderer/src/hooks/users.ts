import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import { userService } from '../services/index.js'
import {
  userAtom,
  userLoadedAtom,
  userLoginErrorsAtom,
  userVerificationAtom,
} from '../state/user.js'
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

export function useLogin() {
  const getUser = useFetchUser()
  const setVerification = useSetAtom(userVerificationAtom)
  const setLoginErrors = useSetAtom(userLoginErrorsAtom)
  const catchError = useCatchError()
  const _login = useCallback(async () => {
    try {
      const verification = await userService.startLoginFlow()
      setVerification(verification)
      const errors = await userService.finishLoginFlow()
      setLoginErrors(errors)
      if (errors == null || errors.length === 0) {
        await getUser()
      }
      setVerification(null)
    } catch (ex) {
      await catchError(`Failed to login. ${ex}`)
    }
  }, [catchError, setVerification, setLoginErrors, getUser])

  return useMemo(() => {
    return serialAsync(_login)
  }, [_login])
}

export function useLogout() {
  const getUser = useFetchUser()
  const setVerification = useSetAtom(userVerificationAtom)
  const setLoginErrors = useSetAtom(userLoginErrorsAtom)
  const catchError = useCatchError()
  const _logout = useCallback(async () => {
    try {
      setVerification(null)
      setLoginErrors(null)
      await userService.logout()
      await getUser()
    } catch (ex) {
      await catchError(`Failed to logout. ${ex}`)
    }
  }, [catchError, setVerification, setLoginErrors, getUser])

  return useMemo(() => {
    return serialAsync(_logout)
  }, [_logout])
}
