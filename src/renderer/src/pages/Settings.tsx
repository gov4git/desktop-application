import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { CommunitySettings, Login } from '../components/index.js'
import { Message } from '../components/Message.js'
import { settingsErrorAtom } from '../state/settings.js'
import { useMessageStyles } from '../styles/index.js'
import { useSettingsStyle } from './Settings.styles.js'

export const SettingsPage = function SettingsPage() {
  const styles = useSettingsStyle()
  const [configErrors, setConfigErrors] = useAtom(settingsErrorAtom)
  const messageStyles = useMessageStyles()

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
      <Login />
      <br />
      <h2 className={styles.header}>Community Settings</h2>
      <CommunitySettings />
    </>
  )
}
