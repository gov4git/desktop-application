/* eslint-disable @typescript-eslint/no-var-requires */
const { notarize } = require('@electron/notarize')
const path = require('path')
const fs = require('fs')

exports.default = async function notarizeMacos(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    console.log('Notarizing not running on darwin. Skipping.')
    return
  }

  if (
    !('APPLE_ID' in process.env && 'APPLE_APP_SPECIFIC_PASSWORD' in process.env)
  ) {
    console.warn(
      'Skipping notarizing step. APPLE_ID and APPLE_APP_SPECIFIC_PASSWORD env variables must be set',
    )
    return
  }

  const appName = context.packager.appInfo.productFilename
  const appPath = path.resolve(appOutDir, `${appName}.app`)

  if (!fs.existsSync(appPath)) {
    console.log(`${appPath} does not exist. Skipping`)
    return
  }

  console.log(`Notarizing: ${appPath}`)

  await notarize({
    appPath: appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  })
}
