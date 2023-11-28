export type User = {
  communityId: string
  username: string
  pat: string
  votingCredits: number
  votingScore: number
  isMaintainer: boolean
  isMember: boolean
  memberPublicUrl: string
  memberPublicBranch: string
  memberPrivateUrl: string
  memberPrivateBranch: string
}

export abstract class AbstractUserService {
  public abstract authenticate(username: string, pat: string): Promise<string[]>
  public abstract getUser(): Promise<User | null>
}
