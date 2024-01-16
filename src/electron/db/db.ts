import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'

import { toResolvedPath } from '../lib/paths.js'
import * as schema from './schema.js'

export type DB = BetterSQLite3Database<typeof schema> & { close: () => void }

let db: DB | null //= (null = drizzle(sqlite))

export function loadDb(dbFile: string): DB {
  if (db != null) return db
  const dbPath = toResolvedPath(dbFile)

  setupDB(dbPath)

  const sqlite = new Database(dbPath)
  db = drizzle(sqlite, { schema }) as DB
  db.close = () => {
    sqlite.close()
  }
  return db
}

function setupDB(dbPath: string) {
  const dbDir = dirname(dbPath)

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }
}
