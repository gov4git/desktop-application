import { StateCreator } from 'zustand'

import { serialAsync } from '~/shared'

import { communityService } from '../services/CommunityService.js'
import { CommunityJoinStore, Store } from './types.js'

export const createCommunityJoinStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  CommunityJoinStore
> = (set, get) => ({
  joinCommunity: serialAsync(async (projectUrl: string) => {
    try {
      set((s) => {
        s.communityInfo.loading = true
        s.motionInfo.loading = true
      })
      const communities = get().communityInfo.communities
      const [communityUrl, insertErrors] =
        await communityService.insertCommunity(projectUrl)
      if (insertErrors.length === 0) {
        if (communities.length === 0) {
          await get().communityInfo.selectCommunity(communityUrl)
        } else {
          await get().communityInfo.fetchCommunities(false)
        }
      }
      set((s) => {
        s.communityInfo.loading = false
        s.motionInfo.loading = false
      })
      return insertErrors
    } catch (ex) {
      get().setException(`Failed to join community. ${ex}`)
      return []
    }
  }),
})
