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
  refreshCache: serialAsync(async (silent = true) => {
    await get().tryRun(async () => {
      if (!silent) {
        set((s) => {
          s.communityInfo.loading = true
        })
      }

      const searchArgs = get().motionInfo.searchArgs
      await get().motionInfo.fetchMotions(searchArgs, true, silent),
        await Promise.all([
          get().userInfo.fetchUser(silent),
          get().communityInfo.fetchCommunities(silent),
        ])
    }, 'Failed to fetch data.')
  }),
})
