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
  IssueSearchResults,
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
  refreshCache: () => Promise<void>
}

export type UserStore = {
  userInfo: {
    user: User | null
    userLoaded: boolean
    fetchUser: () => Promise<void>
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
    searchArgs: Required<MotionSearch>
    searchResults: {
      totalCount: number
      matchingCount: number
    }
    fetchMotions: (
      search: MotionSearch,
      skipCache: boolean,
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
    communitiesLoaded: boolean
    selectedCommunity: Community | null
    fetchCommunities: () => Promise<void>
    selectCommunity: (communityUrl: string) => Promise<void>
  }
}

export type CommunityJoinStore = {
  joinCommunity: (projectUrl: string) => Promise<string[]>
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
  }
}

export type CommunityManageStore = {
  communityManage: {
    communityToManage: Community | null
    users: UserCredits[] | null
    issues: IssueSearchResults[] | null
    setCommunity: (community: Community) => Promise<void>
    issueVotingCredits: (credits: IssueVotingCreditsArgs) => Promise<void>
    manageIssue: (args: ManageIssueArgs) => Promise<void>
  }
}

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
  LogStore

export type Set = (
  args: Store | Partial<Store> | ((draft: Draft<Store>) => void),
  shouldReplace?: boolean,
) => void

export type Get = () => Store
