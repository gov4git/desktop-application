import type { Config } from 'drizzle-kit'

export default {
  schema: './src/electron/db/schema.ts',
  out: './migrations',
  driver: 'better-sqlite',
  verbose: true,
  strict: true,
  introspect: {
    casing: 'preserve',
  },
} satisfies Config
