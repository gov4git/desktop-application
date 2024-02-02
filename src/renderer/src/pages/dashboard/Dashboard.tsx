import { useCallback } from 'react'

import { Message } from '../../components/index.js'
import {
  useGlobalSettingsErrors,
  useSetGlobalSettingsError,
} from '../../store/hooks/globalHooks.js'
import { useDataStore } from '../../store/store.js'
import { useMessageStyles } from '../../styles/index.js'
import { DashboardCommunity } from './community/DashboardCommunity.js'
import { DashboardUser } from './user/DashboardUser.js'

export const Dashboard = function Dashboard() {
  const configErrors = useGlobalSettingsErrors()
  const setConfigErrors = useSetGlobalSettingsError()
  const messageStyles = useMessageStyles()
  const user = useDataStore((s) => s.userInfo.user)

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
