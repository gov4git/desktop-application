import { type StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

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
    user: null,
    loading: false,
    userLoaded: false,
    fetchUser: serialAsync(async (silent = true) => {
      await get().tryRun(async () => {
        if (!silent) {
          set((s) => {
            s.userInfo.loading = true
          })
        }
        const user = await userService.getUser()
        set((s) => {
          s.userInfo.user = user
          s.userInfo.userLoaded = true
          if (!silent) {
            s.userInfo.loading = false
          }
        })
      }, `Failed to load user.`)
    }),
    startLoginFlow: serialAsync(async () => {
      try {
        return await userService.startLoginFlow()
      } catch (ex) {
        get().setException(`Failed to start login flow. ${ex}`)
        return null
      }
    }),
    finishLoginFlow: serialAsync(async () => {
      try {
        return await userService.finishLoginFlow()
      } catch (ex) {
        get().setException(`Failed to finish login flow. ${ex}`)
        return null
      }
    }),
    logout: serialAsync(async () => {
      await get().tryRun(async () => {
        await userService.logout()
        await get().refreshCache(false)
      }, `Failed to logout.`)
    }),
    fetchAdminOrgs: serialAsync(async () => {
      try {
        return userService.getUserAdminOrgs()
      } catch (ex) {
        get().setException(`Failed to load orgs. ${ex}`)
        return []
      }
    }),
    fetchOrgRepos: serialAsync(async (org: string) => {
      try {
        return await userService.getPublicOrgRepos(org)
      } catch (ex) {
        get().setException(`Failed to load repos. ${ex}`)
        return []
      }
    }),
  },
})
