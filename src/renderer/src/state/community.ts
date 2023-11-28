import { atom } from 'jotai'

import type { Community } from '~/shared'

export const communityAtom = atom<Community | null>(null)
