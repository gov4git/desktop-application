import { resolve } from 'node:path'

import { sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import { DB, loadDb } from './db.js'
import { appSettings, communities, motions, users } from './schema.js'
export async function migrateDb(dbPath: string, isPackaged = false) {
  const migrationPath = resolve(
    isPackaged ? process.resourcesPath : process.cwd(),
    'migrations',
  )
  const db = loadDb(dbPath)
  migrate(db, { migrationsFolder: migrationPath })
  await cleanupBallotsSearch(db)
  await migrateCommunities(db)
}

async function cleanupBallotsSearch(db: DB) {
  const rows = db.all<{ name: string }>(
    sql.raw(
      `SELECT * FROM sqlite_master WHERE type='table' and name='ballotSearch'`,
    ),
  )

  if (rows.length > 0) {
    db.run(sql.raw('DROP TABLE ballotSearch'))
  }
}

async function migrateCommunities(db: DB) {
  const appInfo = (await db.select().from(appSettings).limit(1))[0]

  if (appInfo == null || appInfo.schemaVersion < 2) {
    await db.delete(users)
    await db.delete(communities)
    await db.delete(motions)
    await db.insert(appSettings).values({
      schemaVersion: 2,
    })
  }
}
