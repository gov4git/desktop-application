import { StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import { CommunityDashboardStore, Store } from './types.js'

export const createCommunityDashboardStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  CommunityDashboardStore
> = (set, get) => ({
  communityDashboard: {
    state: 'initial',
    setState: (state) => {
      set((s) => {
        s.communityDashboard.state = state
      })
    },
  },
})
