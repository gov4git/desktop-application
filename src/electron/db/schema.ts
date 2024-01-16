import {
  int,
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'

export const appSettings = sqliteTable('appSettings', {
  id: int('id', { mode: 'number' }).primaryKey(),
  schemaVersion: real('schemaVersion').notNull(),
})

export type AppSettings = typeof appSettings.$inferSelect
export type AppSettingsInsert = typeof appSettings.$inferInsert

export const communities = sqliteTable('communities', {
  url: text('url').primaryKey(),
  privateUrl: text('privateUrl').notNull().default(''),
  branch: text('branch').notNull(),
  name: text('name').notNull(),
  configPath: text('configPath').notNull(),
  projectUrl: text('projectUrl').notNull(),
  selected: integer('selected', { mode: 'boolean' }).notNull(),
  isMember: integer('isMember', { mode: 'boolean' }).notNull().default(false),
  isMaintainer: integer('isMaintainer', { mode: 'boolean' })
    .notNull()
    .default(false),
  joinRequestUrl: text('joinRequestUrl'),
  joinRequestStatus: text('joinRequestStatus', { enum: ['open', 'closed'] }),
  userVotingCredits: real('userVotingCredits').notNull().default(0),
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

export const motions = sqliteTable(
  'motions',
  {
    id: int('id').primaryKey(),
    motionId: text('motionId').notNull(),
    ballotId: text('ballotId').notNull(),
    openedAt: text('openedAt').notNull(),
    closedAt: text('closedAt').notNull(),
    type: text('type', { enum: ['concern', 'proposal'] }).notNull(),
    trackerUrl: text('trackerUrl').notNull(),
    communityUrl: text('communityUrl').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    choices: text('choices', { mode: 'json' }).notNull().$type<string[]>(),
    choice: text('choice').notNull(),
    score: real('score').notNull(),
    userScore: real('userScore').notNull(),
    userStrength: real('userStrength').notNull(),
    status: text('status', { enum: ['open', 'closed', 'cancelled', 'frozen'] })
      .notNull()
      .default('open'),
    userVoted: int('userVoted', { mode: 'boolean' }).notNull().default(false),
    userVotePending: int('userVotePending', { mode: 'boolean' })
      .notNull()
      .default(false),
  },
  (t) => ({
    uniqueId: unique().on(t.motionId, t.ballotId, t.communityUrl),
  }),
)

export type MotionType = 'concern' | 'proposal'
export type MotionVotedStatus = 'Voted' | 'Not Voted'
export type MotionStatus = 'open' | 'closed' | 'cancelled' | 'frozen'
export type Motion = typeof motions.$inferSelect
export type MotionInsert = typeof motions.$inferInsert

export type MotionSearch = {
  status?: MotionStatus[]
  search?: string
  type?: MotionType
  voted?: MotionVotedStatus[]
}

export type MotionSearchResults = {
  totalCount: number
  matchingCount: number
  motions: Motion[]
}

export type MotionVoteOption = {
  name: string
  choice: string
  strength: string
}

export const motionsFullTextSearch = sqliteTable('motionsFullTextSearch', {
  rowid: int('rowid').primaryKey(),
  trackerUrl: text('trackerUrl').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
})

export type MotionsFullTextSearch = typeof motionsFullTextSearch.$inferSelect
export type MotionsFullTextSearchInsert =
  typeof motionsFullTextSearch.$inferInsert
