import { Button } from '@fluentui/react-components'
import { type FC, useCallback, useState } from 'react'

import { useLogs } from './LogViewer.hooks.js'
import { useLogViewerStyles } from './LogViewer.styles.js'

export type LogViewerProps = {
  height: string
}

export const LogViewer: FC<LogViewerProps> = function LogViewer({ height }) {
  const logs = useLogs()
  const styles = useLogViewerStyles()
  const [message, setMessage] = useState('')

  const copy = useCallback(() => {
    navigator.clipboard.writeText(logs ?? '')
    setMessage('Copied')
    setTimeout(() => {
      setMessage('')
    }, 2000)
  }, [logs])

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Button onClick={copy}>
          {message !== '' && message}
          {message === '' && (
            <>
              <i className={styles.icon + ' codicon codicon-copy'} />
              Copy
            </>
          )}
        </Button>{' '}
      </div>
      <div className={styles.contents} style={{ height }}>
        {logs}
      </div>
    </div>
  )
}
