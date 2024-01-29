import { type StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import type {
  MotionStatus,
  MotionVotedStatus,
  MotionVoteOption,
} from '../../../electron/db/schema.js'
import { motionService } from '../services/MotionService.js'
import type { MotionStore, Store } from './types.js'

export const createMotionStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  MotionStore
> = (set, get) => ({
  motions: {
    data: [],
    loading: false,
    searchArgs: {
      type: 'concern',
      searchTerm: '',
      status: ['open'],
      voteStatus: [],
    },
    searchResults: {
      totalCount: 0,
      matchingCount: 0,
    },
    setLoading: (loading: boolean) => {
      set((s) => {
        s.motions.loading = loading
      })
    },
    setType: (t: 'concern' | 'proposal') => {
      set((s) => {
        s.motions.searchArgs.type = t
      })
    },
    setSearchTerm: (term: string) => {
      set((s) => {
        s.motions.searchArgs.searchTerm = term
      })
    },
    setStatus: (status: MotionStatus[]) => {
      set((s) => {
        s.motions.searchArgs.status = status
      })
    },
    setVoteStatus: (status: MotionVotedStatus[]) => {
      set((s) => {
        s.motions.searchArgs.voteStatus = status
      })
    },
    fetchMotions: async (skipCache = false) => {
      const args = get().motions.searchArgs
      set((s) => {
        s.motions.searchResults = {
          totalCount: 0,
          matchingCount: 0,
        }
      })
      try {
        const motions = await motionService.getMotions(args, skipCache)
        set((s) => {
          s.motions.data = motions.motions
          s.motions.searchResults = {
            totalCount: motions.totalCount,
            matchingCount: motions.matchingCount,
          }
        })
      } catch (ex) {
        await get().catchError(`Failed to fetch motions. ${ex}`)
      }
    },
    resetSearchArgs: () => {
      set((s) => {
        s.motions.searchArgs = {
          type: 'concern',
          searchTerm: '',
          status: ['open'],
          voteStatus: [],
        }
      })
    },
    vote: async (voteOptions: MotionVoteOption) => {
      try {
        await motionService.vote(voteOptions)
        await get().refreshCache()
        return null
      } catch (ex: any) {
        if (
          ex != null &&
          ex.message != null &&
          typeof ex.message === 'string' &&
          (ex.message as string).toLowerCase().endsWith('ballot is closed')
        ) {
          return 'Sorry, this ballot is closed to voting. Please refresh the page to get the latest list of ballots.'
        } else {
          await get().catchError(`Failed to cast vote. ${ex}`)
          return `There was an error voting. Please view the full logs at the top of the page.`
        }
      }
    },
  },
})
