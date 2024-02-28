import type { Verification } from '@octokit/auth-oauth-device/dist-types/types.js'
import type { Draft } from 'immer'

import type { AppUpdateInfo, ServiceErrorResponse } from '~/shared'

import type {
  Community,
  Motion,
  MotionSearch,
  MotionStatus,
  MotionVotedStatus,
  MotionVoteOption,
  User,
} from '../../../electron/db/schema.js'
import type {
  CommunityIssuesResponse,
  IssueVotingCreditsArgs,
  ManageIssueArgs,
  OrgMembershipInfo,
  UserCredits,
} from '../../../electron/services/index.js'

export type GlobalStore = {
  appUpdateInfo: AppUpdateInfo | null
  settingsErrors: string[]
  setSettingsErrors: (errors: string[]) => void
  setAppUpdateInfo: (updates: AppUpdateInfo | null) => void
  checkForUpdates: () => Promise<void>
}

export type ErrorStore = {
  error: ServiceErrorResponse | null
  clearError: () => void
  setError: (error: ServiceErrorResponse | null) => void
  exception: string | null
  clearException: () => void
  setException: (error: string | null) => void
  tryRun: (fn: () => Promise<void>, errorMessage?: string) => Promise<void>
}

export type LogStore = {
  fetchLogs: () => Promise<string>
}

export type CacheStore = {
  refreshCache: (silent?: boolean) => Promise<void>
}

export type UserStore = {
  userInfo: {
    user: User | null
    loading: boolean
    userLoaded: boolean
    fetchUser: (silent?: boolean) => Promise<void>
    startLoginFlow: () => Promise<Verification | null>
    finishLoginFlow: () => Promise<string[] | null>
    logout: () => Promise<void>
    fetchAdminOrgs: () => Promise<OrgMembershipInfo[]>
    fetchOrgRepos: (org: string) => Promise<string[]>
  }
}

export type MotionStore = {
  motionInfo: {
    motions: Motion[]
    loading: boolean
    searchArgs: Required<MotionSearch>
    searchResults: {
      totalCount: number
      matchingCount: number
    }
    fetchMotions: (
      search: MotionSearch,
      skipCache?: boolean,
      silent?: boolean,
      shouldUpdate?: () => boolean,
    ) => Promise<void>
    setType: (t: 'concern' | 'proposal') => void
    setSearchTerm: (term: string) => void
    setStatus: (status: MotionStatus[]) => void
    setVoteStatus: (voteStatus: MotionVotedStatus[]) => void
    resetSearchArgs: () => void
    vote: (voteOptions: MotionVoteOption) => Promise<null | string>
  }
}

export type CommunityStore = {
  communityInfo: {
    communities: Community[]
    loading: boolean
    communitiesLoaded: boolean
    selectedCommunity: Community | null
    fetchCommunities: (silent?: boolean) => Promise<void>
    selectCommunity: (communityUrl: string) => Promise<void>
  }
}

export type CommunityJoinStore = {
  joinCommunity: (projectUrl: string) => Promise<string[]>
}

export type CommunityDashboardState = 'overview' | 'manage'
export type CommunityDashboardStore = {
  communityDashboard: {
    state: CommunityDashboardState
    setState: (state: CommunityDashboardState) => void
  }
}

export type CommunityOverviewState = 'overview' | 'join' | 'deploy'
export type CommunityOverviewStore = {
  communityOverview: {
    state: CommunityOverviewState
    setState: (state: CommunityOverviewState) => void
  }
}

export type CommunityManageState =
  | 'overview'
  | 'users'
  | 'issues'
  | 'pull-requests'
export type CommunityManageStore = {
  communityManage: {
    state: CommunityManageState
    setState: (state: CommunityManageState) => void
    communityToManage: Community | null
    usersLoading: boolean
    users: UserCredits[] | null
    issuesLoading: boolean
    issues: CommunityIssuesResponse | null
    setCommunity: (community: Community) => void
    fetchCommunityIssues: (
      community: Community,
      silent?: boolean,
      shouldUpdate?: () => boolean,
    ) => Promise<void>
    fetchCommunityUsers: (
      Community: Community,
      silent?: boolean,
      shouldUpdate?: () => boolean,
    ) => Promise<void>
    issueVotingCredits: (credits: IssueVotingCreditsArgs) => Promise<void>
    manageIssue: (args: ManageIssueArgs) => Promise<void>
  }
}

export type CommunityDeployState =
  | 'initial'
  | 'repo-select'
  | 'provide-token'
  | 'deploy'

export type CommunityDeployStore = {
  communityDeploy: {
    state: CommunityDeployState
    selectedOrg: string
    selectedRepo: string
    communityPat: string
    orgs: OrgMembershipInfo[] | null
    repos: string[] | null
    deployCommunity: () => Promise<void>
    fetchOrgs: () => Promise<void>
    selectOrg: (orgName: string) => Promise<void>
    setState: (state: CommunityDeployState) => void
    setRepo: (repo: string) => void
    setCommunityPat: (token: string) => void
  }
}

export type Store = GlobalStore &
  UserStore &
  MotionStore &
  CacheStore &
  CommunityJoinStore &
  CommunityStore &
  CommunityDashboardStore &
  CommunityManageStore &
  CommunityDeployStore &
  ErrorStore &
  LogStore &
  CommunityOverviewStore

export type Set = (
  args: Store | Partial<Store> | ((draft: Draft<Store>) => void),
  shouldReplace?: boolean,
) => void

export type Get = () => Store
