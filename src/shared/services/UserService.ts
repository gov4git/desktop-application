import type { Verification } from '@octokit/auth-oauth-device/dist-types/types.js'

import type { User } from '../../electron/db/schema.js'

export abstract class AbstractUserService {
  public abstract getUser(): Promise<User | null>
  public abstract startLoginFlow(): Promise<Verification>
  public abstract finishLoginFlow(): Promise<string[] | null>
  public abstract logout(): Promise<void>
}
