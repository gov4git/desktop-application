export abstract class AbstractCommunityService {
  public abstract insertCommunity(projectUrl: string): Promise<string[]>
  public abstract selectCommunity(communityUrl: string): Promise<void>
}
