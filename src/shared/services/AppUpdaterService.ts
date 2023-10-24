export type AppUpdateInfo = {
  ready: boolean
  version: string
}

export abstract class AbstractAppUpdaterService {
  public abstract checkForUpdates(): Promise<AppUpdateInfo | null>
  public abstract restartAndUpdate(): void
}
