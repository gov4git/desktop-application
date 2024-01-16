import { AbstractValidationService } from '~/shared'

import { proxyService } from './proxyService.js'

const ValidationService =
  proxyService<typeof AbstractValidationService>('validation')

export const validationService = new ValidationService()
