import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { createCacheStore } from './cacheStore.js'
import { createCommunityDashboardStore } from './communityDashboardStore.js'
import { createCommunityDeployStore } from './communityDeployStore.js'
import { createCommunityJoinStore } from './communityJoinStore.js'
import { createCommunityManageStore } from './communityManageStore.js'
import { createCommunityOverviewStore } from './communityOverviewStore.js'
import { createCommunityStore } from './communityStore.js'
import { createErrorStore } from './errorStore.js'
import { createGlobalStore } from './globalStore.js'
import { createLogStore } from './logStore.js'
import { createMotionStore } from './motionStore.js'
import type { Store } from './types.js'
import { createUserStore } from './userStore.js'

export const useDataStore = create<Store>()(
  immer((...a) => ({
    ...createGlobalStore(...a),
    ...createUserStore(...a),
    ...createMotionStore(...a),
    ...createCacheStore(...a),
    ...createCommunityJoinStore(...a),
    ...createCommunityStore(...a),
    ...createCommunityDashboardStore(...a),
    ...createCommunityManageStore(...a),
    ...createCommunityDeployStore(...a),
    ...createErrorStore(...a),
    ...createLogStore(...a),
    ...createCommunityOverviewStore(...a),
  })),
)
