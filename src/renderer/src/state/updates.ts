import { atom } from 'jotai'

import { AppUpdateInfo } from '~/shared'

export const updatesAtom = atom<AppUpdateInfo | null>(null)
