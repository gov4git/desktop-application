import { Tooltip } from '@fluentui/react-tooltip'
import { FC, useCallback } from 'react'

import { useDataStore } from '../../../store/store.js'
import { useRefreshButtonStyles } from './RefreshButton.styles.js'

export const RefreshButton: FC = function RefreshButton() {
  const styles = useRefreshButtonStyles()
  const refreshCache = useDataStore((s) => s.refreshCache)
  const motionsLoading = useDataStore((s) => s.motionInfo.loading)

  const refresh = useCallback(async () => {
    await refreshCache(false)
  }, [refreshCache])

  return (
    <button onClick={refresh} className={styles.refreshButton}>
      <Tooltip content="Refresh" relationship="description">
        <span>
          {motionsLoading && (
            <i className="codicon codicon-sync codicon-modifier-spin" />
          )}
          {!motionsLoading && <i className="codicon codicon-sync" />}
        </span>
      </Tooltip>
    </button>
  )
}
