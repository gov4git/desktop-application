import { atom } from 'jotai'

import { User } from '~/shared'

export const userLoadedAtom = atom<boolean>(false)
export const userAtom = atom<User | null>(null)
