import { StateCreator } from 'zustand'

import { serialAsync } from '~/shared'

import type { Community } from '../../../electron/db/schema.js'
import type {
  IssueVotingCreditsArgs,
  ManageIssueArgs,
} from '../../../electron/services/CommunityService.js'
import { communityService } from '../services/CommunityService.js'
import { CommunityDashboardStore, Store } from './types.js'

export const createCommunityDashboardStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  CommunityDashboardStore
> = (set, get) => ({
  communityDashboard: {
    state: 'initial',
    setState: (state) => {
      set((s) => {
        s.communityDashboard.state = state
      })
    },
    manage: {
      loading: false,
      community: null,
      users: [],
      issues: [],
      setCommunity: serialAsync(async (community: Community | null) => {
        set((s) => {
          s.communityDashboard.manage.community = community
          if (community == null) {
            s.communityDashboard.manage.users = []
            s.communityDashboard.manage.issues = []
          }
        })
        if (community != null) {
          set((s) => {
            s.communityDashboard.manage.loading = true
          })
          await Promise.all([
            get().communityDashboard.manage.fetchUsers(community.url),
            get().communityDashboard.manage.fetchIssues(community.url),
          ])
          set((s) => {
            s.communityDashboard.manage.loading = false
          })
        }
      }),
      issueVotingCredits: serialAsync(async (args: IssueVotingCreditsArgs) => {
        try {
          await communityService.issueVotingCredits(args)
          await Promise.all([
            get().communityDashboard.manage.fetchUsers(args.communityUrl),
            get().refreshCache(),
          ])
        } catch (ex) {
          await get().catchError(`Failed to issue voting credits. ${ex}`)
        }
      }),
      manageIssue: serialAsync(async (args: ManageIssueArgs) => {
        try {
          await communityService.manageIssue(args)
          await get().communityDashboard.manage.fetchIssues(args.communityUrl)
        } catch (ex) {
          await get().catchError(`Failed to manage issue. ${ex}`)
        }
      }),
      fetchUsers: serialAsync(async (url: string) => {
        try {
          const users = await communityService.getCommunityUsers(url)
          set((s) => {
            s.communityDashboard.manage.users = users
          })
        } catch (ex) {
          await get().catchError(`Failed to load users for ${url}. ${ex}`)
        }
      }),
      fetchIssues: serialAsync(async (url: string) => {
        try {
          const issues = await communityService.getCommunityIssues(url)
          set((s) => {
            s.communityDashboard.manage.issues = issues
          })
        } catch (ex) {
          await get().catchError(`Failed to load issues for ${url}. ${ex}`)
        }
      }),
    },
    deploy: {
      state: 'initial',
      orgs: [],
      selectedOrg: '',
      repos: null,
      selectedRepo: '',
      communityPat: '',
      setState: (state) => {
        set((s) => {
          s.communityDashboard.deploy.state = state
        })
      },
      setOrg: serialAsync(async (org: string) => {
        set((s) => {
          s.communityDashboard.deploy.repos = null
        })
        let repos: string[] = []
        if (org !== '') {
          repos = await get().userInfo.fetchOrgRepos(org)
        }
        set((s) => {
          s.communityDashboard.deploy.selectedOrg = org
          s.communityDashboard.deploy.repos = repos
        })
      }),
      setRepo: (repo) => {
        set((s) => {
          s.communityDashboard.deploy.selectedRepo = repo
        })
      },
      setCommunityPat: (token) => {
        set((s) => {
          s.communityDashboard.deploy.communityPat = token
        })
      },
      fetchOrgs: serialAsync(async () => {
        const orgs = await get().userInfo.fetchAdminOrgs()
        set((s) => {
          s.communityDashboard.deploy.orgs = orgs
        })
      }),
      deployCommunity: serialAsync(async () => {
        const org = get().communityDashboard.deploy.selectedOrg
        const repo = get().communityDashboard.deploy.selectedRepo
        const token = get().communityDashboard.deploy.communityPat
        if (org !== '' && repo !== '' && token !== '') {
          try {
            await communityService.deployCommunity({
              org,
              repo,
              token,
            })
            await get().refreshCache()
          } catch (ex) {
            await get().catchError(`Failed to deploy community. ${ex}`)
          }
        }
      }),
    },
  },
})
