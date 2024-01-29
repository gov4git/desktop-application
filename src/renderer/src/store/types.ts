import type { Verification } from '@octokit/auth-oauth-device/dist-types/types.js'

import type { AppUpdateInfo } from '~/shared'

import type {
  Community,
  Motion,
  MotionStatus,
  MotionVotedStatus,
  MotionVoteOption,
  User,
} from '../../../electron/db/schema.js'
import type {
  IssueSearchResults,
  IssueVotingCreditsArgs,
  ManageIssueArgs,
  OrgMembershipInfo,
  UserCredits,
} from '../../../electron/services/index.js'

export type GlobalStore = {
  loading: boolean
  error: string
  appUpdateInfo: AppUpdateInfo | null
  settingsErrors: string[]
  setSettingsErrors: (errors: string[]) => void
  setLoading: (loading: boolean) => void
  setAppUpdateInfo: (updates: AppUpdateInfo | null) => void
  setError: (err: string) => void
  refreshCache: () => Promise<void>
  catchError: (error: string) => Promise<void>
  checkForUpdates: () => Promise<void>
}

export type UserStore = {
  userInfo: {
    loaded: boolean
    user: User | null
    setUser: (user: User | null) => void
    setLoaded: (loading: boolean) => void
    fetchUser: () => Promise<void>
    startLoginFlow: () => Promise<Verification | null>
    finishLoginFlow: () => Promise<string[] | null>
    logout: () => Promise<void>
    fetchAdminOrgs: () => Promise<OrgMembershipInfo[]>
    fetchOrgRepos: (org: string) => Promise<string[]>
  }
}

export type MotionStore = {
  motions: {
    data: Motion[]
    loading: boolean
    searchArgs: {
      type: 'concern' | 'proposal'
      searchTerm: string
      status: MotionStatus[]
      voteStatus: MotionVotedStatus[]
    }
    searchResults: {
      totalCount: number
      matchingCount: number
    }
    setLoading: (loading: boolean) => void
    setType: (t: 'concern' | 'proposal') => void
    setSearchTerm: (term: string) => void
    setStatus: (status: MotionStatus[]) => void
    setVoteStatus: (voteStatus: MotionVotedStatus[]) => void
    fetchMotions: (skipCache?: boolean) => Promise<void>
    resetSearchArgs: () => void
    vote: (voteOptions: MotionVoteOption) => Promise<null | string>
  }
}

export type CommunityStore = {
  communities: {
    data: Community[]
    selectedCommunity: Community | null
    selectedCommunityUrl: string
    join: {
      errors: string[]
      projectUrl: string
      setProjectUrl: (projectUrl: string) => void
      joinCommunity: () => Promise<void>
      setErrors: (errors: string[]) => void
    }
    setSelectedCommunityUrl: (url: string) => void
    fetchCommunities: () => Promise<void>
    selectCommunity: (url: string) => Promise<void>
  }
}
export type CommunityDashboardState = 'initial' | 'join' | 'deploy' | 'manage'
export type CommunityDeployState =
  | 'initial'
  | 'repo-select'
  | 'provide-token'
  | 'deploy'

export type CommunityDashboardStore = {
  communityDashboard: {
    state: CommunityDashboardState
    setState: (state: CommunityDashboardState) => void
    manage: {
      loading: boolean
      community: Community | null
      users: UserCredits[]
      issues: IssueSearchResults[]
      setCommunity: (community: Community | null) => Promise<void>
      issueVotingCredits: (args: IssueVotingCreditsArgs) => Promise<void>
      manageIssue: (args: ManageIssueArgs) => Promise<void>
      fetchUsers: (url: string) => Promise<void>
      fetchIssues: (url: string) => Promise<void>
    }
    deploy: {
      state: CommunityDeployState
      orgs: OrgMembershipInfo[]
      selectedOrg: string
      repos: string[] | null
      selectedRepo: string
      communityPat: string
      setState: (state: CommunityDeployState) => void
      setOrg: (org: string) => Promise<void>
      setRepo: (repo: string) => void
      fetchOrgs: () => Promise<void>
      setCommunityPat: (token: string) => void
      deployCommunity: () => Promise<void>
    }
  }
}

export type Store = GlobalStore &
  UserStore &
  MotionStore &
  CommunityStore &
  CommunityDashboardStore
