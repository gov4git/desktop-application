import { resolve } from 'node:path'

import { toResolvedPath } from './lib/paths.js'

export const CONFIG_PATH = toResolvedPath(
  process.env['GOV4GIT_CONFIG_PATH'] ?? '~/.gov4git',
)
export const DB_PATH = resolve(
  process.env['GOV4GIT_DB_PATH'] ?? CONFIG_PATH,
  'gov4git.db',
)
