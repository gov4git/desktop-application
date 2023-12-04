export abstract class AbstractValidationService {
  public abstract validateConfig(): Promise<string[]>
}
