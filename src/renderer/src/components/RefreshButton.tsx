import { Tooltip } from '@fluentui/react-tooltip'
import { useSetAtom } from 'jotai'
import { FC, useCallback, useEffect } from 'react'

import { serialAsync } from '../../../shared/index.js'
import { useRefreshCache } from '../hooks/cache.js'
import { loaderAtom } from '../state/loader.js'
import { useRefreshButtonStyles } from './RefreshButton.styles.js'

export const RefreshButton: FC = function RefreshButton() {
  const styles = useRefreshButtonStyles()
  const refreshCache = useRefreshCache()
  const setLoading = useSetAtom(loaderAtom)

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
  }, [refreshCache, setLoading])

  return (
    <button onClick={refresh} className={styles.refreshButton}>
      <Tooltip content="Refresh" relationship="description">
        <i className="codicon codicon-sync" />
      </Tooltip>
    </button>
  )
}
