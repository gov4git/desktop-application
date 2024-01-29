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
  communities: {
    data: [],
    selectedCommunity: null,
    selectedCommunityUrl: '',
    join: {
      errors: [],
      projectUrl: '',
      setErrors: (errors) => {
        set((s) => {
          s.communities.join.errors = errors
        })
      },
      setProjectUrl: (projectUrl: string) => {
        set((s) => {
          s.communities.join.projectUrl = projectUrl
        })
      },
      joinCommunity: serialAsync(async () => {
        try {
          set((s) => {
            s.communities.join.errors = []
          })
          const insertErrors = await communityService.insertCommunity(
            get().communities.join.projectUrl,
          )
          set((s) => {
            s.communities.join.errors = insertErrors
          })
          if (insertErrors.length === 0) {
            await get().refreshCache()
          }
        } catch (ex) {
          await get().catchError(`Failed to join community. ${ex}`)
        }
      }),
    },
    setSelectedCommunityUrl: (url: string) => {
      set((s) => {
        s.communities.selectedCommunityUrl = url
      })
    },
    fetchCommunities: serialAsync(async () => {
      try {
        const communities = await communityService.getCommunities()
        const selectedCommunity = communities.find((c) => c.selected) ?? null
        set((s) => {
          s.communities.data = communities
          s.communities.selectedCommunity = selectedCommunity
          s.communities.selectedCommunityUrl = selectedCommunity?.url ?? ''
        })
      } catch (ex) {
        await get().catchError(`Failed to load communities, ${ex}`)
      }
    }),
    selectCommunity: serialAsync(async (url: string) => {
      try {
        set((s) => {
          s.communities.selectedCommunityUrl = url
        })
        await communityService.selectCommunity(url)
        await get().refreshCache()
      } catch (ex) {
        await get().catchError(`Failed to select community ${url}, ${ex}`)
      }
    }),
  },
})
