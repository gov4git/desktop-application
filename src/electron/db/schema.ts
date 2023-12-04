import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { type Ballot as BallotType, Expand, ExpandRecursive } from '~/shared'

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
  status: text('status', { enum: ['open', 'closed'] })
    .notNull()
    .default('open'),
})

export type BallotDB = typeof ballots.$inferSelect
export type BallotDBInsert = typeof ballots.$inferInsert

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

/**
 * Version 2 DB
 */

export const communities = sqliteTable('communities', {
  url: text('url').primaryKey(),
  branch: text('branch').notNull(),
  name: text('name').notNull(),
  configPath: text('configPath').notNull(),
  projectUrl: text('projectUrl').notNull(),
  selected: integer('selected', { mode: 'boolean' }).notNull(),
})

export type Community = typeof communities.$inferSelect
export type CommunityInsert = typeof communities.$inferInsert

export const users = sqliteTable('users', {
  username: text('username').primaryKey(),
  pat: text('pat').notNull(),
  memberPublicUrl: text('memberPublicUrl').notNull(),
  memberPublicBranch: text('memberPublicBranch').notNull(),
  memberPrivateUrl: text('memberPrivateUrl').notNull(),
  memberPrivateBranch: text('memberPrivateBranch').notNull(),
})

export type User = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert

export const userCommunities = sqliteTable('userCommunities', {
  id: integer('id', { mode: 'number' }).primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.username),
  communityId: text('communityId')
    .notNull()
    .unique()
    .references(() => communities.url),
  uniqueId: text('uniqueId').unique(),
  isMember: integer('isMember', { mode: 'boolean' }).notNull(),
  isMaintainer: integer('isMaintainer', { mode: 'boolean' }).notNull(),
  votingCredits: real('votingCredits').notNull(),
  votingScore: real('votingScore').notNull(),
  joinRequestUrl: text('joinRequestUrl'),
  joinRequestStatus: text('joinRequestStatus', { enum: ['open', 'closed'] }),
})

export type UserCommunity = typeof userCommunities.$inferSelect
export type UserCommunityInsert = typeof userCommunities.$inferInsert

export type FullUserCommunity = Expand<UserCommunity & Community>

export type FullUser = ExpandRecursive<
  User & {
    communities: FullUserCommunity[]
  }
>
