export type Config = {
  notice: string
  configPath: string
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

export abstract class AbstractSettingsService {
  public abstract validateConfig(): Promise<string[]>
  public abstract generateConfig(): Promise<Config | null>
}
