import { type StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import { AppUpdateInfo, serialAsync } from '~/shared'

import { appUpdaterService } from '../services/AppUpdaterService.js'
import type { GlobalStore, Store } from './types.js'

export const createGlobalStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  GlobalStore
> = (set, get) => ({
  appUpdateInfo: null,
  settingsErrors: [],
  setAppUpdateInfo: (updates: AppUpdateInfo | null) => {
    set((s) => {
      s.appUpdateInfo = updates
    })
  },
  setSettingsErrors: (errors: string[]) => {
    set((s) => {
      s.settingsErrors = errors
    })
  },
  checkForUpdates: serialAsync(async () => {
    await get().tryRun(async () => {
      const updateInfo = await appUpdaterService.checkForUpdates()
      set((s) => {
        s.appUpdateInfo = updateInfo
      })
    }, `Failed to check for app updates.`)
  }),
})
