import { atom } from 'jotai'

import { Ballot } from '~/shared'

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
