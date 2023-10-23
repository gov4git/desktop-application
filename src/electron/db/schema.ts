import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { type Ballot as BallotType, Config } from '~/shared'

export const ballots = sqliteTable('ballots', {
  identifier: text('identifier').primaryKey(),
  label: text('label', { enum: ['issues', 'pull', 'other'] }).notNull(),
  communityUrl: text('communityUrl').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  choices: text('choices', { mode: 'json' })
    .notNull()
    .$type<BallotType['choices']>(),
  choice: text('choice').notNull(),
  score: real('score').notNull(),
  user: text('user', { mode: 'json' }).notNull().$type<BallotType['user']>(),
})

export type BallotDB = typeof ballots.$inferSelect
export type InsertBallotDB = typeof ballots.$inferInsert

export const configs = sqliteTable('configs', {
  communityUrl: text('communityUrl').notNull().primaryKey(),
  name: text('name').notNull(),
  path: text('path').notNull(),
  projectUrl: text('projectUrl').notNull(),
})

export type ConfigDB = typeof configs.$inferSelect
export type InsertConfigDB = typeof configs.$inferInsert

export const configStore = sqliteTable('configStore', {
  id: integer('id', { mode: 'number' }).primaryKey(),
  communityUrl: text('communityUrl').notNull(),
  path: text('path').notNull(),
  name: text('name').notNull(),
  projectUrl: text('projectUrl').notNull(),
})

export type ConfigStoreDB = typeof configStore.$inferSelect
export type InsertConfigStoreDB = typeof configStore.$inferInsert
