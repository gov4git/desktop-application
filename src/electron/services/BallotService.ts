import { and, asc, desc, eq, sql } from 'drizzle-orm'

import {
  AbstractBallotService,
  Ballot,
  CreateBallotOptions,
  serialAsync,
  VoteOption,
} from '~/shared'

import { DB } from '../db/db.js'
import {
  BallotDBInsert,
  ballots,
  communities,
  userCommunities,
  users,
} from '../db/schema.js'
import { Gov4GitService } from './Gov4GitService.js'
import { Services } from './Services.js'

type RemoteBallot = {
  community: {
    Repo: string
    Branch: string
  }
  path: string[]
  title: string
  description: string
  choices: string[]
  strategy: string
  participants_group: string
  parent_commit: string
  label: 'issues' | 'pull' | 'other'
  identifier: string
  url: string
  frozen: boolean
  closed: boolean
  cancelled: boolean
}

type RemoteBallotInfo = {
  ballot_advertisement: {
    community: {
      git_repo: string
      git_branch: string
    }
    path: string[]
    title: string
    description: string
    choices: string[]
    strategy: string
    participants_group: string
    parent_commit: string
    frozen: boolean
    closed: boolean
    cancelled: boolean
  }
  ballot_strategy: {
    use_voting_credit: boolean
  }
  ballot_tally: {
    ballot_advertisement: {
      community: {
        git_repo: string
        git_branch: string
      }
      path: string[] | null
      title: string
      description: string
      choices: string[] | null
      strategy: string
      participants_group: string
      parent_commit: string
      frozen: boolean
      closed: boolean
      cancelled: boolean
    }
    ballot_scores: {
      [key: string]: number
    }
    ballot_votes_by_user: {
      [key: string]: {
        [key: string]: {
          strength: number
          score: number
        }
      }
    }
    ballot_accepted_votes: {
      [key: string]: Array<{
        accepted_time: string
        accepted_vote: {
          vote_id: string
          vote_time: string
          vote_choice: string
          vote_strength_change: number
        }
      }>
    }
    ballot_rejected_votes: {
      [key: string]: unknown
    }
    ballot_charges: {
      [key: string]: number
    }
  }
}

type RemoteBallotTrack = {
  governance_id: string
  governance_address: {
    git_repo: string
    git_branch: string
  }
  ballot_name: string[]
  accepted_votes: Array<{
    accepted_time: string
    accepted_vote: {
      vote_id: string
      vote_time: string
      vote_choice: string
      vote_strength_change: number
    }
  }> | null
  rejected_votes: null
  pending_votes: Array<{
    vote_id: string
    vote_time: string
    vote_choice: string
    vote_strength_change: number
  }> | null
}

export type BallotServiceOptions = {
  services: Services
}

export class BallotService extends AbstractBallotService {
  private declare readonly services: Services
  private declare readonly db: DB
  private declare readonly govService: Gov4GitService

  constructor({ services }: BallotServiceOptions) {
    super()
    this.services = services
    this.db = this.services.load<DB>('db')
    this.govService = this.services.load<Gov4GitService>('gov4git')
  }

  private getBallotLabel = (path: string[]): 'issues' | 'pull' | 'other' => {
    if (path.length === 3 && path[1]?.toLowerCase() === 'issues') {
      return 'issues'
    } else if (path.length === 3 && path[1]?.toLowerCase() === 'pull') {
      return 'pull'
    }
    return 'other'
  }

  private getBallotId = (path: string[]): string => {
    return path.join('/')
  }

  private fetchBallotInfo = async (
    // communityUrl: string,
    ballotId: string,
  ): Promise<RemoteBallotInfo> => {
    const ballotInfoCommand = ['ballot', 'show', '--name', ballotId]
    const ballotInfo =
      await this.govService.mustRun<RemoteBallotInfo>(ballotInfoCommand)

    return ballotInfo
  }

  private fetchBallotTracking = async (tallyId: string) => {
    const ballotTrackingCommand = ['ballot', 'track', '--name', tallyId]
    let ballotTracking: RemoteBallotTrack | null = null
    try {
      ballotTracking = await this.govService.mustRun<RemoteBallotTrack>(
        ballotTrackingCommand,
      )
      if (ballotTracking != null && ballotTracking.pending_votes != null) {
        const userAcceptedVotes = ballotTracking.accepted_votes
        if (userAcceptedVotes != null) {
          ballotTracking.pending_votes = ballotTracking.pending_votes.reduce<
            any[]
          >((acc, cur) => {
            const existingInd = userAcceptedVotes.findIndex((vote) => {
              return vote.accepted_vote.vote_id === cur.vote_id
            })
            if (existingInd === -1) {
              acc.push(cur)
            }
            return acc
          }, [])
        }
      }
    } catch (er) {
      // skip
    }
    return ballotTracking
  }

  private loadBallot = async (
    username: string,
    communityUrl: string,
    ballotId: string,
  ) => {
    const [ballotInfo, ballotTracking] = await Promise.all([
      this.fetchBallotInfo(ballotId),
      this.fetchBallotTracking(ballotId),
    ])

    const ballot: Record<string, unknown> = {}
    ballot['communityUrl'] = communityUrl
    ballot['label'] = this.getBallotLabel(ballotInfo.ballot_advertisement.path)
    ballot['identifier'] = this.getBallotId(
      ballotInfo.ballot_advertisement.path,
    )
    ballot['title'] = ballotInfo.ballot_advertisement.title
    ballot['description'] = ballotInfo.ballot_advertisement.description
    ballot['choices'] = ballotInfo.ballot_advertisement.choices

    const closed =
      ballotInfo.ballot_advertisement.frozen ||
      ballotInfo.ballot_advertisement.closed ||
      ballotInfo.ballot_advertisement.cancelled
    ballot['status'] = closed ? 'closed' : 'open'

    const choice = (ballot['choices'] as string[])[0]

    if (!choice) {
      throw new Error(
        `Unable to determine choice option for ballot ${ballot['identifier']}`,
      )
    }
    ballot['choice'] = choice
    ballot['score'] = ballotInfo.ballot_tally.ballot_scores[choice] ?? 0

    const talliedVotes = ballotInfo.ballot_tally.ballot_votes_by_user[username]
    const pendingVotes = ballotTracking?.pending_votes ?? []

    let talliedScore = 0
    if (talliedVotes != null) {
      talliedScore = talliedVotes[choice]?.score ?? 0
    }
    const talliedScoreSign = talliedScore < 0 ? -1 : 1
    const talliedCredits = talliedScoreSign * Math.pow(talliedScore, 2)

    const pendingCredits = pendingVotes.reduce((acc, cur) => {
      return acc + cur.vote_strength_change
    }, 0)

    const creditsSign = talliedCredits + pendingCredits < 0 ? -1 : 1
    const newScore =
      creditsSign * Math.sqrt(Math.abs(talliedCredits + pendingCredits))
    const pendingScoreDiff = newScore - talliedScore

    ballot['user'] = {
      talliedScore: talliedScore,
      talliedCredits: talliedCredits,
      newScore: newScore,
      pendingScoreDiff: pendingScoreDiff,
      pendingCredits: pendingCredits,
    }

    await this.db
      .insert(ballots)
      .values(ballot as BallotDBInsert)
      .onConflictDoUpdate({
        target: ballots.identifier,
        set: ballot,
      })
    return ballot as Ballot
  }

  public getBallot = async (ballotId: string) => {
    const [userRows, communityRows] = await Promise.all([
      this.db.select().from(users).limit(1),
      this.db
        .select()
        .from(communities)
        .where(eq(communities.selected, true))
        .limit(1),
    ])

    const user = userRows[0]
    const community = communityRows[0]

    if (user == null || community == null) {
      return null
    }

    return this.loadBallot(user.username, community.url, ballotId)
  }

  public loadBallots = serialAsync(async () => {
    const [userRows, communityRows] = await Promise.all([
      this.db.select().from(users).limit(1),
      this.db
        .select()
        .from(communities)
        .where(eq(communities.selected, true))
        .limit(1),
    ])

    const user = userRows[0]
    const community = communityRows[0]

    if (user == null || community == null) {
      return
    }

    const command = ['ballot', 'list', '--participant', user.username]
    const remoteBallots = await this.govService.mustRun<RemoteBallot[]>(command)

    const ballotPromises = []
    for (const remoteBallot of remoteBallots) {
      ballotPromises.push(
        this.loadBallot(
          user.username,
          community.url,
          this.getBallotId(remoteBallot.path),
        ),
      )
    }

    await Promise.all(ballotPromises)
  })

  public getBallots = async () => {
    const selectedCommunity = (
      await this.db
        .select()
        .from(communities)
        .where(eq(communities.selected, true))
        .limit(1)
    )[0]

    if (selectedCommunity == null) {
      return []
    }

    const ballotCounts = await this.db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(ballots)
      .where(
        and(
          eq(ballots.communityUrl, selectedCommunity.url),
          eq(ballots.status, 'open'),
        ),
      )

    if (ballotCounts.length === 0 || ballotCounts[0]?.count === 0) {
      await this.loadBallots()
    }

    return await this.db
      .select()
      .from(ballots)
      .where(
        and(
          eq(ballots.communityUrl, selectedCommunity.url),
          eq(ballots.status, 'open'),
        ),
      )
      .orderBy(desc(ballots.score), asc(ballots.title))
  }

  public vote = async ({ name, choice, strength }: VoteOption) => {
    const userInfo = (
      await this.db
        .select()
        .from(communities)
        .innerJoin(
          userCommunities,
          eq(communities.url, userCommunities.communityId),
        )
        .where(eq(communities.selected, true))
        .limit(1)
    )[0]

    if (userInfo == null) {
      return
    }

    await this.govService.mustRun([
      'ballot',
      'vote',
      '--name',
      name,
      '--choices',
      choice,
      '--strengths',
      strength,
    ])

    const votingCredits = userInfo.userCommunities.votingCredits - +strength
    const votingScore = Math.sqrt(Math.abs(votingCredits))

    await this.db
      .update(userCommunities)
      .set({
        votingCredits,
        votingScore,
      })
      .where(eq(userCommunities.id, userInfo.userCommunities.id))
  }

  public createBallot = async (options: CreateBallotOptions) => {
    const name = `github/${options.type}/${options.title.replace(/\s/g, '')}`
    const command = [
      'ballot',
      'open',
      '--name',
      name,
      '--title',
      options.title,
      '--desc',
      options.description,
      '--group',
      'everybody',
      '--choices',
      'prioritize',
      '--use_credits',
    ]
    await this.govService.mustRun(command)
  }

  public tallyBallot = async (ballotName: string) => {
    const command = ['ballot', 'tally', '--name', ballotName]
    await this.govService.mustRun(command)
  }
}
