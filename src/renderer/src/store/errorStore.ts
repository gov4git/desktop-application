import { type StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

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
  tryRun: async (fn) => {
    try {
      await fn()
    } catch (ex) {
      set((s) => {
        s.error = `${ex}`
      })
    }
  },
})
