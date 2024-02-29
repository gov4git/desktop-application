import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'

import type { ServiceResponse } from '~/shared'

import { CONFIG_PATH } from '../configs.js'
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
    community?: Community,
  ): Promise<ServiceResponse<string>> => {
    let config: Record<string, any> = {
      notice:
        'Do not modify this file. It will be overwritten by Gov4Git application',
      user: {
        username: user.username,
        pat: user.pat,
      },

      member_public_url: user.memberPublicUrl,
      member_public_branch: user.memberPublicBranch,
      member_private_url: user.memberPrivateUrl,
      member_private_branch: user.memberPrivateBranch,
      auth: {
        [user.memberPublicUrl]: {
          access_token: user.pat,
        },
        [user.memberPrivateUrl]: {
          access_token: user.pat,
        },
      },
    }

    let configPath = resolve(CONFIG_PATH, 'user-config.json')
    if (community != null) {
      configPath = community.configPath
      config = {
        ...config,
        configPath: community.configPath,
        community_name: community.name,
        project_repo: community.projectUrl,
        gov_public_url: community.url,
        gov_public_branch: community.branch,
        gov_private_url: community.privateUrl,
        gov_private_branch: community.branch,
        auth: {
          ...config['auth'],
          [community.url]: {
            access_token: user.pat,
          },
          [community.privateUrl]: {
            access_token: user.pat,
          },
        },
      }
    }

    try {
      const dir = dirname(configPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }

      writeFileSync(configPath, JSON.stringify(config, undefined, 2), 'utf-8')
    } catch (ex) {
      return {
        ok: false,
        statusCode: 500,
        error: `Failed to write config file ${configPath}. ${ex}`,
      }
    }

    return {
      ok: true,
      statusCode: 200,
      data: configPath,
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
