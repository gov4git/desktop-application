import { beforeAll, describe, expect, test } from '@jest/globals'

import { Services, ValidationService } from '../src/electron/services/index.js'

export default function run(services: Services) {
  let validationService: ValidationService

  describe('Settings Tests', () => {
    beforeAll(async () => {
      validationService = services.load<ValidationService>('validation')
    })

    describe('Validate', () => {
      test('Validate', async () => {
        const errors = await validationService.validateConfig()

        expect(errors.length).toEqual(0)
      })
    })
  })
}
