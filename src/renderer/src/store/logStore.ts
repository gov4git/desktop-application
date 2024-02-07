import { type StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import { serialAsync } from '~/shared'

import { logService } from '../services/index.js'
import type { LogStore, Store } from './types.js'

export const createLogStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  LogStore
> = (set, get) => ({
  fetchLogs: serialAsync(async () => {
    try {
      return await logService.getLogs()
    } catch (ex) {
      set((s) => {
        s.exception = `Failed to fetch logs. ${ex}`
      })
      return ''
    }
  }),
})
