import { Tooltip } from '@fluentui/react-tooltip'
import { FC, useCallback, useEffect } from 'react'

import { serialAsync } from '../../../../../shared/index.js'
import { useGlobalRefreshCache } from '../../../store/hooks/globalHooks.js'
import {
  useMotionsLoading,
  useSetMotionsLoading,
} from '../../../store/hooks/motionHooks.js'
import { useRefreshButtonStyles } from './RefreshButton.styles.js'

export const RefreshButton: FC = function RefreshButton() {
  const styles = useRefreshButtonStyles()
  const refreshCache = useGlobalRefreshCache()
  const setLoading = useSetMotionsLoading()
  const isLoading = useMotionsLoading()

  const refresh = useCallback(async () => {
    setLoading(true)
    await refreshCache()
    setLoading(false)
  }, [refreshCache, setLoading])

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
          {isLoading && (
            <i className="codicon codicon-sync codicon-modifier-spin" />
          )}
          {!isLoading && <i className="codicon codicon-sync" />}
        </span>
      </Tooltip>
    </button>
  )
}
