export type Config = {
  cache_dir?: string
  cache_ttl_seconds?: number
  user: {
    username: string
    pat: string
  }
  community_name: string
  project_repo: string
  auth: Record<string, { access_token: string }>
  gov_public_url: string
  gov_public_branch: string
  gov_private_url?: string
  gov_private_branch?: string
  member_public_url: string
  member_public_branch: string
  member_private_url: string
  member_private_branch: string
}

export type ConfigMeta = {
  communityUrl: string
  name: string
  path: string
  projectUrl: string
}

export abstract class AbstractConfigService {
  public abstract getAvailableConfigs(): Promise<ConfigMeta[]>
  public abstract selectConfig(communityUrl: string): Promise<void>
  public abstract getConfig(): Promise<Config | null>
  public abstract createOrUpdateConfig(
    config: Partial<Config>,
  ): Promise<string[]>
  public abstract validateSettings(): Promise<string[]>
}
