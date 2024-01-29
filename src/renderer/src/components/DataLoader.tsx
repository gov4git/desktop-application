import { FC, useEffect } from 'react'

import { useFetchCommunities } from '../store/hooks/communityHooks.js'
import {
  useCheckForUpdates,
  useSetGlobalLoading,
} from '../store/hooks/globalHooks.js'
import { useFetchUser } from '../store/hooks/userHooks.js'

export const DataLoader: FC = function DataLoader() {
  const setLoading = useSetGlobalLoading()
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
