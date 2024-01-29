import path, { resolve } from 'node:path'

import {
  app,
  BrowserWindow,
  ipcMain,
  IpcMainInvokeEvent,
  shell,
} from 'electron'

import type { InvokeServiceProps } from '~/shared'

import {
  COMMUNITY_REPO_NAME,
  CONFIG_PATH,
  DB_PATH,
  GITHUB_OAUTH_CLIENT_ID,
} from './configs.js'
import { DB, loadDb } from './db/db.js'
import { migrateDb } from './db/migrate.js'
import { CommunityService } from './services/CommunityService.js'
import { Gov4GitService } from './services/Gov4GitService.js'
import {
  AppUpdaterService,
  GitHubService,
  LogService,
  MotionService,
  Services,
  ValidationService,
} from './services/index.js'
import { SettingsService } from './services/SettingsService.js'
import { UserService } from './services/UserService.js'

const port = process.env['PORT']

const services = new Services()
const logService = new LogService(resolve(CONFIG_PATH, 'logs.txt'))
services.register('log', logService)

logService.info(`Gov4Git Version ${logService.getAppVersion()}`)

async function setup(): Promise<void> {
  try {
    logService.info(`Initializing DB: ${DB_PATH}`)
    const db = loadDb(DB_PATH)
    services.register('db', db)
  } catch (ex) {
    logService.error(`Failed to load DB. ${ex}`)
  }
  try {
    await migrateDb(DB_PATH, app.isPackaged)
  } catch (ex) {
    logService.error(`Failed to migrate DB. ${ex}`)
    logService.error(ex)
  }

  const gitHubService = new GitHubService({
    services,
    clientId: GITHUB_OAUTH_CLIENT_ID,
  })
  services.register('github', gitHubService)

  const gov4GitService = new Gov4GitService(services)
  services.register('gov4git', gov4GitService)

  const settingsService = new SettingsService({
    services,
  })
  services.register('settings', settingsService)

  const userService = new UserService({
    services,
    identityRepoName: COMMUNITY_REPO_NAME,
  })
  services.register('user', userService)

  const communityService = new CommunityService({
    services,
    configDir: CONFIG_PATH,
  })
  services.register('community', communityService)

  const motionService = new MotionService({
    services,
  })
  services.register('motion', motionService)

  const validationService = new ValidationService({
    services,
  })
  services.register('validation', validationService)

  const appUpdaterService = new AppUpdaterService(services)
  services.register('appUpdater', appUpdaterService)
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
    logService.info(`Invoked ${invokeProps.service}:`, invokeProps)
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

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // port indicates that a vite dev server is running
  if (port != null) {
    await win.loadURL(`http://localhost:${port}`)
  } else {
    await win.loadFile(path.resolve(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  app.setAccessibilitySupportEnabled(true)
  setup()

  ipcMain.handle('serviceHandler', serviceHandler)
  await createWindow()

  app.on('window-all-closed', () => {
    services.load<LogService>('log').close()
    services.load<DB>('db').close()
    app.quit()
  })
})
