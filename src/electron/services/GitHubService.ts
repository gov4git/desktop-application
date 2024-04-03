import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device'
import {
  OAuthAppAuthentication,
  OAuthAppAuthInterface,
  Verification,
} from '@octokit/auth-oauth-device/dist-types/types.js'
import { request } from '@octokit/request'

import { retryAsync } from '../../shared/index.js'
import { LogService } from './LogService.js'
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

export type UpdateIssueArgs = {
  owner: string
  repo: string
  token: string
  issueNumber: number
  title?: string
  body?: string
  labels?: string[]
  state?: 'open' | 'closed'
  stateReason?: 'completed' | 'not_planned' | 'reopened'
}

export type AddIssueCommentArgs = {
  token: string
  owner: string
  repo: string
  issueNumber: number
  comment: string
}

export type SearchRepoIssuesArgs = {
  repoOwner: string
  repoName: string
  token: string
  creator?: string
  title?: string
  state?: 'open' | 'closed' | 'all'
}

export type IssueSearchResults = {
  id: number
  html_url: string
  title: string
  body: string
  state: 'open' | 'closed'
  number: number
  labels: Array<{
    id: number
    url: string
    name: string
  }>
  user: {
    login: string
  }
}

export type GetOrgsArgs = {
  token: string
  state?: 'active' | 'pending'
  role?: 'admin' | 'member'
}

export type OrgMembershipInfo = {
  state: 'active' | 'pending'
  role: 'admin' | 'member'
  organizationName: string
}

export type GetOrgReposArgs = {
  org: string
  token: string
  type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member'
}

export class GitHubService {
  protected declare readonly services: Services
  protected declare readonly log: LogService
  protected declare readonly authenticate: OAuthAppAuthInterface
  protected declare authVerification: Verification | null
  protected declare oauthTokenInfo: Promise<OAuthAppAuthentication> | null
  protected declare clientId: string

  constructor({ services, clientId }: GitHubServiceOptions) {
    this.services = services
    this.log = this.services.load<LogService>('log')
    this.clientId = clientId
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
    const authenticate = createOAuthDeviceAuth({
      clientType: 'oauth-app',
      clientId: this.clientId,
      scopes: ['repo'],
      onVerification: (verification) => {
        this.authVerification = verification
      },
    })
    this.oauthTokenInfo = authenticate({ type: 'oauth' })
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
      return [null, [`Failed to log in. ${JSON.stringify(ex, undefined, 2)}`]]
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

  public run = async (
    req: typeof request,
    expectedStatus: number,
    ...args: Parameters<typeof request>
  ): ReturnType<typeof request> => {
    try {
      const response = await req(...args)
      if (response.status !== expectedStatus) {
        this.log.error(`GitHub Error:`, response)
        throw new Error(JSON.stringify(response, undefined, 2))
      }
      this.log.info('GitHub Request:', response)
      return response
    } catch (ex) {
      this.log.error(`GitHub Exception:`, ex)
      throw new Error(JSON.stringify(ex, undefined, 2))
    }
  }

  public getAuthenticatedUser = async (token: string) => {
    return await this.run(this.reqWithAuth(token), 200, 'GET /user')
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

  public doesRepoExist = async ({
    repoName,
    username,
    token,
  }: GetRepoInfoArgs): Promise<boolean> => {
    try {
      await this.getRepoInfo({
        repoName: repoName,
        username: username,
        token: token,
      })
      return true
    } catch (ex: any) {
      if (ex instanceof Error) {
        try {
          const error = JSON.parse(ex.message)
          if ('status' in error && error.status === 404) {
            return false
          } else {
            throw ex
          }
        } catch (error) {
          throw ex
        }
      } else {
        throw new Error(`${ex}`)
      }
    }
  }

  public getDefaultBranch = async (args: GetRepoInfoArgs) => {
    try {
      const response = await this.getRepoInfo(args)
      return response.data.default_branch as string
    } catch (ex: any) {
      if (ex instanceof Error) {
        try {
          const error = JSON.parse(ex.message)
          if ('status' in error) {
            if (error.status === 404) {
              throw new Error(
                `${args.repoName} does not exist on GitHub. Please verify that the repo exists and is public.`,
              )
            } else if (error.status === 403) {
              throw new Error(
                `Unauthorized. Insufficient privileges to access ${args.repoName}.`,
              )
            }
          }
          throw new Error(
            `Failed to retrieve default branch for ${args.repoName}. ${ex}`,
          )
        } catch (error) {
          throw ex
        }
      } else {
        throw new Error(`${ex}`)
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

  public updateIssue = async ({
    owner,
    repo,
    token,
    issueNumber,
    body,
    title,
    labels,
    state,
    stateReason,
  }: UpdateIssueArgs) => {
    await this.run(
      this.reqWithAuth(token),
      200,
      'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
      {
        owner,
        repo,
        issue_number: issueNumber,
        ...(title != null ? { title } : null),
        ...(body != null ? { body } : null),
        ...(state != null ? { state } : null),
        ...(stateReason != null ? { state_reason: stateReason } : null),
        ...(labels != null ? { labels } : null),
      },
    )
  }

  public addIssueComment = async ({
    owner,
    repo,
    issueNumber,
    comment,
    token,
  }: AddIssueCommentArgs) => {
    await this.run(
      this.reqWithAuth(token),
      201,
      'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
      {
        owner,
        repo,
        issue_number: issueNumber,
        body: comment,
      },
    )
  }

  public searchRepoIssues = async ({
    repoOwner,
    repoName,
    creator,
    token,
    title,
    state = 'all',
  }: SearchRepoIssuesArgs) => {
    let allResponses: IssueSearchResults[] = []
    let currentResponse
    let page = 1
    do {
      currentResponse = await this.run(
        this.reqWithAuth(token),
        200,
        'GET /repos/{owner}/{repo}/issues',
        {
          owner: repoOwner,
          repo: repoName,
          ...(creator != null ? { creator } : null),
          state,
          per_page: 100,
          page,
        },
      )
      allResponses = [
        ...allResponses,
        ...currentResponse.data.filter((i: any) => {
          if (title == null) return !('pull_request' in i)
          return !('pull_request' in i) && i.title === title
        }),
      ]
      page += 1
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
      if (ex instanceof Error) {
        try {
          const error = JSON.parse(ex.message)
          if ('status' in error && error.status !== 404) {
            throw ex
          }
        } catch (error) {
          throw ex
        }
      } else {
        throw new Error(`${ex}`)
      }
    }
  }

  public getOrgs = async ({ token, state, role }: GetOrgsArgs) => {
    let allResponses: OrgMembershipInfo[] = []
    let currentResponse
    let page = 1
    do {
      currentResponse = await this.run(
        this.reqWithAuth(token),
        200,
        'GET /user/memberships/orgs',
        {
          ...(state != null ? { state } : null),
          per_page: 100,
          page,
        },
      )
      allResponses = [
        ...allResponses,
        ...currentResponse.data
          .filter((d: any) => {
            if (role == null) {
              return true
            }
            return d.role === role
          })
          .map((d: any) => ({
            state: d.state,
            role: d.role,
            organizationName: d.organization.login,
          })),
      ]
      page += 1
    } while (currentResponse.data.length === 100)
    return allResponses
  }

  public getOrgRepos = async ({ org, type, token }: GetOrgReposArgs) => {
    let allResponses: string[] = []
    let currentResponse
    let page = 1
    do {
      currentResponse = await this.run(
        this.reqWithAuth(token),
        200,
        'GET /orgs/{org}/repos',
        {
          org: org,
          ...(type != null ? { type } : null),
          per_page: 100,
          page,
        },
      )
      allResponses = [
        ...allResponses,
        ...currentResponse.data.map((d: any) => d.name as string),
      ]
      page += 1
    } while (currentResponse.data.length === 100)
    return allResponses
  }
}
