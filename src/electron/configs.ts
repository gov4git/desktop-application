import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { toResolvedPath } from './lib/paths.js'

export const CONFIG_PATH = toResolvedPath(
  process.env['GOV4GIT_CONFIG_PATH'] ?? '~/.gov4git',
)
export const DB_PATH = toResolvedPath(
  process.env['GOV4GIT_DB_PATH'] ?? resolve(CONFIG_PATH, 'gov4git.db'),
)

export const COMMUNITY_REPO_NAME =
  process.env['GOV4GIT_COMMUNITY_REPO_NAME'] ?? 'gov4git-identity'

export const GITHUB_OAUTH_CLIENT_ID = '912c0ab18e0f0b4a1abe'

export let CLI_VERSION = ''

export function setCliVersion(isPackaged: boolean) {
  const packageJsonPath = resolve(
    isPackaged ? process.resourcesPath : process.cwd(),
    'package.json',
  )

  const pkgJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  CLI_VERSION = pkgJson['dependencies']['@gov4git/js-client']
}
