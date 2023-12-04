import { atom } from 'jotai'

import { type FullUser } from '../../../electron/db/schema.js'

export const userLoadedAtom = atom<boolean>(false)
export const userAtom = atom<FullUser | null>(null)
