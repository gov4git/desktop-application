import { useCallback } from 'react'

import {
  useGlobalSettingsErrors,
  useSetGlobalSettingsError,
} from '../store/hooks/globalHooks.js'
import { useUser } from '../store/hooks/userHooks.js'
import { useMessageStyles } from '../styles/index.js'
import { DashboardUser } from './DashboardUser.js'
import { DashboardCommunity, Message } from './index.js'

export const Dashboard = function Dashboard() {
  const configErrors = useGlobalSettingsErrors()
  const setConfigErrors = useSetGlobalSettingsError()
  const messageStyles = useMessageStyles()
  const user = useUser()

  const onClose = useCallback(() => {
    setConfigErrors([])
  }, [setConfigErrors])

  return (
    <>
      {configErrors.length > 0 && (
        <Message
          messages={configErrors}
          onClose={onClose}
          className={messageStyles.error}
        />
      )}
      <DashboardUser />
      <br />
      {user != null && <DashboardCommunity />}
    </>
  )
}
