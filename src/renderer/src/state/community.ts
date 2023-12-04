import { atom } from 'jotai'

import { type FullUserCommunity } from '../../../electron/db/schema.js'
import { userAtom } from './user.js'

export const communitiesAtom = atom<FullUserCommunity[]>((get) => {
  const user = get(userAtom)
  if (user == null) return []
  return user.communities
})

export const communityAtom = atom<FullUserCommunity | null>((get) => {
  const communities = get(communitiesAtom)
  const selectedCommunity = communities.filter((c) => c.selected === true)[0]
  return selectedCommunity ?? null
})
