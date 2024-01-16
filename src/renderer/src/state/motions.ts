import { atom } from 'jotai'

import type {
  Motion,
  MotionSearch,
  MotionStatus,
  MotionVotedStatus,
} from '../../../electron/db/schema.js'

export const motionsAtom = atom<Motion[] | null>(null)

export const concernsAtom = atom<Motion[]>([])
export const concernSearchResultsAtom = atom({
  totalCount: 0,
  matchingCount: 0,
})
export const concernsLoadingAtom = atom<boolean>(false)
export const concernsSearchAtom = atom('')

export const concernsStatusAtom = atom<MotionStatus[]>(['open'])

export const concernsVotedOnAtom = atom<MotionVotedStatus[]>([])

export const concernSeachOptionsAtom = atom<MotionSearch>((get) => {
  const status = get(concernsStatusAtom)
  const search = get(concernsSearchAtom)
  const voted = get(concernsVotedOnAtom)
  return {
    status,
    search,
    type: 'concern',
    voted,
  }
})

export const proposalsAtom = atom<Motion[]>([])
export const proposalsSearchResultsAtom = atom({
  totalCount: 0,
  matchingCount: 0,
})
export const proposalsLoadingAtom = atom<boolean>(false)
export const proposalsSearchAtom = atom('')

export const proposalsStatusAtom = atom<MotionStatus[]>(['open'])

export const proposalsVotedOnAtom = atom<MotionVotedStatus[]>([])

export const proposalsSearchOptionsAtom = atom<MotionSearch>((get) => {
  const status = get(proposalsStatusAtom)
  const search = get(proposalsSearchAtom)
  const voted = get(proposalsVotedOnAtom)
  return {
    status,
    search,
    type: 'proposal',
    voted,
  }
})
