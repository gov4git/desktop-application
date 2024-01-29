import { type StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import { AppUpdateInfo, serialAsync } from '~/shared'

import { appUpdaterService } from '../services/AppUpdaterService.js'
import { validationService } from '../services/ValidationService.js'
import type { GlobalStore, Store } from './types.js'

export const createGlobalStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  GlobalStore
> = (set, get) => ({
  loading: false,
  error: '',
  appUpdateInfo: null,
  settingsErrors: [],
  setLoading: (loading: boolean) => {
    set((s) => {
      s.loading = loading
    })
  },
  setError: (err: string) => {
    set((s) => {
      s.error = err
    })
  },
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
  refreshCache: serialAsync(async () => {
    try {
      await get().motions.fetchMotions(true),
        await Promise.all([
          get().userInfo.fetchUser(),
          get().communities.fetchCommunities(),
        ])
    } catch (ex) {
      await get().catchError(`Failed to refresh cache. ${ex}`)
    }
  }),
  catchError: async (error: string) => {
    try {
      const settingsError = await validationService.validateConfig()
      if (settingsError.length > 0) {
        set((s) => {
          s.settingsErrors = settingsError
        })
      } else {
        set((s) => {
          s.error = error
        })
      }
    } catch (ex) {
      set((s) => {
        s.error = error
      })
    }
  },
  checkForUpdates: serialAsync(async () => {
    try {
      const updateInfo = await appUpdaterService.checkForUpdates()
      set((s) => {
        s.appUpdateInfo = updateInfo
      })
    } catch (ex) {
      await get().catchError(`Failed to check for updates. ${ex}`)
    }
  }),
})
