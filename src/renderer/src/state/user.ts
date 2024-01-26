import { atom } from 'jotai'

import type { User } from '../../../electron/db/schema.js'

export const userLoadedAtom = atom<boolean>(false)
export const userAtom = atom<User | null>(null)
