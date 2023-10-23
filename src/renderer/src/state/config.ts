import { atom } from 'jotai'

import type { Config } from '~/shared'

export const configAtom = atom<Config | null>(null)

export const configErrorsAtom = atom<string[]>([])
