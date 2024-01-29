import { useDataStore } from '../store.js'

export function useCommunites() {
  return useDataStore((s) => s.communities.data)
}

export function useCommunity() {
  return useDataStore((s) => s.communities.selectedCommunity)
}

export function useSelectedCommunityUrl() {
  return useDataStore((s) => s.communities.selectedCommunityUrl)
}

export function useSetSelectedCommunityUrl() {
  return useDataStore((s) => s.communities.setSelectedCommunityUrl)
}

export function useCommunityJoinErrors() {
  return useDataStore((s) => s.communities.join.errors)
}

export function useSetCommunityJoinErrors() {
  return useDataStore((s) => s.communities.join.setErrors)
}

export function useCommunityProjectJoinUrl() {
  return useDataStore((s) => s.communities.join.projectUrl)
}

export function useSetCommunityProjectJoinUrl() {
  return useDataStore((s) => s.communities.join.setProjectUrl)
}

export function useJoinCommunity() {
  return useDataStore((s) => s.communities.join.joinCommunity)
}

export function useCommunityDashboardState() {
  return useDataStore((s) => s.communityDashboard.state)
}

export function useSetCommunityDashboardState() {
  return useDataStore((s) => s.communityDashboard.setState)
}

export function useSelectedCommunityToManage() {
  return useDataStore((s) => s.communityDashboard.manage.community)
}

export function useSetSelectedCommunityToManage() {
  return useDataStore((s) => s.communityDashboard.manage.setCommunity)
}

export function useCommunityManageLoading() {
  return useDataStore((s) => s.communityDashboard.manage.loading)
}

export function useFetchCommunities() {
  return useDataStore((s) => s.communities.fetchCommunities)
}

export function useSelectCommunity() {
  return useDataStore((s) => s.communities.selectCommunity)
}

export function useDeployCommunity() {
  return useDataStore((s) => s.communityDashboard.deploy.deployCommunity)
}

export function useIssueVotingCredits() {
  return useDataStore((s) => s.communityDashboard.manage.issueVotingCredits)
}

export function useManageIssue() {
  return useDataStore((s) => s.communityDashboard.manage.manageIssue)
}

export function useManagedCommunityUsers() {
  return useDataStore((s) => s.communityDashboard.manage.users)
}

export function useManagedCommunityIssues() {
  return useDataStore((s) => s.communityDashboard.manage.issues)
}

export function useCommunityDeployState() {
  return useDataStore((s) => s.communityDashboard.deploy.state)
}

export function useSetCommunityDeployState() {
  return useDataStore((s) => s.communityDashboard.deploy.setState)
}

export function useCommunityDeployOrg() {
  return useDataStore((s) => s.communityDashboard.deploy.selectedOrg)
}

export function useSetCommunityDeployOrg() {
  return useDataStore((s) => s.communityDashboard.deploy.setOrg)
}

export function useCommunityDeployRepo() {
  return useDataStore((s) => s.communityDashboard.deploy.selectedRepo)
}

export function useSetCommunityDeployRepo() {
  return useDataStore((s) => s.communityDashboard.deploy.setRepo)
}

export function useCommunityDeployPat() {
  return useDataStore((s) => s.communityDashboard.deploy.communityPat)
}

export function useSetCommunityDeployPat() {
  return useDataStore((s) => s.communityDashboard.deploy.setCommunityPat)
}

export function useCommunityDeployFetchOrgs() {
  return useDataStore((s) => s.communityDashboard.deploy.fetchOrgs)
}

export function useCommunityDeployOrgs() {
  return useDataStore((s) => s.communityDashboard.deploy.orgs)
}

export function useCommunityDeployRepos() {
  return useDataStore((s) => s.communityDashboard.deploy.repos)
}
