export type BallotLabel = 'issues' | 'pull' | 'other'

export type Ballot = {
  label: BallotLabel
  communityUrl: string
  identifier: string
  score: number
  title: string
  choices: string[]
  choice: string
  description: string
  status: 'open' | 'closed'
  user: {
    talliedScore: number
    talliedCredits: number
    pendingScoreDiff: number
    pendingCredits: number
    newScore: number
  }
}

export type VoteOption = {
  name: string
  choice: string
  strength: string
}

export type CreateBallotOptions = {
  type: string
  title: string
  description: string
}

export abstract class AbstractBallotService {
  public abstract getBallot(ballotId: string): Promise<Ballot | null>
  public abstract vote(voteOptions: VoteOption): Promise<void>
  // public abstract createBallot(options: CreateBallotOptions): Promise<void>
  // public abstract tallyBallot(ballotName: string): Promise<void>
  public abstract getBallots(): Promise<Ballot[]>
}
