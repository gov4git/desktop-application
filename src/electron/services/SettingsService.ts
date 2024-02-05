import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'

import type { ServiceResponse } from '~/shared'

import { DB } from '../db/db.js'
import { communities, Community, User, users } from '../db/schema.js'
import { Services } from './Services.js'

export type SettingsServiceOptions = {
  services: Services
}

export class SettingsService {
  private declare readonly services: Services
  private declare readonly db: DB

  constructor({ services }: SettingsServiceOptions) {
    this.services = services
    this.db = this.services.load<DB>('db')
  }

  public generateConfig = async (
    user: User,
    community: Community,
  ): Promise<ServiceResponse<null>> => {
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
      gov_private_url: community.privateUrl,
      gov_private_branch: community.branch,
      member_public_url: user.memberPublicUrl,
      member_public_branch: user.memberPublicBranch,
      member_private_url: user.memberPrivateUrl,
      member_private_branch: user.memberPrivateBranch,
      auth: {
        [community.url]: {
          access_token: user.pat,
        },
        [community.privateUrl]: {
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

    try {
      const dir = dirname(community.configPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }

      writeFileSync(
        community.configPath,
        JSON.stringify(config, undefined, 2),
        'utf-8',
      )
    } catch (ex) {
      return {
        ok: false,
        statusCode: 500,
        error: `Failed to write config file ${community.configPath}. ${ex}`,
      }
    }

    return {
      ok: true,
      statusCode: 200,
      data: null,
    }
  }

  public generateConfigs = async (): Promise<void> => {
    const [allCommunities, allUsers] = await Promise.all([
      this.db.select().from(communities),
      this.db.select().from(users).limit(1),
    ])

    const user = allUsers[0]

    if (user == null) {
      return
    }

    const updates = allCommunities.map((r) => {
      return this.generateConfig(user, r)
    })

    await Promise.all(updates)
  }
}
