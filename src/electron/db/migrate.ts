import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { eq, sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import { DB, loadDb } from './db.js'
import { ballots, communities, configStore, users } from './schema.js'
export async function migrateDb(dbPath: string, isPackaged = false) {
  const migrationPath = resolve(
    isPackaged ? process.resourcesPath : process.cwd(),
    'migrations',
  )
  const db = await loadDb(dbPath)
  migrate(db, { migrationsFolder: migrationPath })
  await createSearchIndex(db)
  await migrateConfigData(db)
  await migrateBallotData(db)
}

async function createSearchIndex(db: DB) {
  const rows = db.all<{ name: string }>(
    sql.raw(
      `SELECT * FROM sqlite_master WHERE type='table' and name='ballotSearch'`,
    ),
  )
  if (rows.length === 0) {
    db.run(
      sql.raw(
        `CREATE VIRTUAL TABLE ballotSearch USING fts5(identifier, title, description, tokenize = 'porter unicode61 remove_diacritics 2');`,
      ),
    )
    const ballotCount = (
      await db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(ballots)
    )[0]
    if (ballotCount != null && ballotCount.count > 0) {
      db.run(
        sql.raw(
          `INSERT INTO ballotSearch (rowid, identifier, title, description) SELECT id, identifier, title, description FROM ballots`,
        ),
      )
    }
  }
}

async function migrateConfigData(db: DB) {
  const user = (await db.select().from(users).limit(1))[0]

  if (user != null) {
    return
  }

  const confStore = (await db.select().from(configStore).limit(1))[0]

  if (confStore == null) {
    return
  }

  const configPath = confStore.path

  if (!existsSync(configPath)) {
    return
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'))

  if (
    config.user != null &&
    config.user.username != null &&
    config.user.username !== '' &&
    config.user.pat != null &&
    config.user.pat !== '' &&
    config.project_repo != null &&
    config.gov_public_url != null &&
    config.gov_public_branch != null &&
    config.project_repo !== '' &&
    config.gov_private_url !== '' &&
    config.gov_public_branch !== '' &&
    config.member_public_url != null &&
    config.member_public_url !== '' &&
    config.member_private_url != null &&
    config.member_private_url !== '' &&
    config.member_public_branch != null &&
    config.member_public_branch !== '' &&
    config.member_private_branch != null &&
    config.member_private_branch !== '' &&
    config.community_name != null &&
    config.community_name !== ''
  ) {
    await db.insert(users).values({
      username: config.user.username,
      pat: config.user.pat,
      memberPublicUrl: config.member_public_url,
      memberPublicBranch: config.member_public_branch,
      memberPrivateUrl: config.member_private_url,
      memberPrivateBranch: config.member_private_branch,
    })

    await db.insert(communities).values({
      url: config.gov_public_url,
      branch: config.gov_public_branch,
      name: config.community_name,
      configPath: configPath,
      projectUrl: config.project_repo,
      selected: true,
    })
  }
}

async function migrateBallotData(db: DB) {
  const rows = await db.select().from(ballots)

  for (const ballot of rows) {
    const voted =
      ballot.user.talliedScore !== 0 || ballot.user.pendingScoreDiff !== 0
    await db
      .update(ballots)
      .set({
        voted,
      })
      .where(eq(ballots.id, ballot.id))
  }
}
