import { type StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import { validationService } from '../services/index.js'
import type { ErrorStore, Store } from './types.js'

export const createErrorStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  ErrorStore
> = (set, get) => ({
  error: null,
  clearError: () => {
    set((s) => {
      s.error = null
    })
  },
  setError: (error) => {
    set((s) => {
      s.error = error
    })
  },
  exception: null,
  clearException: () => {
    set((s) => {
      s.exception = null
    })
  },
  setException: (error) => {
    set((s) => {
      s.exception = error
    })
  },
  tryRun: async (fn, msg = '') => {
    try {
      await fn()
    } catch (ex) {
      try {
        const resp = await validationService.validate()
        if (!resp.ok) {
          if (resp.statusCode === 500) {
            set((s) => {
              s.exception = resp.error
            })
          } else {
            set((s) => {
              s.error = resp
            })
          }
        } else if (resp.statusCode === 201) {
          window.location.reload()
        } else {
          set((s) => {
            s.exception = `${msg} ${ex}`
          })
        }
      } catch (err) {
        set((s) => {
          s.exception = `${msg} ${ex}`
        })
      }
      set((s) => {
        s.motionInfo.loading = false
        s.communityInfo.loading = false
        s.userInfo.loading = false
        s.userInfo.userLoaded = true
      })
    }
  },
})
