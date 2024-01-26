import { eq, sql } from 'drizzle-orm'

import { AbstractMotionService, serialAsync } from '../../shared/index.js'
import { DB } from '../db/db.js'
import {
  type MotionInsert,
  motions,
  type MotionSearch,
  type MotionSearchResults,
  motionsFullTextSearch,
  type MotionVoteOption,
} from '../db/schema.js'
import { CommunityService } from './CommunityService.js'
import { Gov4GitService } from './Gov4GitService.js'
import { Services } from './Services.js'
import { UserService } from './UserService.js'

type RemoteMotion = {
  opened_at: string
  closed_at: string
  id: string
  type: 'concern' | 'proposal'
  tracker_url: string
  title: string
  description: string
  frozen: boolean
  closed: boolean
  cancelled: boolean
}

type RemoteBallot = {
  ballot_id: string
  ballot_choices: string[]
  ballot_tally: {
    scores: {
      [key: string]: number
    }
    scores_by_user: {
      [key: string]: {
        [key: string]: {
          strength: number
          score: number
        }
      }
    }
  }
}

type PanoramaResponse = {
  real_balance: number
  projected_balance: number
  real_motions: Array<{
    motion: RemoteMotion
    ballots: RemoteBallot[]
  }>
  projected_motions: Array<{
    motion: RemoteMotion
    ballots: RemoteBallot[]
  }>
}

type PanoramaObject = {
  realBalance: number
  projectedBalance: number
  realMotions: {
    [key: string]: {
      motion: RemoteMotion
      ballot: RemoteBallot
    }
  }
  projectedMotions: {
    [key: string]: {
      motion: RemoteMotion
      ballot: RemoteBallot
    }
  }
}

export type MotionServiceOptions = {
  services: Services
}

export class MotionService extends AbstractMotionService {
  private declare readonly services: Services
  private declare readonly db: DB
  private declare readonly govService: Gov4GitService
  private declare readonly userService: UserService
  private declare readonly communityService: CommunityService

  constructor({ services }: MotionServiceOptions) {
    super()
    this.services = services
    this.db = this.services.load<DB>('db')
    this.govService = this.services.load<Gov4GitService>('gov4git')
    this.userService = this.services.load<UserService>('user')
    this.communityService = this.services.load<CommunityService>('community')
  }

  private loadPanoramaData = async () => {
    const command = ['panorama']

    const panoramaResponse =
      await this.govService.mustRun<PanoramaResponse>(command)

    const panoramaObject: PanoramaObject = {
      realBalance: panoramaResponse.real_balance,
      projectedBalance: panoramaResponse.projected_balance,
      realMotions: {},
      projectedMotions: {},
    }

    for (const motion of panoramaResponse.real_motions) {
      panoramaObject.realMotions[motion.motion.id] = {
        motion: motion.motion,
        ballot: motion.ballots[0]!,
      }
    }

    for (const motion of panoramaResponse.projected_motions) {
      panoramaObject.projectedMotions[motion.motion.id] = {
        motion: motion.motion,
        ballot: motion.ballots[0]!,
      }
    }

    return panoramaObject
  }

  private getRealUserVote = (
    panoramaData: PanoramaObject,
    id: string,
    choice: string,
    user: string,
  ): { score: number; strength: number } | null => {
    const motionData = panoramaData.realMotions[id]
    if (motionData == null) return null

    const userVote = motionData.ballot.ballot_tally.scores_by_user[user]

    if (userVote != null) {
      const voteData = userVote[choice]
      return voteData ?? null
    }

    return null
  }

  public loadMotions = serialAsync(async () => {
    const [user, community] = await Promise.all([
      this.userService.getUser(),
      this.communityService.getCommunity(),
    ])

    if (user == null || community == null || !community.isMember) {
      return
    }

    const panoramaData = await this.loadPanoramaData()

    await this.communityService.setUserVotingCredits(
      panoramaData.projectedBalance,
    )

    for (const [id, motionData] of Object.entries(
      panoramaData.projectedMotions,
    )) {
      let realMotionData = panoramaData.realMotions[id]
      if (realMotionData == null) {
        realMotionData = motionData
      }
      const choice = motionData.ballot.ballot_choices[0]!

      const motion: MotionInsert = {
        motionId: id,
        ballotId: motionData.ballot.ballot_id,
        openedAt: motionData.motion.opened_at,
        closedAt: motionData.motion.closed_at,
        type: motionData.motion.type,
        trackerUrl: motionData.motion.tracker_url,
        communityUrl: community.url,
        title: motionData.motion.title,
        description: motionData.motion.description,
        choices: motionData.ballot.ballot_choices,
        choice: choice,
        userScore: 0,
        userStrength: 0,
        score: realMotionData.ballot.ballot_tally.scores[choice] ?? 0,
        userVoted: false,
        userVotePending: false,
      }

      if (motionData.motion.closed) {
        motion['status'] = 'closed'
      } else if (motionData.motion.cancelled) {
        motion['status'] = 'cancelled'
      } else if (motionData.motion.frozen) {
        motion['status'] = 'frozen'
      } else {
        motion['status'] = 'open'
      }

      const userVote =
        motionData.ballot.ballot_tally.scores_by_user[user.username]

      if (userVote != null) {
        const voteData = userVote[choice]
        if (voteData != null) {
          motion['userScore'] = userVote[choice]!.score
          motion['userStrength'] = userVote[choice]!.strength
          motion['userVoted'] = true

          const realVote = this.getRealUserVote(
            panoramaData,
            id,
            choice,
            user.username,
          )
          if (realVote == null || realVote.score != voteData.score) {
            motion['userVotePending'] = true
          }
        }
      }

      await this.db
        .insert(motions)
        .values(motion)
        .onConflictDoUpdate({
          target: [motions.motionId, motions.ballotId, motions.communityUrl],
          set: motion,
        })
    }
  })

  public getMotions = async (
    options?: MotionSearch,
  ): Promise<MotionSearchResults> => {
    const [user, community] = await Promise.all([
      this.userService.getUser(),
      this.communityService.getCommunity(),
    ])
    if (user == null || community == null) {
      return {
        totalCount: 0,
        matchingCount: 0,
        motions: [],
      }
    }

    const {
      status = [],
      search = null,
      type = null,
      voted = [],
    } = options ?? {}

    let motionsCounts = (
      await this.db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(motions)
        .where(eq(motions.communityUrl, community.url))
    )[0]

    if (motionsCounts == null || motionsCounts.count === 0) {
      await this.loadMotions()
    }

    type MotionColumns = (typeof motions)['_']['columns']

    const motionsSelect = Object.entries(motions).reduce<MotionColumns>(
      (acc, cur) => {
        acc[cur[0] as keyof MotionColumns] = cur[1]
        return acc
      },
      {} as any,
    )
    let query = this.db
      .select(motionsSelect)
      .from(motions)
      .innerJoin(
        motionsFullTextSearch,
        eq(motions.id, motionsFullTextSearch.rowid),
      )
      .$dynamic()

    const where = sql`${motions.communityUrl} = ${community.url}`

    if (status.length > 0) {
      where.append(
        sql` AND ${motions.status} IN (${sql.raw(
          status.map((s) => `'${s}'`).join(', '),
        )})`,
      )
    }

    if (type != null) {
      where.append(sql` AND ${motions.type} = ${type}`)
    }

    if (voted.length > 0) {
      where.append(
        sql` AND ${motions.userVoted} IN (${sql.raw(
          voted.map((v) => (v === 'Voted' ? 1 : 0)).join(', '),
        )})`,
      )
    }

    if (search != null && search != '') {
      where.append(
        sql.raw(
          ` AND motionsFullTextSearch MATCH '"${search}"' ORDER BY rank desc`,
        ),
      )
    } else {
      where.append(sql` ORDER BY ${motions.score} desc, ${motions.title} asc`)
    }

    query = query.where(where)

    const results = await query

    motionsCounts = (
      await this.db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(motions)
        .where(eq(motions.communityUrl, community.url))
    )[0]

    return {
      totalCount: motionsCounts?.count ?? 0,
      matchingCount: results.length,
      motions: results,
    }
  }

  public vote = async ({ name, choice, strength }: MotionVoteOption) => {
    const [user, community] = await Promise.all([
      this.userService.getUser(),
      this.communityService.getCommunity(),
    ])

    if (user == null || community == null) {
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
  }
}
