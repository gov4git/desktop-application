import { desc } from 'drizzle-orm'

import {
  AbstractBallotService,
  Ballot,
  BallotLabel,
  CreateBallotOptions,
  VoteOption,
} from '~/shared'

import { DB } from '../db/db.js'
import { ballots } from '../db/schema.js'
import { formatDecimal } from '../lib/numbers.js'
import { ConfigService } from './ConfigService.js'
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
  label: BallotLabel
  identifier: string
  url: string
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

export class BallotService extends AbstractBallotService {
  protected declare services: Services
  protected declare db: DB
  protected declare configService: ConfigService
  protected declare gov4GitService: Gov4GitService

  constructor(services: Services) {
    super()
    this.services = services
    this.db = this.services.load<DB>('db')
    this.configService = this.services.load<ConfigService>('config')
    this.gov4GitService = this.services.load<Gov4GitService>('gov4git')
  }
  protected getBallotLabel = (path: string[]): BallotLabel => {
    if (path.length === 3 && path[1]?.toLowerCase() === 'issues') {
      return 'issues'
    } else if (path.length === 3 && path[1]?.toLowerCase() === 'pull') {
      return 'pull'
    }
    return 'other'
  }

  protected getBallotIdentifier = (path: string[]): string => {
    return path.join('/')
  }

  protected getBallotInfo = async (ballotPath: string, username: string) => {
    const ballotInfoCommand = ['ballot', 'show', '--name', ballotPath]
    const ballotInfo = await this.gov4GitService.mustRun<RemoteBallotInfo>(
      ...ballotInfoCommand,
    )
    const ballotTrackingCommand = ['ballot', 'track', '--name', ballotPath]
    let ballotTracking: RemoteBallotTrack | null = null
    try {
      ballotTracking = await this.gov4GitService.mustRun<RemoteBallotTrack>(
        ...ballotTrackingCommand,
      )
      if (ballotTracking != null && ballotTracking.pending_votes != null) {
        const userAcceptedVotes =
          ballotInfo.ballot_tally.ballot_accepted_votes[username]
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
    return {
      ballotInfo,
      ballotTracking,
    }
  }

  protected getVotingCredits = async (username: string): Promise<number> => {
    const command = [
      'balance',
      'get',
      '--user',
      username,
      '--key',
      'voting_credits',
    ]
    return await this.gov4GitService.mustRun(...command)
  }

  public getBallot = async (ballotId: string): Promise<Ballot> => {
    const config = await this.configService.getConfig()
    if (config == null) {
      throw new Error(
        `Unable to load ballot info for ${ballotId} as config is null.`,
      )
    }
    const b = await this.getBallotInfo(ballotId, config.user.username)
    const ballot: Record<string, unknown> = {}
    ballot['communityUrl'] = config.gov_public_url
    ballot['label'] = this.getBallotLabel(
      b.ballotInfo.ballot_advertisement.path,
    )
    ballot['identifier'] = this.getBallotIdentifier(
      b.ballotInfo.ballot_advertisement.path,
    )
    ballot['title'] = b.ballotInfo.ballot_advertisement.title
    ballot['description'] = b.ballotInfo.ballot_advertisement.description
    ballot['choices'] = b.ballotInfo.ballot_advertisement.choices

    const choice = (ballot['choices'] as string[])[0]

    if (!choice) {
      throw new Error(
        `Unable to determine choice option for ballot ${ballot['identifier']}`,
      )
    }
    ballot['choice'] = choice
    ballot['score'] = b.ballotInfo.ballot_tally.ballot_scores[choice] ?? 0

    const talliedVotes =
      b.ballotInfo.ballot_tally.ballot_votes_by_user[config.user.username]
    const pendingVotes = b.ballotTracking?.pending_votes ?? []

    let talliedScore = 0
    if (talliedVotes != null) {
      talliedScore = talliedVotes[choice]?.score ?? 0
    }
    const talliedCredits = Math.pow(talliedScore, 2)

    const pendingCredits = pendingVotes.reduce((acc, cur) => {
      return acc + cur.vote_strength_change
    }, 0)

    const newScore = Math.sqrt(talliedCredits + pendingCredits)
    const pendingScoreDiff = newScore - talliedScore

    let message = ``
    if (talliedScore !== 0) {
      const isUp = talliedScore > 0
      const symbol = isUp ? '+' : ''
      message += `<span>Your contribution: ${symbol}${formatDecimal(
        talliedScore,
      )}`
    }
    if (pendingScoreDiff !== 0) {
      const isUp = pendingScoreDiff > 0
      const symbol = isUp ? '+' : ''
      message += message !== '' ? '<br />' : '<span>'
      message += `Your pending contribution: ${symbol}${formatDecimal(
        pendingScoreDiff,
      )}`
    }
    message += message !== '' ? '</span>' : ''

    // const userVotingCredits = await this.getVotingCredits(config.user.username)
    // const maxScoreLeft = Math.sqrt(userVotingCredits) //- acceptedUserScore - pendingScoreDiff

    ballot['user'] = {
      talliedScore: talliedScore,
      talliedCredits: talliedCredits,
      newScore: newScore,
      pendingScoreDiff: pendingScoreDiff,
      pendingCredits: pendingCredits,
      contributionMessage: message,
      // maxScoreLeft: maxScoreLeft,
      // minScoreLeft: -maxScoreLeft,
    }

    await this.db
      .insert(ballots)
      .values(ballot as Ballot)
      .onConflictDoUpdate({
        target: ballots.identifier,
        set: ballot,
      })
    return ballot as Ballot
  }

  protected _getOpen = async () => {
    const config = await this.configService.getConfig()
    if (config == null) return []
    const username = config.user!.username!
    const command = ['ballot', 'list', '--open', '--participant', username]
    const remoteBallots = await this.gov4GitService.mustRun<RemoteBallot[]>(
      ...command,
    )

    const ballotPromises = remoteBallots.map((b) =>
      this.getBallot(this.getBallotIdentifier(b.path)),
    )
    return await Promise.all(ballotPromises).then((results) => {
      return results.sort((a, b) => (a.score > b.score ? -1 : 1))
    })
  }

  public updateCache = async (): Promise<Ballot[]> => {
    await this.db.delete(ballots)
    return await this._getOpen()
  }

  public getOpen = async () => {
    const blts = await this.db
      .select()
      .from(ballots)
      .orderBy(desc(ballots.score))
    if (blts.length > 0) {
      // void this._getOpen()
      return blts
    }
    return await this._getOpen()
  }

  public vote = async ({ name, choice, strength }: VoteOption) => {
    // throw new Error(`FAILED TO VOTE!`)
    await this.gov4GitService.mustRun(
      'ballot',
      'vote',
      '--name',
      name,
      '--choices',
      choice,
      '--strengths',
      strength,
    )
  }

  public createBallot = async (options: CreateBallotOptions) => {
    const name = `${options.type}/${options.title.replace(/\s/g, '')}`
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
      'Prioritize',
      '--use_credits',
    ]
    await this.gov4GitService.mustRun(...command)
  }

  public tallyBallot = async (ballotName: string) => {
    const command = ['ballot', 'tally', '--name', ballotName]
    await this.gov4GitService.mustRun(...command)
  }
}
