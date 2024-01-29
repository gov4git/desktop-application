import { type StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import type { User } from '../../../electron/db/schema.js'
import { serialAsync } from '../../../shared/index.js'
import { userService } from '../services/UserService.js'
import type { Store, UserStore } from './types.js'

export const createUserStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  UserStore
> = (set, get) => ({
  userInfo: {
    loaded: false,
    user: null,
    setLoaded: (loaded: boolean) => {
      set((s) => {
        s.userInfo.loaded = loaded
      })
    },
    setUser: (user: User | null) => {
      set((s) => {
        s.userInfo.user = user
      })
    },
    fetchUser: serialAsync(async () => {
      try {
        const user = await userService.getUser()
        set((s) => {
          s.userInfo.user = user
          s.userInfo.loaded = true
        })
      } catch (ex) {
        await get().catchError(`Failed to load user information. ${ex}`)
      }
    }),
    startLoginFlow: serialAsync(async () => {
      try {
        return await userService.startLoginFlow()
      } catch (ex) {
        await get().catchError(`Failed to login. ${ex}`)
        return null
      }
    }),
    finishLoginFlow: serialAsync(async () => {
      try {
        return await userService.finishLoginFlow()
      } catch (ex) {
        await get().catchError(`Failed to login. ${ex}`)
        return null
      }
    }),
    logout: serialAsync(async () => {
      try {
        await userService.logout()
      } catch (ex) {
        await get().catchError(`Failed to logout. ${ex}`)
      }
    }),
    fetchAdminOrgs: serialAsync(async () => {
      try {
        return userService.getUserAdminOrgs()
      } catch (ex) {
        await get().catchError(`Failed to load user orgs. ${ex}`)
        return []
      }
    }),
    fetchOrgRepos: serialAsync(async (org: string) => {
      try {
        return await userService.getPublicOrgRepos(org)
      } catch (ex) {
        await get().catchError(`Failed to load Repos for ${org}. ${ex}`)
        return []
      }
    }),
  },
})
