import { useSetAtom } from 'jotai'
import { FC, useEffect } from 'react'

import { useFetchCommunities } from '../hooks/communities.js'
import { useCheckForUpdates } from '../hooks/updates.js'
import { useFetchUser } from '../hooks/users.js'
import { loaderAtom } from '../state/loader.js'

export const DataLoader: FC = function DataLoader() {
  const setLoading = useSetAtom(loaderAtom)
  const getUser = useFetchUser()
  const getCommunities = useFetchCommunities()
  const checkForUpdates = useCheckForUpdates()

  useEffect(() => {
    async function run() {
      setLoading(true)
      await Promise.allSettled([getUser(), getCommunities()])
      setLoading(false)
    }
    void run()
  }, [getUser, getCommunities, setLoading])

  useEffect(() => {
    void checkForUpdates()
    const checkForUpdatesInterval = setInterval(async () => {
      return await checkForUpdates()
    }, 60 * 1000)
    return () => {
      clearInterval(checkForUpdatesInterval)
    }
  }, [checkForUpdates])

  return <></>
}
