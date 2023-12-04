export abstract class AbstractCommunityService {
  public abstract insertCommunity(projectUrl: string): Promise<string[]>
}
