import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { serialAsync } from '~/shared'

import { appUpdaterService } from '../services/index.js'
import { updatesAtom } from '../state/updates.js'
import { useCatchError } from './useCatchError.js'

export function useCheckForUpdates() {
  const setUpdates = useSetAtom(updatesAtom)
  const catchError = useCatchError()
  const _checkForUpdates = useCallback(async () => {
    try {
      const updateInfo = await appUpdaterService.checkForUpdates()
      setUpdates(updateInfo)
    } catch (ex) {
      await catchError(`Failed to check for updates. ${ex}`)
    }
  }, [setUpdates, catchError])

  return useMemo(() => {
    return serialAsync(_checkForUpdates)
  }, [_checkForUpdates])
}
