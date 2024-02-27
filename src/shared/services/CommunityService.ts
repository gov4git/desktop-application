import type { Community } from '../../electron/db/schema.js'
import type {
  CommunityIssuesResponse,
  DeployCommunityArgs,
  IssueVotingCreditsArgs,
  ManageIssueArgs,
  UserCredits,
} from '../../electron/services/index.js'

export abstract class AbstractCommunityService {
  public abstract insertCommunity(
    projectUrl: string,
  ): Promise<[string, string[]]>
  public abstract selectCommunity(communityUrl: string): Promise<void>
  public abstract getCommunities(): Promise<Community[]>
  public abstract deployCommunity(
    deployArgs: DeployCommunityArgs,
  ): Promise<void>
  public abstract getCommunityUsers(url: string): Promise<UserCredits[]>
  public abstract issueVotingCredits(
    args: IssueVotingCreditsArgs,
  ): Promise<void>
  public abstract getCommunityIssues(
    communityUrl: string,
  ): Promise<CommunityIssuesResponse>
  public abstract manageIssue(args: ManageIssueArgs): Promise<void>
}
