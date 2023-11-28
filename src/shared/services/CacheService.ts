export abstract class AbstractCacheService {
  public abstract refreshCache(): Promise<void>
}
