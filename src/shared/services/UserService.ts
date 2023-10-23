export type User = {
  username: string
  pat: string
  voting_credits: number
  voting_score: number
  is_maintainer: boolean
  is_member: boolean
}

export abstract class AbstractUserService {
  public abstract getUser(): Promise<User | null>
}
