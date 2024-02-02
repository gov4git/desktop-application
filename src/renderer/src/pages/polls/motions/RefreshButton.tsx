import { Tooltip } from '@fluentui/react-tooltip'
import { FC, useCallback, useEffect, useState } from 'react'

import { serialAsync } from '../../../../../shared/index.js'
import { useDataStore } from '../../../store/store.js'
import { useRefreshButtonStyles } from './RefreshButton.styles.js'

export type RefreshButtonProps = {
  onLoadingChange: (loading: boolean) => void
}

export const RefreshButton: FC<RefreshButtonProps> = function RefreshButton({
  onLoadingChange,
}) {
  const styles = useRefreshButtonStyles()
  const refreshCache = useDataStore((s) => s.refreshCache)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    onLoadingChange(true)
    await refreshCache()
    onLoadingChange(false)
    setLoading(false)
  }, [refreshCache, onLoadingChange, setLoading])

  useEffect(() => {
    const updateCacheInterval = setInterval(
      serialAsync(async () => {
        await refreshCache()
      }),
      60 * 1000,
    )
    return () => {
      clearInterval(updateCacheInterval)
    }
  }, [refreshCache])

  return (
    <button onClick={refresh} className={styles.refreshButton}>
      <Tooltip content="Refresh" relationship="description">
        <span>
          {loading && (
            <i className="codicon codicon-sync codicon-modifier-spin" />
          )}
          {!loading && <i className="codicon codicon-sync" />}
        </span>
      </Tooltip>
    </button>
  )
}
