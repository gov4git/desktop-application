import { fetch } from 'undici'
import validator from 'validator'

export type GitUserInfo = {
  username: string
  pat: string
}

export class GitService {
  protected declare apiBaseUrl: string
  constructor() {
    this.apiBaseUrl = 'https://api.github.com'
  }

  protected isUrl = (repo: string): boolean => {
    return validator.isURL(repo)
  }

  protected throwIfNotUrl = (repoUrl: string, from: string) => {
    if (!this.isUrl(repoUrl)) {
      throw new Error(`${repoUrl} is not a valid url. From ${from}`)
    }
  }

  protected getRepoSegment = (repoUrl: string): string => {
    this.throwIfNotUrl(repoUrl, 'getRepoSegment')
    const repoParts = repoUrl.split('/')
    return `${repoParts.at(-2)}/${repoParts.at(-1)}`.replace(/\.git$/i, '')
  }

  protected getAuthHeader = (user: GitUserInfo) => {
    return {
      Authorization: `token ${user.pat}`,
    }
  }

  public getTokenMetaData = async (
    token: string,
  ): Promise<[{ scopes: string[] }, null] | [null, string[]]> => {
    try {
      const response = await fetch(`${this.apiBaseUrl}`, {
        headers: {
          Authorization: `token ${token}`,
        },
      })
      await response.text()
      if (response.status !== 200) {
        return [
          null,
          [
            `Invalid user credentials. Personal Access Token may have expired or has insufficient privileges. Please create a classic token with top-level repo rights.`,
          ],
        ]
      }
      const scopes = (response.headers.get('X-OAuth-Scopes') ?? '').split(', ')
      return [
        {
          scopes,
        },
        null,
      ]
    } catch (ex) {
      return [
        {
          scopes: [] as string[],
        },
        null,
      ]
    }
  }

  protected throwIfUserDoesNotExist = async (
    user: GitUserInfo,
    from: string,
  ) => {
    if ((await this.validateUser(user)).length > 0) {
      throw new Error(`Invalid user credentials. From ${from}`)
    }
  }

  protected throwIfRepoDoesNotExist = async (
    repoUrl: string,
    user: GitUserInfo,
    from: string,
  ) => {
    if (!(await this.doesRemoteRepoExist(repoUrl, user))) {
      throw new Error(
        `Remote repo ${repoUrl} does not exist or ${user.username} does not have rights to view it. From: ${from}`,
      )
    }
  }

  public doesRemoteRepoExist = async (
    repoUrl: string,
    user: GitUserInfo,
  ): Promise<boolean> => {
    this.throwIfNotUrl(repoUrl, 'doesRemoteRepoExist')
    await this.throwIfUserDoesNotExist(user, 'doesRemoteRepoExist')
    try {
      const authHeader = this.getAuthHeader(user)
      const repoSegment = this.getRepoSegment(repoUrl)
      const response = await fetch(`${this.apiBaseUrl}/repos/${repoSegment}`, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github+json',
          ...authHeader,
        },
      })
      await response.text()
      return response.status === 200
    } catch (ex) {
      throw new Error(
        `Unable to tell if remote repo exists ${repoUrl}. Error: ${ex}`,
      )
    }
  }

  public getDefaultBranch = async (
    repoUrl: string,
    user: GitUserInfo,
  ): Promise<string | null> => {
    this.throwIfNotUrl(repoUrl, 'getDefaultBranch')
    await this.throwIfUserDoesNotExist(user, 'getDefaultBranch')
    await this.throwIfRepoDoesNotExist(repoUrl, user, 'getDefaultBranch')
    try {
      const authHeader = this.getAuthHeader(user)
      const repoSegment = this.getRepoSegment(repoUrl)
      const response = await fetch(`${this.apiBaseUrl}/repos/${repoSegment}`, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github+json',
          ...authHeader,
        },
      })
      const results = (await response.json()) as Record<string, unknown>
      return (results['default_branch'] as string) ?? null
    } catch (ex) {
      throw new Error(
        `Unable to get default branch for ${repoUrl}, Error: ${ex}`,
      )
    }
  }

  public hasCommits = async (
    repoUrl: string,
    user: GitUserInfo,
  ): Promise<boolean> => {
    this.throwIfNotUrl(repoUrl, 'hasCommits')
    await this.throwIfUserDoesNotExist(user, 'hasCommits')
    await this.throwIfRepoDoesNotExist(repoUrl, user, 'hasCommits')
    try {
      const authHeader = this.getAuthHeader(user)
      const repoSegment = this.getRepoSegment(repoUrl)
      const response = await fetch(
        `${this.apiBaseUrl}/repos/${repoSegment}/commits`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.github+json',
            ...authHeader,
          },
        },
      )
      const results = (await response.json()) as Array<unknown>
      return results.length > 0
    } catch (ex) {
      throw new Error(
        `Unable to get default branch for ${repoUrl}, Error: ${ex}`,
      )
    }
  }

  public validateUser = async (user: GitUserInfo): Promise<string[]> => {
    const [tokenData, errors] = await this.getTokenMetaData(user.pat)

    if (Array.isArray(errors) && errors.length) {
      return errors
    }

    if (!tokenData!.scopes.includes('repo')) {
      return [
        'Personal Access Token has insufficient privileges. Please create a classic token with the top-level repo scope selected.',
      ]
    }

    try {
      const authHeader = this.getAuthHeader(user)
      const response = await fetch(`${this.apiBaseUrl}/user`, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github+json',
          ...authHeader,
        },
      })
      if (response.status !== 200) {
        return ['Invalid user credentials.']
      }
      const payload: any = await response.json()
      if (
        payload == null ||
        payload.login == null ||
        (payload.login as string).toLowerCase() !== user.username.toLowerCase()
      ) {
        return ['Invalid user credentials']
      }
      return []
    } catch (ex) {
      return [`Failed to validate user credentials. ${ex}`]
    }
  }

  protected getRepoName = (repo: string): string => {
    const repoParts = repo.split('/')
    return repoParts.at(-1)!.replace(/\.git$/gi, '')
  }

  public initializeRemoteRepo = async (
    repo: string,
    user: GitUserInfo,
    isPrivate = true,
    autoInit = false,
  ): Promise<void> => {
    this.throwIfNotUrl(repo, 'initializeRemoteRepo')
    await this.throwIfUserDoesNotExist(user, 'initializeRemoteRepo')
    try {
      if (await this.doesRemoteRepoExist(repo, user)) {
        return
      }
      const repoName = this.getRepoName(repo)

      const authHeader = this.getAuthHeader(user)

      const response = await fetch(`${this.apiBaseUrl}/user/repos`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          ...authHeader,
        },
        body: JSON.stringify({
          name: repoName,
          private: isPrivate,
          auto_init: autoInit,
          has_issues: false,
          has_projects: false,
          has_wiki: false,
          has_discussions: false,
        }),
      })
      await response.text()
    } catch (ex) {
      throw new Error(`Unable to initialize repo ${repo}. Error: ${ex}`)
    }
  }

  public deleteRepo = async (repoUrl: string, user: GitUserInfo) => {
    this.throwIfNotUrl(repoUrl, 'deleteRepo')
    await this.throwIfUserDoesNotExist(user, 'deleteRepo')
    try {
      if (!(await this.doesRemoteRepoExist(repoUrl, user))) {
        return
      }
      const repoSegment = this.getRepoSegment(repoUrl)

      const authHeader = this.getAuthHeader(user)
      const result = await fetch(`${this.apiBaseUrl}/repos/${repoSegment}`, {
        method: 'DElETE',
        headers: {
          Accept: 'application/vnd.github+json',
          ...authHeader,
        },
      })
      await result.text()
      if (result.status !== 204) {
        throw new Error(`Status code: ${result.status}`)
      }
    } catch (ex) {
      throw new Error(`Unable to delete repo ${repoUrl}. Error: ${ex}`)
    }
  }
}
