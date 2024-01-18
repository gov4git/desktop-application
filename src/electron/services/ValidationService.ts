import { eq } from 'drizzle-orm'

import { AbstractValidationService } from '~/shared'

import { DB } from '../db/db.js'
import { communities, users } from '../db/schema.js'
import { CommunityService } from './CommunityService.js'
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
  private declare db: DB

  constructor({ services }: ValidationServiceOptions) {
    super()
    this.services = services
    this.communityService = this.services.load<CommunityService>('community')
    this.userService = this.services.load<UserService>('user')
    this.settingsService = this.services.load<SettingsService>('settings')
    this.db = this.services.load<DB>('db')
  }

  public validateConfig = async (): Promise<string[]> => {
    const [userRows, communityRows] = await Promise.all([
      this.db.select().from(users).limit(1),
      this.db
        .select()
        .from(communities)
        .where(eq(communities.selected, true))
        .limit(1),
    ])

    const [user, community] = [userRows[0], communityRows[0]]

    if (user == null || community == null) {
      return []
    }

    return []

    // const config = await this.settingsService.generateConfig(user, community)
    // if (config == null) return []
    // const [, communityErrors] =
    //   await this.communityService.validateCommunityUrl(config.gov_public_url)
    // return communityErrors ?? []
  }
}
