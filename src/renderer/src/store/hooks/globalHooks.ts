import { useDataStore } from '../store.js'

export function useGlobalAppUpdateInfo() {
  return useDataStore((s) => s.appUpdateInfo)
}

export function useGlobalSettingsErrors() {
  return useDataStore((s) => s.settingsErrors)
}

export function useSetGlobalAppUpdateInfo() {
  return useDataStore((s) => s.setAppUpdateInfo)
}

export function useSetGlobalSettingsError() {
  return useDataStore((s) => s.setSettingsErrors)
}

export function useCheckForUpdates() {
  return useDataStore((s) => s.checkForUpdates)
}
