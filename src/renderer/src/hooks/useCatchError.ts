import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '../App/Router.js'
import { eventBus } from '../lib/index.js'
import { validationService } from '../services/ValidationService.js'
import { errorAtom } from '../state/error.js'
import { settingsErrorAtom } from '../state/settings.js'

export function useCatchError() {
  const setErrorMessage = useSetAtom(errorAtom)
  const navigate = useNavigate()
  const setConfigErrors = useSetAtom(settingsErrorAtom)

  const setError = useCallback(
    async (error: string) => {
      try {
        const configErrors = await validationService.validateConfig()
        if (configErrors.length > 0) {
          setConfigErrors(configErrors)
          eventBus.emit('error')
          navigate(routes.settings.path)
        } else {
          setErrorMessage(error)
          eventBus.emit('error')
        }
      } catch (ex) {
        setErrorMessage(error)
        eventBus.emit('error')
      }
    },
    [navigate, setConfigErrors, setErrorMessage],
  )

  return setError
}
