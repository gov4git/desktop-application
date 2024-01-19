import { atom } from 'jotai'

import type {
  Motion,
  MotionSearch,
  MotionStatus,
  MotionVotedStatus,
} from '../../../electron/db/schema.js'

export const motionsAtom = atom<Motion[] | null>(null)
export const motionsLoadingAton = atom<boolean>(false)
export const motionsTypeAtom = atom<'concern' | 'proposal'>('concern')
export const motionsSearchTermAtom = atom('')
export const motionsStatusAtom = atom<MotionStatus[]>(['open'])
export const motionsVoteStatusAtom = atom<MotionVotedStatus[]>([])
export const motionsSearchOptionsAtom = atom<MotionSearch>((get) => {
  const motionType = get(motionsTypeAtom)
  const status = get(motionsStatusAtom)
  const search = get(motionsSearchTermAtom)
  const voteStatus = get(motionsVoteStatusAtom)
  return {
    type: motionType,
    search,
    status,
    voted: voteStatus,
  }
})
export const motionsSearchResultsAtom = atom({
  totalCount: 0,
  matchingCount: 0,
})
