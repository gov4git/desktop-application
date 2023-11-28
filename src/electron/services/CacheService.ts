import { BallotService } from './BallotService.js'
import { Services } from './Services.js'
import { UserService } from './UserService.js'

export type CacheServiceOptions = {
  services: Services
}

export class CacheService {
  private declare readonly services: Services
  private declare readonly userService: UserService
  private declare readonly ballotService: BallotService

  constructor({ services }: CacheServiceOptions) {
    this.services = services
    this.ballotService = this.services.load<BallotService>('ballots')
    this.userService = this.services.load<UserService>('user')
  }

  public refreshCache = async () => {
    await Promise.all([
      this.userService.loadUser(),
      this.ballotService.loadBallots(),
    ])
  }
}
