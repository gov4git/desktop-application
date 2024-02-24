import { FC, useEffect } from 'react'

import { serialAsync } from '~/shared'

import { useDataStore } from '../../store/store.js'

let firstMount = true

export const DataLoader: FC = function DataLoader() {
  const getUser = useDataStore((s) => s.userInfo.fetchUser)
  const getCommunities = useDataStore((s) => s.communityInfo.fetchCommunities)
  const checkForUpdates = useDataStore((s) => s.checkForUpdates)
  const refreshCache = useDataStore((s) => s.refreshCache)
  const motionSearchArgs = useDataStore((s) => s.motionInfo.searchArgs)
  const fetchMotions = useDataStore((s) => s.motionInfo.fetchMotions)

  useEffect(() => {
    let shouldUpdate = true
    async function run() {
      await fetchMotions(motionSearchArgs, false, false, () => shouldUpdate)
    }
    void run()
    if (firstMount) {
      setTimeout(async () => {
        await fetchMotions(motionSearchArgs, true, true, () => shouldUpdate)
        firstMount = false
      }, 1000)
    }

    return () => {
      shouldUpdate = false
    }
  }, [motionSearchArgs, fetchMotions])

  useEffect(() => {
    async function run() {
      await Promise.allSettled([getUser(false), getCommunities(false)])
    }
    void run()
  }, [getUser, getCommunities])

  useEffect(() => {
    // void refreshCache()
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
