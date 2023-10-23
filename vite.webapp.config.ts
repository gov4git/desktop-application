// vite.config.js
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
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
