import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'

import { toResolvedPath } from '../lib/paths.js'
import * as schema from './schema.js'

export type DB = BetterSQLite3Database<typeof schema> & { close: () => void }

let db: DB | null //= (null = drizzle(sqlite))

export async function loadDb(dbFile: string): Promise<DB> {
  const dbPath = toResolvedPath(dbFile)
  if (db != null) return db

  const dbDir = dirname(dbPath)
  if (!existsSync(dbDir)) {
    await mkdir(dbDir, { recursive: true })
  }
  const sqlite = new Database(dbPath)
  db = drizzle(sqlite, { schema }) as DB
  db.close = () => {
    sqlite.close()
  }
  return db
}
