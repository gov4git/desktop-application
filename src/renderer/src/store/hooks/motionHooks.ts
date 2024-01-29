import { useDataStore } from '../store.js'

export function useMotions() {
  return useDataStore((s) => s.motions.data)
}

export function useMotionsLoading() {
  return useDataStore((s) => s.motions.loading)
}

export function useMotionsType() {
  return useDataStore((s) => s.motions.searchArgs.type)
}

export function useMotionsSearchTerm() {
  return useDataStore((s) => s.motions.searchArgs.searchTerm)
}

export function useMotionsStatus() {
  return useDataStore((s) => s.motions.searchArgs.status)
}

export function useMotionsVoteStatus() {
  return useDataStore((s) => s.motions.searchArgs.voteStatus)
}

export function useMotionsSearchArgs() {
  return useDataStore((s) => s.motions.searchArgs)
}

export function useMotionsSearchResults() {
  return useDataStore((s) => s.motions.searchResults)
}

export function useSetMotionsLoading() {
  return useDataStore((s) => s.motions.setLoading)
}

export function useSetMotionsType() {
  return useDataStore((s) => s.motions.setType)
}

export function useSetMotionsSearchTerm() {
  return useDataStore((s) => s.motions.setSearchTerm)
}

export function useSetMotionsStatus() {
  return useDataStore((s) => s.motions.setStatus)
}

export function useSetMotionsVoteStatus() {
  return useDataStore((s) => s.motions.setVoteStatus)
}

export function useFetchMotions() {
  return useDataStore((s) => s.motions.fetchMotions)
}

export function useResetMotionsSearchArgs() {
  return useDataStore((s) => s.motions.resetSearchArgs)
}

export function useMotionsVote() {
  return useDataStore((s) => s.motions.vote)
}
