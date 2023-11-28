export type Community = {
  url: string
  name: string
  branch: string
  configPath: string
  projectUrl: string
  selected: boolean
}

export abstract class AbstractCommunityService {
  public abstract getCommunity(): Promise<Community | null>

  public abstract insertCommunity(projectUrl: string): Promise<string[]>
}
