import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { settingsErrorAtom } from '../state/settings.js'
import { userAtom } from '../state/user.js'
import { useMessageStyles } from '../styles/index.js'
import { DashboardUser } from './DashboardUser.js'
import { DashboardCommunity, Message } from './index.js'

export const Dashboard = function Dashboard() {
  const [configErrors, setConfigErrors] = useAtom(settingsErrorAtom)
  const messageStyles = useMessageStyles()
  const user = useAtomValue(userAtom)

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
