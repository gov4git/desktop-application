import { AbstractValidationService } from '~/shared'

import { proxyService } from './proxyService.js'

const ValidationService =
  proxyService<typeof AbstractValidationService>('settings')

export const validationService = new ValidationService()
