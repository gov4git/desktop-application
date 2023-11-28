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
      Authorization: `Basic ${Buffer.from(
        `${user.username}:${user.pat}`,
      ).toString('base64')}`,
    }
  }

  public getOAuthScopes = async (token: string): Promise<string[]> => {
    const response = await fetch(`${this.apiBaseUrl}`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    await response.text()
    const scopes = (response.headers.get('X-OAuth-Scopes') ?? '').split(', ')
    return scopes
  }

  protected throwIfUserDoesNotExist = async (
    user: GitUserInfo,
    from: string,
  ) => {
    if (!(await this.doesUserExist(user))) {
      throw new Error(
        `${user.username} does not exist or PAT is invalid. From ${from}`,
      )
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

  public doesPublicRepoExist = async (repoUrl: string): Promise<boolean> => {
    this.throwIfNotUrl(repoUrl, 'doesPublicRepoExist')
    try {
      const response = await fetch(repoUrl)
      await response.text()
      return response.status === 200
    } catch (ex) {
      throw new Error(`Unable to check if public repo exists. Error: ${ex}`)
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
    await this.throwIfUserDoesNotExist(user, 'doesRemoteRepoExist')
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
    await this.throwIfUserDoesNotExist(user, 'doesRemoteRepoExist')
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

  public doesUserExist = async (user: GitUserInfo): Promise<boolean> => {
    const authHeader = this.getAuthHeader(user)
    const response = await fetch(`${this.apiBaseUrl}/users/${user.username}`, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        ...authHeader,
      },
    })
    await response.text()
    if (response.status !== 200) {
      return false
    }
    return true
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
