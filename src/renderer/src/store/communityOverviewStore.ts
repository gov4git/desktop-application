import { StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import { CommunityOverviewStore, Store } from './types.js'

export const createCommunityOverviewStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  CommunityOverviewStore
> = (set, get) => ({
  communityOverview: {
    state: 'overview',
    setState: (state) => {
      set((s) => {
        s.communityOverview.state = state
      })
    },
  },
})
