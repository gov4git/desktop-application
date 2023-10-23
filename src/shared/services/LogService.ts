export abstract class AbstractLogService {
  public abstract getAppVersion(): string
  public abstract getLogs(): string
  public abstract debug(...data: any[]): void
  public abstract info(...data: any[]): void
  public abstract warn(...data: any[]): void
  public abstract error(...data: any[]): void
  public abstract close(): void
}
