import { Tooltip } from '@fluentui/react-tooltip'
import { useSetAtom } from 'jotai'
import { FC, useCallback, useEffect } from 'react'

import { serialAsync } from '../../../shared/index.js'
import { useRefreshCache } from '../hooks/cache.js'
import { useFetchCommunities } from '../hooks/communities.js'
import { useFetchUser } from '../hooks/users.js'
import { loaderAtom } from '../state/loader.js'
import { useRefreshButtonStyles } from './RefreshButton.styles.js'

export const RefreshButton: FC = function RefreshButton() {
  const styles = useRefreshButtonStyles()
  const refreshCache = useRefreshCache()
  const setLoading = useSetAtom(loaderAtom)
  const getUser = useFetchUser()
  const getCommunities = useFetchCommunities()

  const refresh = useCallback(async () => {
    setLoading(true)
    await refreshCache()
    await Promise.all([getUser(), getCommunities()])
    setLoading(false)
  }, [refreshCache, setLoading, getUser, getCommunities])

  useEffect(() => {
    const updateCacheInterval = setInterval(
      serialAsync(async () => {
        await refreshCache()
        await Promise.all([getUser(), getCommunities()])
      }),
      60 * 1000,
    )
    return () => {
      clearInterval(updateCacheInterval)
    }
  }, [refreshCache, setLoading, getUser, getCommunities])

  return (
    <button onClick={refresh} className={styles.refreshButton}>
      <Tooltip content="Refresh" relationship="description">
        <i className="codicon codicon-sync" />
      </Tooltip>
    </button>
  )
}
