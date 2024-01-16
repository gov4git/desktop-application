import { Verification } from '@octokit/auth-oauth-device/dist-types/types.js'
import { atom } from 'jotai'

import type { User } from '../../../electron/db/schema.js'

export const userLoadedAtom = atom<boolean>(false)
export const userAtom = atom<User | null>(null)

export const userVerificationAtom = atom<Verification | null>(null)
export const userLoginErrorsAtom = atom<string[] | null>(null)
