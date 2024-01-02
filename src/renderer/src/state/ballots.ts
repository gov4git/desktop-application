import { atom } from 'jotai'

import { Ballot } from '~/shared'

import type {
  BallotDB,
  BallotSearch,
  BallotStatus,
  BallotVoteStatus,
} from '../../../electron/db/schema.js'
import { communityAtom } from './community.js'

export const ballotsAtom = atom<Ballot[] | null>(null)

export const ballotIssuesAtom = atom((get) => {
  const ballots = get(ballotsAtom)
  if (ballots == null) return null
  return ballots.filter((b) => b.label === 'issues')
})

export const ballotPullRequestsAtom = atom((get) => {
  const ballots = get(ballotsAtom)
  if (ballots == null) return null
  return ballots.filter((b) => b.label === 'pull')
})

export const ballotsOthersAtom = atom((get) => {
  const ballots = get(ballotsAtom)
  if (ballots == null) return null
  return ballots.filter((b) => b.label === 'other')
})

export const issuesAtom = atom<BallotDB[]>([])
export const issuesSearchResultsAtom = atom({
  totalCount: 0,
  matchingCount: 0,
})
export const issuesLoadingAtom = atom<boolean>(false)
export const issueSearchAtom = atom('')

export const issuesStatusAtom = atom<BallotStatus[]>(['open'])

export const issuesVotedOnAtom = atom<BallotVoteStatus[]>([])

export const issueSearchOptionsAtom = atom<BallotSearch>((get) => {
  const community = get(communityAtom)
  const status = get(issuesStatusAtom)
  const search = get(issueSearchAtom)
  const voted = get(issuesVotedOnAtom)
  return {
    communityUrl: community?.url ?? undefined,
    status,
    search,
    label: 'issues',
    voted,
  }
})

export const pullRequestsAtom = atom<BallotDB[]>([])
export const pullRequestsSearchResultsAtom = atom({
  totalCount: 0,
  matchingCount: 0,
})
export const pullRequestsLoadingAtom = atom<boolean>(false)
export const pullRequestsSearchAtom = atom('')

export const pullRequestsStatusAtom = atom<BallotStatus[]>(['open'])

export const pullRequestsVotedOnAtom = atom<BallotVoteStatus[]>([])

export const pullRequestsearchOptionsAtom = atom<BallotSearch>((get) => {
  const community = get(communityAtom)
  const status = get(pullRequestsStatusAtom)
  const search = get(pullRequestsSearchAtom)
  const voted = get(pullRequestsVotedOnAtom)
  return {
    communityUrl: community?.url ?? undefined,
    status,
    search,
    label: 'pull',
    voted,
  }
})
