import { eq } from 'drizzle-orm'

import { AbstractValidationService } from '~/shared'

import { DB } from '../db/db.js'
import { communities, users } from '../db/schema.js'
import { CommunityService } from './CommunityService.js'
import { GitHubService } from './GitHubService.js'
import { Services } from './Services.js'
import { SettingsService } from './SettingsService.js'
import { UserService } from './UserService.js'

export type ValidationServiceOptions = {
  services: Services
}

export class ValidationService extends AbstractValidationService {
  private declare readonly services: Services
  private declare readonly communityService: CommunityService
  private declare readonly userService: UserService
  private declare readonly settingsService: SettingsService
  private declare readonly db: DB
  private declare readonly gitHubService: GitHubService

  constructor({ services }: ValidationServiceOptions) {
    super()
    this.services = services
    this.communityService = this.services.load<CommunityService>('community')
    this.userService = this.services.load<UserService>('user')
    this.settingsService = this.services.load<SettingsService>('settings')
    this.db = this.services.load<DB>('db')
    this.gitHubService = this.services.load<GitHubService>('github')
  }

  public validateConfig = async (): Promise<string[]> => {
    const [allUsers, allCommunities] = await Promise.all([
      this.db.select().from(users).limit(1),
      this.db
        .select()
        .from(communities)
        .where(eq(communities.selected, true))
        .limit(1),
    ])

    const [user, community] = [allUsers[0], allCommunities[0]]

    if (user == null || community == null) {
      return []
    }

    const initializeUserErrors = await this.userService.initializeIdRepos()
    if (initializeUserErrors.length > 0) {
      return initializeUserErrors
    }
    const initializeCommunityErrors =
      await this.communityService.insertCommunity(community.url)
    if (initializeCommunityErrors.length > 0) {
      return initializeCommunityErrors
    }

    return []
  }
}
