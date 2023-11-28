import { eq } from 'drizzle-orm'
import { existsSync, writeFileSync } from 'fs'
import { mkdir } from 'fs/promises'
import { dirname } from 'path'

import { AbstractSettingsService, Config } from '~/shared'

import { DB } from '../db/db.js'
import { communities, users } from '../db/schema.js'
import { CommunityService } from './CommunityService.js'
import { GitService } from './GitService.js'
import { Gov4GitService } from './Gov4GitService.js'
import { Services } from './Services.js'
import { UserService } from './UserService.js'

export type SettingsServiceOptions = {
  services: Services
}

export class SettingsService extends AbstractSettingsService {
  private declare readonly services: Services
  private declare readonly communityService: CommunityService
  private declare readonly userService: UserService
  private declare readonly gitService: GitService
  private declare readonly govService: Gov4GitService
  private declare readonly db: DB

  constructor({ services }: SettingsServiceOptions) {
    super()
    this.services = services
    this.db = this.services.load<DB>('db')
    this.communityService = this.services.load<CommunityService>('community')
    this.userService = this.services.load<UserService>('user')
    this.gitService = this.services.load<GitService>('git')
    this.govService = this.services.load<Gov4GitService>('gov4git')
  }

  private runGov4GitInit = async (config: Config) => {
    const user = config.user
    const isPublicEmpty = !(await this.gitService.hasCommits(
      config.member_public_url!,
      user,
    ))
    const isPrivateEmpty = !(await this.gitService.hasCommits(
      config.member_private_url!,
      user,
    ))

    if (isPublicEmpty || isPrivateEmpty) {
      this.govService.mustRun('init-id')
    }
  }

  public generateConfig = async () => {
    const [allCommunities, allUsers] = await Promise.all([
      this.db
        .select()
        .from(communities)
        .where(eq(communities.selected, true))
        .limit(1),
      this.db.select().from(users).limit(1),
    ])

    const community = allCommunities[0]
    const user = allUsers[0]

    if (community == null || user == null) {
      return null
    }

    const config = {
      notice:
        'Do not modify this file. It will be overwritten by Gov4Git application',
      configPath: community.configPath,
      community_name: community.name,
      project_repo: community.projectUrl,
      user: {
        username: user.username,
        pat: user.pat,
      },
      gov_public_url: community.url,
      gov_public_branch: community.branch,
      member_public_url: user.memberPublicUrl,
      member_public_branch: user.memberPublicBranch,
      member_private_url: user.memberPrivateUrl,
      member_private_branch: user.memberPrivateBranch,
      auth: {
        [community.url]: {
          access_token: user.pat,
        },
        [user.memberPublicUrl]: {
          access_token: user.pat,
        },
        [user.memberPrivateUrl]: {
          access_token: user.pat,
        },
      },
    }

    const dir = dirname(community.configPath)
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    writeFileSync(
      community.configPath,
      JSON.stringify(config, undefined, 2),
      'utf-8',
    )

    await this.runGov4GitInit(config)

    return config
  }

  public validateConfig = async (): Promise<string[]> => {
    const config = await this.generateConfig()
    if (config == null) return []
    const userErrors = await this.userService.validateUser(
      config.user.username,
      config.user.pat,
    )
    if (userErrors.length > 0) {
      return userErrors
    }
    const [, communityErrors] =
      await this.communityService.validateCommunityUrl(config.gov_public_url)
    return communityErrors ?? []
  }
}
