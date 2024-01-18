import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device'
import {
  OAuthAppAuthentication,
  OAuthAppAuthInterface,
  Verification,
} from '@octokit/auth-oauth-device/dist-types/types.js'
import { request } from '@octokit/request'

import { retryAsync } from '../../shared/index.js'
import { Services } from './Services.js'

export type GitHubServiceOptions = {
  services: Services
  clientId: string
}

export type GetRepoInfoArgs = {
  repoName: string
  username: string
  token: string
}

export type CreateRepoArgs = {
  repoName: string
  isPrivate: boolean
  autoInit?: boolean
  token: string
}

export type DeleteRepoArgs = {
  repoName: string
  repoOwner: string
  token: string
}

export type HasCommitsArs = {
  repoName: string
  username: string
  token: string
}

export type CreateIssueArgs = {
  repoName: string
  username: string
  token: string
  title: string
  body: string
  labels?: string[]
}

export type SearchUserIssues = {
  repoOwner: string
  repoName: string
  username: string
  token: string
  title: string
}

export type IssueSearchResult2 = {
  id: number
  html_url: string
  title: string
  body: string
  state: 'open' | 'closed'
}

export class GitHubService {
  protected declare readonly services: Services
  protected declare readonly authenticate: OAuthAppAuthInterface
  protected declare authVerification: Verification | null
  protected declare oauthTokenInfo: Promise<OAuthAppAuthentication> | null

  constructor({ services, clientId }: GitHubServiceOptions) {
    this.services = services
    this.authenticate = createOAuthDeviceAuth({
      clientType: 'oauth-app',
      clientId,
      scopes: ['repo'],
      onVerification: (verification) => {
        this.authVerification = verification
      },
    })
  }

  private awaitAuthCode = async (maxInSeconds = 120): Promise<Verification> => {
    return new Promise((res, rej) => {
      const maxCount = maxInSeconds * 10
      let count = 0
      const interval = setInterval(() => {
        if (this.authVerification != null) {
          clearInterval(interval)
          res(this.authVerification)
        }
        if (count >= maxCount) {
          rej(new Error(`Failed to await auth code.`))
        }
        count += 1
      }, 100)
    })
  }

  public startLoginFlow = async () => {
    this.authVerification = null
    this.oauthTokenInfo = null
    this.oauthTokenInfo = this.authenticate({ type: 'oauth' })
    return this.awaitAuthCode()
  }

  public finishLoginFlow = async (): Promise<
    [OAuthAppAuthentication | null, string[]]
  > => {
    if (this.oauthTokenInfo == null) {
      return [
        null,
        [
          `Failed to finish login flow as login flow has not started. Initiate login flow first.`,
        ],
      ]
    }

    const errors: string[] = []
    let tokenInfo: OAuthAppAuthentication
    try {
      tokenInfo = await this.oauthTokenInfo
    } catch (ex: any) {
      return [null, [`Failed to log in. ${JSON.stringify(ex.response.data)}`]]
    }

    const scopes = tokenInfo.scopes[0]!.split(',')
    if (!scopes.includes('repo')) {
      errors.push(
        'Authorization has insufficient privileges. Must approve the repo scope.',
      )
    }
    if (errors.length > 0) {
      return [null, errors]
    }
    return [tokenInfo, []]
  }

  private req = (retries = 2): typeof request => {
    return retryAsync(request, retries) as typeof request
  }

  private reqWithAuth = (token: string, retries = 2): typeof request => {
    return retryAsync(
      request.defaults({
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
      retries,
    ) as typeof request
  }

  public getAuthenticatedUser = async (token: string) => {
    return await this.reqWithAuth(token)('GET /user')
  }

  public run = async (
    req: typeof request,
    expectedStatus: number,
    ...args: Parameters<typeof request>
  ): ReturnType<typeof request> => {
    const response = await req(...args)
    if (response.status !== expectedStatus) {
      throw response
    }
    return response
  }

  public getRepoInfo = async ({
    repoName,
    username,
    token,
  }: GetRepoInfoArgs) => {
    return await this.run(
      this.reqWithAuth(token),
      200,
      'GET /repos/{owner}/{repo}',
      {
        owner: username,
        repo: repoName,
      },
    )
  }

  public getDefaultBranch = async (args: GetRepoInfoArgs) => {
    try {
      const response = await this.getRepoInfo(args)
      return response.data.default_branch as string
    } catch (ex: any) {
      if (ex.status === 404) {
        throw new Error(
          `${args.repoName} does not exist on GitHub. Please verify that the repo exists and is public.`,
        )
      } else if (ex.status === 403) {
        throw new Error(
          `Unauthorized. Insufficient privileges to access ${args.repoName}.`,
        )
      } else {
        throw new Error(
          `Failed to retrieve default branch for ${
            args.repoName
          }. ${JSON.stringify(ex)}`,
        )
      }
    }
  }

  public createRepo = async ({
    repoName,
    isPrivate,
    autoInit = false,
    token,
  }: CreateRepoArgs) => {
    return await this.run(this.reqWithAuth(token), 201, 'POST /user/repos', {
      name: repoName,
      private: isPrivate,
      auto_init: autoInit,
    })
  }

  public hasCommits = async ({ repoName, token, username }: HasCommitsArs) => {
    try {
      const response = await this.run(
        this.reqWithAuth(token),
        200,
        'GET /repos/{owner}/{repo}/commits',
        {
          owner: username,
          repo: repoName,
        },
      )
      return response.data.length > 0
    } catch (ex) {
      return false
    }
  }

  public createIssue = async ({
    repoName,
    username,
    token,
    title,
    body,
    labels = [],
  }: CreateIssueArgs) => {
    const response = await this.run(
      this.reqWithAuth(token),
      201,
      'POST /repos/{owner}/{repo}/issues',
      {
        owner: username,
        repo: repoName,
        title,
        body,
        labels,
      },
    )
    return response.data.html_url as string
  }

  public searchUserIssues = async ({
    repoOwner,
    repoName,
    username,
    token,
    title,
  }: SearchUserIssues) => {
    let allResponses: IssueSearchResult2[] = []
    let currentResponse
    do {
      currentResponse = await this.run(
        this.reqWithAuth(token),
        200,
        'GET /repos/{owner}/{repo}/issues',
        {
          owner: repoOwner,
          repo: repoName,
          creator: username,
          state: 'all',
          per_page: 100,
        },
      )
      allResponses = [
        ...allResponses,
        ...currentResponse.data.filter((i: any) => i.title === title),
      ]
    } while (currentResponse.data.length === 100)
    return allResponses
  }

  public deleteRepo = async ({
    repoName,
    repoOwner,
    token,
  }: DeleteRepoArgs) => {
    try {
      await this.run(
        this.reqWithAuth(token),
        204,
        'DELETE /repos/{owner}/{repo}',
        {
          owner: repoOwner,
          repo: repoName,
        },
      )
    } catch (ex: any) {
      if (ex.status !== 404) {
        throw ex
      }
    }
  }
}
