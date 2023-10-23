import path, { resolve } from 'node:path'

import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import { autoUpdater } from 'electron-updater'

import type { InvokeServiceProps } from '~/shared'

import { CONFIG_PATH, DB_PATH } from './configs.js'
import { DB, loadDb } from './db/db.js'
import { migrateDb } from './db/migrate.js'
import { Gov4GitService } from './services/Gov4GitService.js'
import {
  BallotService,
  ConfigService,
  GitService,
  LogService,
  Services,
  UserService,
} from './services/index.js'

const port = process.env['PORT']

const services = new Services()
const logService = new LogService(resolve(CONFIG_PATH, 'logs.txt'))

logService.info(`Gov4Git Version ${logService.getAppVersion()}`)

async function setup(): Promise<void> {
  services.register('log', logService)

  const db = await loadDb(DB_PATH)
  services.register('db', db)
  try {
    await migrateDb(DB_PATH, app.isPackaged)
  } catch (ex) {
    logService.error(`Failed to migrate DB`)
    logService.error(ex)
  }

  const gov4GitService = new Gov4GitService(services)
  services.register('gov4git', gov4GitService)

  const gitService = new GitService()
  services.register('git', gitService)

  const configService = new ConfigService(services)
  services.register('config', configService)

  const ballotService = new BallotService(services)
  services.register('ballots', ballotService)

  const userService = new UserService(services)
  services.register('user', userService)
}

function setupUpdater() {
  autoUpdater.logger = logService
  autoUpdater.disableWebInstaller = true

  autoUpdater.on('checking-for-update', () => {
    logService.info('Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    logService.info(`New Update available. Found version ${info.version}`)
  })
  autoUpdater.on('update-not-available', (info) => {
    logService.info(
      `Update not available. ${info.version} is the latest version`,
    )
  })
  autoUpdater.on('error', (err) => {
    logService.error('Error updating' + err)
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message =
      log_message +
      ' (' +
      progressObj.transferred +
      '/' +
      progressObj.total +
      ')'
    logService.info(log_message)
  })
  autoUpdater.on('update-downloaded', (info) => {
    logService.info(`Update downloaded. New version ${info.version}`)
    win.webContents.send('update-available')
  })
}

async function serviceHandler(
  ev: IpcMainInvokeEvent,
  invokeProps: InvokeServiceProps,
) {
  /**
   * Catch and log service or service registry errors.
   * Pass errors to frontend to be rethrown there for
   * viewing and debugging in frontend dev tools. This
   * is helpful for packaged apps where accessing the
   * logs to the backend may not be possible
   */
  try {
    const response = await services.invoke(invokeProps)
    logService.info(`Invoking ${invokeProps.service}:`, invokeProps)
    logService.info('Response:', response)
    return response
  } catch (ex) {
    try {
      logService.error(`Failed to run service:`, invokeProps)
      logService.error(ex)
    } catch (logError) {
      console.error(
        `=============== ERROR USING THE LOGGING SERVICE =================`,
      )
      console.error(logError)
      console.error(
        `=============== DUMPING ORIGINAL ERROR HERE =================`,
      )
      console.error('========== SERVICE ERROR ==========')
      console.error('PROPS:')
      console.error(invokeProps)
      console.error(ex)
    }
    return ex
  }
}

let win: BrowserWindow

const createWindow = async () => {
  win = new BrowserWindow({
    width: 1080,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
  })

  // port indicates that a vite dev server is running
  if (port != null) {
    await win.loadURL(`http://localhost:${port}`)
  } else {
    await win.loadFile(path.resolve(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  setupUpdater()
  autoUpdater.checkForUpdates()
  app.setAccessibilitySupportEnabled(true)
  setup()

  ipcMain.handle('serviceHandler', serviceHandler)
  ipcMain.handle('restart-and-update', () => {
    autoUpdater.quitAndInstall()
  })
  await createWindow()

  app.on('window-all-closed', () => {
    services.load<LogService>('log').close()
    services.load<DB>('db').close()
    app.quit()
  })
})
