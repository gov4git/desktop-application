import { useDataStore } from '../store.js'

export function useGlobalLoading() {
  return useDataStore((s) => s.loading)
}

export function useGlobalError() {
  return useDataStore((s) => s.error)
}

export function useGlobalAppUpdateInfo() {
  return useDataStore((s) => s.appUpdateInfo)
}

export function useGlobalSettingsErrors() {
  return useDataStore((s) => s.settingsErrors)
}

export function useSetGlobalLoading() {
  return useDataStore((s) => s.setLoading)
}

export function useSetGlobalError() {
  return useDataStore((s) => s.setError)
}

export function useSetGlobalAppUpdateInfo() {
  return useDataStore((s) => s.setAppUpdateInfo)
}

export function useSetGlobalSettingsError() {
  return useDataStore((s) => s.setSettingsErrors)
}

export function useGlobalRefreshCache() {
  return useDataStore((s) => s.refreshCache)
}

export function useCatchError() {
  return useDataStore((s) => s.catchError)
}

export function useCheckForUpdates() {
  return useDataStore((s) => s.checkForUpdates)
}
