import { resolve } from 'node:path'

import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import { loadDb } from './db.js'
export async function migrateDb(dbPath: string, isPackaged = false) {
  const migrationPath = resolve(
    isPackaged ? process.resourcesPath : process.cwd(),
    'migrations',
  )
  const db = await loadDb(dbPath)
  migrate(db, { migrationsFolder: migrationPath })
}
