import { eq } from 'drizzle-orm'
import { resolve } from 'path'

import { AbstractCommunityService } from '~/shared'

import { DB } from '../db/db.js'
import { communities, Community, users } from '../db/schema.js'
import { hashString, toResolvedPath } from '../lib/paths.js'
import { GitService } from './GitService.js'
import { Services } from './Services.js'

export type CommunityServiceOptions = {
  services: Services
  configDir?: string
}

export class CommunityService extends AbstractCommunityService {
  private declare readonly services: Services
  private declare readonly configDir: string
  private declare readonly db: DB
  private declare readonly gitService: GitService

  constructor({ services, configDir = '~/.gov4git' }: CommunityServiceOptions) {
    super()
    this.services = services
    this.configDir = toResolvedPath(configDir)
    this.db = this.services.load<DB>('db')
    this.gitService = this.services.load<GitService>('git')
  }

  public validateCommunityUrl = async (
    url: string,
  ): Promise<[string | null, string[] | null]> => {
    const user = (await this.db.select().from(users).limit(1))[0]

    if (user == null) {
      return [null, ['User not set. Cannot validate community URL.']]
    }

    const errors: string[] = []
    if (!(await this.gitService.doesRemoteRepoExist(url, user))) {
      errors.push(
        `Community url, ${url}, does not exist. Please enter a valid community URL.`,
      )
      return [null, errors]
    }

    const communityMainBranch =
      (await this.gitService.getDefaultBranch(url, user)) ?? 'main'

    return [communityMainBranch, null]
  }

  public getCommunity = async (): Promise<Community | null> => {
    return (
      (
        await this.db
          .select()
          .from(communities)
          .where(eq(communities.selected, true))
      )[0] ?? null
    )
  }

  public selectCommunity = async (url: string) => {
    const community = (
      await this.db.select().from(communities).where(eq(communities.url, url))
    )[0]

    if (community == null) {
      throw new Error(`Invalid community url ${url} to select`)
    }

    await this.db.update(communities).set({ selected: false })
    await this.db
      .update(communities)
      .set({ selected: true })
      .where(eq(communities.url, url))
  }

  public insertCommunity = async (projectUrl: string): Promise<string[]> => {
    if (projectUrl === '') {
      return [`Community URL is a required field.`]
    }

    const user = (await this.db.select().from(users).limit(1))[0]
    console.log(`================ ${user?.username} ===================`)
    if (user == null) {
      return []
    }

    const projectRepoUrl = projectUrl.replace(/(\/|\.git)$/i, '')
    const communityName = projectRepoUrl.split('/').at(-1)!
    const communityUrl = `${projectRepoUrl.replace(
      /-gov\.public$/i,
      '',
    )}-gov.public.git`

    const [communityMainBranch, errors] = await this.validateCommunityUrl(
      communityUrl,
    )
    if (errors != null && errors.length > 0) {
      return errors
    }

    const configPath = resolve(
      this.configDir,
      (await hashString(communityUrl)) + '.json',
    )

    const community = {
      url: communityUrl,
      branch: communityMainBranch!,
      name: communityName,
      projectUrl: projectRepoUrl,
      configPath,
      selected: true,
    }
    await this.db.update(communities).set({ selected: false })
    await this.db.insert(communities).values(community).onConflictDoUpdate({
      target: communities.url,
      set: community,
    })

    return []
  }
}
