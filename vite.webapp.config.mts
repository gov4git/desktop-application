// vite.config.js
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  root: resolve(__dirname, './src/renderer'),
  base: './',
  build: {
    sourcemap: 'inline',
    outDir: resolve(__dirname, './build/renderer'),
    rollupOptions: {
      input: {
        main: resolve(__dirname, './src/renderer/index.html'),
      },
    },
  },
})
