import { Card } from '@fluentui/react-components'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { CommunitySettings, Login } from '../components/index.js'
import { Message } from '../components/Message.js'
import { settingsErrorAtom } from '../state/settings.js'
import { userAtom } from '../state/user.js'
import { useCardStyles } from '../styles/index.js'
import { useMessageStyles } from '../styles/index.js'
import { useSettingsStyle } from './Settings.styles.js'

export const SettingsPage = function SettingsPage() {
  const styles = useSettingsStyle()
  const cardStyles = useCardStyles()
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
      <h2 className={styles.header}>User Settings</h2>
      <Card className={cardStyles.primary}>
        <Login />
      </Card>
      <br />
      {user != null && (
        <>
          <h2 className={styles.header}>Community Settings</h2>
          <CommunitySettings />
        </>
      )}
    </>
  )
}
