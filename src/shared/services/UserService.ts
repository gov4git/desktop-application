import type { Verification } from '@octokit/auth-oauth-device/dist-types/types.js'

import type { User } from '../../electron/db/schema.js'
import type { OrgMembershipInfo } from '../../electron/services/GitHubService.js'

export abstract class AbstractUserService {
  public abstract getUser(): Promise<User | null>
  public abstract startLoginFlow(): Promise<Verification>
  public abstract finishLoginFlow(): Promise<string[] | null>
  public abstract logout(): Promise<void>
  public abstract getUserAdminOrgs(): Promise<OrgMembershipInfo[]>
  public abstract getPublicOrgRepos(org: string): Promise<string[]>
}
