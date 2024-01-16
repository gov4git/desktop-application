import type {
  MotionSearch,
  MotionSearchResults,
  MotionVoteOption,
} from '../../electron/db/schema.js'

export abstract class AbstractMotionService {
  public abstract vote(voteOptions: MotionVoteOption): Promise<void>
  // public abstract createBallot(options: CreateBallotOptions): Promise<void>
  // public abstract tallyBallot(ballotName: string): Promise<void>
  public abstract getMotions(
    options?: MotionSearch,
  ): Promise<MotionSearchResults>
}
