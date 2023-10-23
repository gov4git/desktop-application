import { AbstractConfigService } from '~/shared'

import { proxyService } from './proxyService.js'

const ConfigService = proxyService<typeof AbstractConfigService>('config')

export const configService = new ConfigService()
