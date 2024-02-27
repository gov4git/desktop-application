import { eq, sql } from 'drizzle-orm'

import { serialAsync } from '../../shared/index.js'
import { type DB } from '../db/db.js'
import { communities, type Community, policies, Policy } from '../db/schema.js'
import { Gov4GitService } from './Gov4GitService.js'
import { type Services } from './Services.js'

export type PolicyServiceOptions = {
  services: Services
}

type Gov4GitPolicy = {
  description: string
  github_label: string
  applies_to_concern: boolean
  applies_to_proposal: boolean
}

export class PolicyService {
  private declare readonly services: Services
  private declare readonly db: DB
  private declare readonly govService: Gov4GitService

  constructor({ services }: PolicyServiceOptions) {
    this.services = services
    this.db = this.services.load<DB>('db')
    this.govService = this.services.load<Gov4GitService>('gov4git')
  }

  private getCommunityByUrl = async (url: string) => {
    const community = (
      await this.db
        .select()
        .from(communities)
        .where(eq(communities.url, url))
        .limit(1)
    )[0]

    return community ?? null
  }

  private loadPolicies = serialAsync(async (community: Community) => {
    const g4gCommand = ['motion', 'policies']

    const policyData = await this.govService.mustRun<
      Record<string, Gov4GitPolicy>
    >(g4gCommand, community)

    for (const [title, data] of Object.entries(policyData)) {
      await this.db.insert(policies).values({
        title,
        communityUrl: community.url,
        motionType: data.applies_to_concern ? 'concern' : 'proposal',
        description: data.description,
        githubLabel: data.github_label,
      })
    }
  })

  public getPolicies = serialAsync(
    async (communityUrl: string, skipCache = false): Promise<Policy[]> => {
      const community = await this.getCommunityByUrl(communityUrl)

      if (community == null) {
        throw new Error(`404. Community not found for for ${communityUrl}`)
      }

      if (skipCache) {
        await this.db
          .delete(policies)
          .where(eq(policies.communityUrl, communityUrl))
      }

      const policyCount = (
        await this.db
          .select({
            count: sql<number>`count(*)`,
          })
          .from(policies)
          .where(eq(policies.communityUrl, community.url))
      )[0]

      if (policyCount == null || policyCount.count === 0) {
        await this.loadPolicies(community)
      }

      return await this.db
        .select()
        .from(policies)
        .where(eq(policies.communityUrl, community.url))
    },
  )
}
