import { useDataStore } from '../store.js'

export function useUser() {
  return useDataStore((s) => s.userInfo.user)
}

export function useUserLoaded() {
  return useDataStore((s) => s.userInfo.loaded)
}

export function useFetchUser() {
  return useDataStore((s) => s.userInfo.fetchUser)
}

export function useStartLoginFlow() {
  return useDataStore((s) => s.userInfo.startLoginFlow)
}

export function useFinishLoginFlow() {
  return useDataStore((s) => s.userInfo.finishLoginFlow)
}

export function useLogout() {
  return useDataStore((s) => s.userInfo.logout)
}

export function useFetchUserAdminOrgs() {
  return useDataStore((s) => s.userInfo.fetchAdminOrgs)
}

export function useFetchOrgRepos() {
  return useDataStore((s) => s.userInfo.fetchOrgRepos)
}
