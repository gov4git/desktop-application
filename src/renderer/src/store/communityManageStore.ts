import { StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import { serialAsync } from '~/shared'

import type { Community } from '../../../electron/db/schema.js'
import type {
  IssueVotingCreditsArgs,
  ManageIssueArgs,
} from '../../../electron/services/CommunityService.js'
import { communityService } from '../services/CommunityService.js'
import type { CommunityManageStore, Store } from './types.js'

const fetchUsers = serialAsync(async (url: string) => {
  return await communityService.getCommunityUsers(url)
})

const fetchIssues = serialAsync(async (url: string) => {
  return await communityService.getCommunityIssues(url)
})

export const createCommunityManageStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  CommunityManageStore
> = (set, get) => ({
  communityManage: {
    communityToManage: null,
    users: null,
    issues: null,
    setCommunity: serialAsync(async (community: Community | null) => {
      if (community != null) {
        set((s) => {
          s.communityManage.communityToManage = community
          s.communityManage.users = null
          s.communityManage.issues = null
        })
        await get().tryRun(async () => {
          const [users, issues] = await Promise.all([
            fetchUsers(community.url),
            fetchIssues(community.url),
          ])
          set((s) => {
            s.communityManage.users = users
            s.communityManage.issues = issues
          })
        })
      }
    }),
    issueVotingCredits: serialAsync(async (args: IssueVotingCreditsArgs) => {
      await get().tryRun(async () => {
        await communityService.issueVotingCredits(args)
        const newUsers = await fetchUsers(args.communityUrl)
        set((s) => {
          s.communityManage.users = newUsers
        })
        await get().refreshCache()
      })
    }),
    manageIssue: serialAsync(async (args: ManageIssueArgs) => {
      await get().tryRun(async () => {
        await communityService.manageIssue(args)
        const newIssues = await fetchIssues(args.communityUrl)
        set((s) => {
          s.communityManage.issues = newIssues
        })
      })
    }),
  },
})
