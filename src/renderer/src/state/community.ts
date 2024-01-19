import { atom } from 'jotai'

import { type Community } from '../../../electron/db/schema.js'

export const communitiesAtom = atom<Community[]>([])

export const communityAtom = atom<Community | null>((get) => {
  const communities = get(communitiesAtom)
  const selectedCommunity = communities.filter((c) => c.selected === true)[0]
  return selectedCommunity ?? null
})

export const selectedCommunityUrlAtom = atom<string>('')

export const newProjectUrlAtom = atom<string>('')
export const insertCommunityErrors = atom<string[]>([])
