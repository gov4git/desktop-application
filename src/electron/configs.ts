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
