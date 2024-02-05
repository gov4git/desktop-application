import { FC, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '../../App/Router.js'
import { Message } from '../../components/Message.js'
import { useDataStore } from '../../store/store.js'
import { useMessageStyles } from '../../styles/messages.js'
import { useErrorPanelStyles } from './ErrorPanel.styles.js'

export const ErrorPanel: FC = function ErrorPanel() {
  const styles = useErrorPanelStyles()
  const messageStyles = useMessageStyles()
  const error = useDataStore((s) => s.error)
  const clearError = useDataStore((s) => s.clearError)
  const navigate = useNavigate()

  const dismissError = useCallback(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (error != null) {
      if (error.statusCode === 401) {
        navigate(routes.settings.path)
      }
    }
  }, [navigate, error])

  if (error == null) {
    return <></>
  }

  return (
    <div className={styles.messageContainer}>
      <Message
        messages={[error.error]}
        onClose={dismissError}
        className={messageStyles.error}
      />
    </div>
  )
}
