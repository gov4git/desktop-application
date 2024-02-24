import { StateCreator } from 'zustand'

import { serialAsync } from '~/shared'

import { communityService } from '../services/CommunityService.js'
import { CommunityStore, Store } from './types.js'

export const createCommunityStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  CommunityStore
> = (set, get) => ({
  communityInfo: {
    selectedCommunity: null,
    communities: [],
    loading: false,
    communitiesLoaded: false,
    fetchCommunities: serialAsync(async (silent = true) => {
      await get().tryRun(async () => {
        if (!silent) {
          set((s) => {
            s.communityInfo.loading = true
          })
        }
        const communities = await communityService.getCommunities()
        const selectedCommunity = communities.find((c) => c.selected) ?? null
        set((s) => {
          s.communityInfo.communities = communities
          s.communityInfo.selectedCommunity = selectedCommunity
          s.communityInfo.communitiesLoaded = true
          if (!silent) {
            s.communityInfo.loading = false
          }
        })
      }, `Failed to load communities.`)
    }),
    selectCommunity: serialAsync(async (url: string) => {
      await get().tryRun(async () => {
        await communityService.selectCommunity(url)
        const searchArgs = get().motionInfo.searchArgs
        await Promise.all([
          get().motionInfo.fetchMotions(searchArgs, false, false),
          get().communityInfo.fetchCommunities(false),
        ])
        await get().refreshCache(true)
      }, `Failed to select community.`)
    }),
  },
})
