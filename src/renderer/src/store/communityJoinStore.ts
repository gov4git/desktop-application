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
      const insertErrors = await communityService.insertCommunity(projectUrl)
      if (insertErrors.length === 0) {
        await get().refreshCache()
      }
      return insertErrors
    } catch (ex) {
      get().setError(`${ex}`)
      return []
    }
  }),
})
