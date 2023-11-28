import { AbstractSettingsService } from '~/shared'

import { proxyService } from './proxyService.js'

const SettingsService = proxyService<typeof AbstractSettingsService>('settings')

export const settingsService = new SettingsService()
