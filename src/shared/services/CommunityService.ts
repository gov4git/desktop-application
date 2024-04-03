import type { Community } from '../../electron/db/schema.js'
import type {
  CommunityIssuesResponse,
  CommunityUser,
  DeployCommunityArgs,
  IssueVotingCreditsArgs,
  ManageIssueArgs,
} from '../../electron/services/index.js'
import { ServiceResponse } from '../types/ServiceResponse.js'

export abstract class AbstractCommunityService {
  public abstract insertCommunity(
    projectUrl: string,
  ): Promise<[string, string[]]>
  public abstract selectCommunity(communityUrl: string): Promise<void>
  public abstract getCommunities(): Promise<Community[]>
  public abstract deployCommunity(
    deployArgs: DeployCommunityArgs,
  ): Promise<void>
  public abstract getCommunityUsers(url: string): Promise<CommunityUser[]>
  public abstract issueVotingCredits(
    args: IssueVotingCreditsArgs,
  ): Promise<void>
  public abstract getCommunityIssues(
    communityUrl: string,
  ): Promise<CommunityIssuesResponse>
  public abstract manageIssue(args: ManageIssueArgs): Promise<void>
  public abstract deleteCommunity(url: string): Promise<void>
  public abstract approveUserRequest(
    community: Community,
    user: CommunityUser,
  ): Promise<ServiceResponse<string>>
}
