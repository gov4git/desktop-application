import type { Community } from '../../electron/db/schema.js'

export abstract class AbstractCommunityService {
  public abstract insertCommunity(projectUrl: string): Promise<string[]>
  public abstract selectCommunity(communityUrl: string): Promise<void>
  public abstract getCommunities(): Promise<Community[]>
}
