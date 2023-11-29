import { Tooltip } from '@fluentui/react-tooltip'
import { FC, useCallback } from 'react'

import { eventBus } from '../lib/index.js'
import { useRefreshButtonStyles } from './RefreshButton.styles.js'

export const RefreshButton: FC = function RefreshButton() {
  const styles = useRefreshButtonStyles()

  const refresh = useCallback(() => {
    eventBus.emit('refresh')
  }, [])

  return (
    <button onClick={refresh} className={styles.refreshButton}>
      <Tooltip content="Refresh" relationship="description">
        <i className="codicon codicon-sync" />
      </Tooltip>
    </button>
  )
}
