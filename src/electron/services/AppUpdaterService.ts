import { autoUpdater } from 'electron-updater'

import { AbstractAppUpdaterService, AppUpdateInfo } from '~/shared'

import { LogService } from './LogService.js'
import { Services } from './Services.js'

export class AppUpdaterService extends AbstractAppUpdaterService {
  protected declare updating: null | Promise<AppUpdateInfo>
  protected declare services: Services
  protected declare log: LogService

  constructor(services: Services) {
    super()
    this.updating = null
    this.services = services
    this.log = this.services.load<LogService>('log')
    this.init()
  }

  protected init = () => {
    autoUpdater.logger = this.log
    autoUpdater.disableWebInstaller = true
    autoUpdater.on('checking-for-update', () => {
      this.log.info('Checking for update...')
    })

    autoUpdater.on('update-available', (info) => {
      this.log.info(`New Update available. Found version ${info.version}`)
    })
    autoUpdater.on('update-not-available', (info) => {
      this.log.info(
        `Update not available. ${info.version} is the latest version`,
      )
    })
    autoUpdater.on('error', (err) => {
      this.log.error('Error updating' + err)
    })
    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = 'Download speed (Bps): ' + progressObj.bytesPerSecond
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
      log_message =
        log_message +
        ' (' +
        progressObj.transferred +
        '/' +
        progressObj.total +
        ')'
      this.log.info(log_message)
    })
    autoUpdater.on('update-downloaded', (info) => {
      this.log.info(`Update downloaded. New version ${info.version}`)
    })
  }

  public override checkForUpdates = async (): Promise<AppUpdateInfo | null> => {
    if (this.updating != null) return this.updating
    try {
      const updateInfo = await autoUpdater.checkForUpdates()
      if (updateInfo == null) return null
      if (updateInfo.downloadPromise != null) {
        this.updating = updateInfo.downloadPromise.then(() => {
          return {
            ready: true,
            version: updateInfo.updateInfo.version,
          }
        })
        return {
          ready: false,
          version: updateInfo.updateInfo.version,
        }
      }
    } catch (ex) {
      this.log.error(`Error checking for updates`)
      this.log.error(ex)
    }
    return null
  }

  public override restartAndUpdate = async (): Promise<void> => {
    autoUpdater.quitAndInstall()
  }
}
