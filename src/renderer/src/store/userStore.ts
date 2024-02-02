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
    fetchUser: serialAsync(async () => {
      await get().tryRun(async () => {
        const user = await userService.getUser()
        set((s) => {
          s.userInfo.user = user
        })
      })
    }),
    startLoginFlow: serialAsync(async () => {
      try {
        return await userService.startLoginFlow()
      } catch (ex) {
        get().setError(`${ex}`)
        return null
      }
    }),
    finishLoginFlow: serialAsync(async () => {
      try {
        return await userService.finishLoginFlow()
      } catch (ex) {
        get().setError(`${ex}`)
        return null
      }
    }),
    logout: serialAsync(async () => {
      await get().tryRun(async () => {
        await userService.logout()
        await get().refreshCache()
      })
    }),
    fetchAdminOrgs: serialAsync(async () => {
      try {
        return userService.getUserAdminOrgs()
      } catch (ex) {
        get().setError(`${ex}`)
        return []
      }
    }),
    fetchOrgRepos: serialAsync(async (org: string) => {
      try {
        return await userService.getPublicOrgRepos(org)
      } catch (ex) {
        get().setError(`${ex}`)
        return []
      }
    }),
  },
})
