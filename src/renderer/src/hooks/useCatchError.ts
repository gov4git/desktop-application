import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '../App/Router.js'
import { configService } from '../services/ConfigService.js'
import { configErrorsAtom } from '../state/config.js'
import { errorAtom } from '../state/error.js'

export function useCatchError() {
  const setErrorMessage = useSetAtom(errorAtom)
  const navigate = useNavigate()
  const setConfigErrors = useSetAtom(configErrorsAtom)

  const setError = useCallback(
    async (error: string) => {
      try {
        const configErrors = await configService.validateSettings()
        if (configErrors.length > 0) {
          setConfigErrors(configErrors)
          navigate(routes.settings.path)
        } else {
          setErrorMessage(error)
        }
      } catch (ex) {
        setErrorMessage(error)
      }
    },
    [navigate, setConfigErrors, setErrorMessage],
  )

  return setError
}
