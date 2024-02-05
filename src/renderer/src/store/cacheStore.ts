import { type StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import { serialAsync } from '~/shared'

import type { CacheStore, Store } from './types.js'

export const createCacheStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  CacheStore
> = (set, get) => ({
  refreshCache: serialAsync(async () => {
    await get().tryRun(async () => {
      const searchArgs = get().motionInfo.searchArgs
      await get().motionInfo.fetchMotions(searchArgs, true),
        await Promise.all([
          get().userInfo.fetchUser(),
          get().communityInfo.fetchCommunities(),
        ])
    }, 'Failed to fetch data.')
  }),
})
