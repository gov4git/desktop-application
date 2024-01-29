import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { createCommunityDashboardStore } from './communityDashboardStore.js'
import { createCommunityStore } from './communityStore.js'
import { createGlobalStore } from './globalStore.js'
import { createMotionStore } from './motionStore.js'
import type { Store } from './types.js'
import { createUserStore } from './userStore.js'

export const useDataStore = create<Store>()(
  immer((...a) => ({
    ...createGlobalStore(...a),
    ...createUserStore(...a),
    ...createMotionStore(...a),
    ...createCommunityStore(...a),
    ...createCommunityDashboardStore(...a),
  })),
)
