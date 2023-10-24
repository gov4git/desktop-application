import { AbstractAppUpdaterService } from '~/shared'

import { proxyService } from './proxyService.js'

const AppUpdaterService =
  proxyService<typeof AbstractAppUpdaterService>('appUpdater')

export const appUpdaterService = new AppUpdaterService()
