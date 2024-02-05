import { ServiceResponse } from '../types/index.js'

export abstract class AbstractValidationService {
  public abstract validate(): Promise<ServiceResponse<null>>
}
