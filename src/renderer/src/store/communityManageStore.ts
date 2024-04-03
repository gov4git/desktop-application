import { StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import { serialAsync } from '~/shared'

import type { Community } from '../../../electron/db/schema.js'
import type {
  CommunityUser,
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
    state: 'overview',
    communityToManage: null,
    usersLoading: false,
    users: null,
    issuesLoading: false,
    issues: null,
    setState: (state) => {
      set((s) => {
        s.communityManage.state = state
      })
    },
    setCommunity: (community: Community | null) => {
      const currentCommunity = get().communityManage.communityToManage
      if (currentCommunity == null || currentCommunity.url != community?.url) {
        set((s) => {
          s.communityManage.communityToManage = community
          s.communityManage.users = null
          s.communityManage.issues = null
        })
      }
    },
    fetchCommunityUsers: async (
      community: Community,
      silent = true,
      shouldUpdate = () => true,
    ) => {
      await get().tryRun(async () => {
        if (!silent) {
          set((s) => {
            s.communityManage.usersLoading = true
          })
        }
        const users = await communityService.getCommunityUsers(community.url)
        if (shouldUpdate()) {
          set((s) => {
            s.communityManage.users = users
            if (!silent) {
              s.communityManage.usersLoading = false
            }
          })
        }
      }, `Failed to load users for community ${community.name}`)
    },
    fetchCommunityIssues: async (
      community: Community,
      silent = true,
      shouldUpdate = () => true,
    ) => {
      await get().tryRun(async () => {
        if (!silent) {
          set((s) => {
            s.communityManage.issuesLoading = true
          })
        }
        const issues = await communityService.getCommunityIssues(community.url)
        if (shouldUpdate()) {
          set((s) => {
            s.communityManage.issues = issues
            if (!silent) {
              s.communityManage.issuesLoading = false
            }
          })
        }
      }, `Failed to load issues for community ${community.name}`)
    },
    issueVotingCredits: serialAsync(async (args: IssueVotingCreditsArgs) => {
      await get().tryRun(async () => {
        await communityService.issueVotingCredits(args)
        const newUsers = await fetchUsers(args.communityUrl)
        set((s) => {
          s.communityManage.users = newUsers
        })
        await get().refreshCache(false)
      }, `Failed to issue ${args.credits} voting credits to ${args.username}.`)
    }),
    manageIssue: serialAsync(async (args: ManageIssueArgs) => {
      await get().tryRun(async () => {
        await communityService.manageIssue(args)
        const newIssues = await fetchIssues(args.communityUrl)
        set((s) => {
          s.communityManage.issues = newIssues
        })
      }, `Failed to manage issue #${args.issueNumber}.`)
    }),
    approveUserRequest: serialAsync(
      async (community: Community, user: CommunityUser) => {
        return await communityService.approveUserRequest(community, user)
      },
    ),
  },
})
