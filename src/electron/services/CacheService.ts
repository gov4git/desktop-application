import { AbstractCacheService } from '../../shared/index.js'
import { MotionService } from './MotionService.js'
import { Services } from './Services.js'

export type CacheServiceOptions = {
  services: Services
}

export class CacheService extends AbstractCacheService {
  private declare readonly services: Services
  private declare readonly motionService: MotionService

  constructor({ services }: CacheServiceOptions) {
    super()
    this.services = services
    this.motionService = this.services.load<MotionService>('motion')
  }

  public refreshCache = async () => {
    await Promise.all([this.motionService.loadMotions()])
  }
}
