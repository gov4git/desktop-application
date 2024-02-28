import { type StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import type {
  MotionSearch,
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
  motionInfo: {
    motions: [],
    loading: false,
    searchArgs: {
      type: 'concern',
      search: '',
      status: ['open'],
      voted: [],
    },
    searchResults: {
      totalCount: 0,
      matchingCount: 0,
    },
    fetchMotions: async (
      args: MotionSearch,
      skipCache = false,
      silent = true,
      shouldUpdate = () => true,
    ) => {
      await get().tryRun(async () => {
        if (!silent) {
          set((s) => {
            s.motionInfo.loading = true
          })
        }
        const motions = await motionService.getMotions(args, skipCache)
        if (shouldUpdate()) {
          set((s) => {
            s.motionInfo.motions = motions.motions
            s.motionInfo.searchResults = {
              totalCount: motions.totalCount,
              matchingCount: motions.matchingCount,
            }
            if (!silent) {
              s.motionInfo.loading = false
            }
          })
        }
      }, `Failed to load motions.`)
    },
    setType: (t: 'concern' | 'proposal') => {
      set((s) => {
        s.motionInfo.searchArgs.type = t
      })
    },
    setSearchTerm: (term: string) => {
      set((s) => {
        s.motionInfo.searchArgs.search = term
      })
    },
    setStatus: (status: MotionStatus[]) => {
      set((s) => {
        s.motionInfo.searchArgs.status = status
      })
    },
    setVoteStatus: (status: MotionVotedStatus[]) => {
      set((s) => {
        s.motionInfo.searchArgs.voted = status
      })
    },
    resetSearchArgs: () => {
      set((s) => {
        s.motionInfo.searchArgs = {
          type: 'concern',
          search: '',
          status: ['open'],
          voted: [],
        }
      })
    },
    vote: async (voteOptions: MotionVoteOption) => {
      try {
        await motionService.vote(voteOptions)
        await get().refreshCache(true)
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
          get().setException(`Failed to vote. ${ex}`)
          return `There was an error voting. Please view the full logs at the top of the page.`
        }
      }
    },
  },
})
