import { Button } from '@fluentui/react-components'
import { type FC, useCallback, useEffect, useState } from 'react'

import { useDataStore } from '../store/store.js'
import { useLogViewerStyles } from './LogViewer.styles.js'

export type LogViewerProps = {
  height: string
}

export const LogViewer: FC<LogViewerProps> = function LogViewer({ height }) {
  const [logs, setLogs] = useState('')
  const fetchLogs = useDataStore((s) => s.fetchLogs)
  const styles = useLogViewerStyles()

  useEffect(() => {
    async function run() {
      const newLogs = await fetchLogs()
      setLogs(newLogs)
    }
    void run()
  }, [fetchLogs, setLogs])

  const save = useCallback(async () => {
    const logs = await fetchLogs()
    const blob = new Blob([logs ?? ''], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'logs.txt'
    link.click()
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
    // navigator.clipboard.writeText(logs ?? '')
  }, [fetchLogs])

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Button onClick={save}>
          <i className={styles.icon + ' codicon codicon-save'} />
          Save
        </Button>{' '}
      </div>
      <div className={styles.contents} style={{ height }}>
        {logs}
      </div>
    </div>
  )
}
