import { AbstractUserService, Config, User } from '~/shared'

import { hasRequiredKeys } from '../lib/records.js'
import { BallotService } from './BallotService.js'
import { ConfigService } from './ConfigService.js'
import { Gov4GitService } from './Gov4GitService.js'
import { Services } from './Services.js'

export class UserService extends AbstractUserService {
  protected declare services: Services
  protected declare configService: ConfigService
  protected declare gov4GitService: Gov4GitService
  protected declare ballotService: BallotService

  constructor(services: Services) {
    super()
    this.services = services
    this.configService = this.services.load<ConfigService>('config')
    this.gov4GitService = this.services.load<Gov4GitService>('gov4git')
    this.ballotService = this.services.load<BallotService>('ballots')
  }

  protected _getUser = async (): Promise<User | null> => {
    const config = await this.configService.getConfig()
    if (config == null) return null
    const user = {
      voting_credits: 0,
      voting_score: 0,
      is_member: false,
      is_maintainer: false,
      ...config.user,
    }
    user.is_member = await this.isCommunityMember(user)
    if (user.is_member) {
      user.voting_credits = await this.getVotingCredits(user)
      user.voting_score = Math.sqrt(user.voting_credits)
      user.is_maintainer = this.isCommunityMaintainer(config)
    }
    return user
  }

  protected getVotingCredits = async (user: User): Promise<number> => {
    const command = [
      'balance',
      'get',
      '--user',
      user.username,
      '--key',
      'voting_credits',
    ]
    const credits = await this.gov4GitService.mustRun<number>(...command)
    const ballots = await this.ballotService.getOpen()
    const totalPendingSpentCredits = ballots.reduce((acc, cur) => {
      const spentCredits = cur.user.talliedCredits
      const score = cur.user.newScore
      const scoreSign = score < 0 ? -1 : 1
      const totalCredits = scoreSign * Math.pow(score, 2)
      const additionalCosts = Math.abs(totalCredits) - Math.abs(spentCredits)
      return acc + additionalCosts
    }, 0)
    return credits - totalPendingSpentCredits
  }

  protected isCommunityMember = async (user: User): Promise<boolean> => {
    const command = ['group', 'list', '--name', 'everybody']
    const users = await this.gov4GitService.mustRun<string[]>(...command)
    const existingInd = users.findIndex((u) => {
      return u.toLocaleLowerCase() === user.username.toLocaleLowerCase()
    })
    return existingInd !== -1
  }

  protected isCommunityMaintainer = (config: Config): boolean => {
    const keys = [
      'gov_private_url',
      'gov_private_branch',
      `auth.${config.gov_public_url?.replace(/\./g, '###')}.access_token`,
      `auth.${config.gov_private_url?.replace(/\./g, '###')}.access_token`,
    ]
    return hasRequiredKeys(config, keys)
  }

  public async getUser(): Promise<User | null> {
    return await this._getUser()
  }
}
