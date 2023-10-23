import { AbstractLogService } from '~/shared'

import { proxyService } from './proxyService.js'

const LogService = proxyService<typeof AbstractLogService>('log')

export const logService = new LogService()

logService.getAppVersion()
