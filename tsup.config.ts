import { resolve } from 'node:path'

import { defineConfig } from 'tsup'

export default defineConfig(() => ({
  entry: ['./src/electron/main.ts', './src/electron/preload.ts'],
  format: ['cjs'],
  target: 'node18',
  outDir: resolve(__dirname, './build/electron'),
  external: ['electron'],
  treeshake: false,
  splitting: false,
  sourcemap: 'inline',
  clean: false,
}))
