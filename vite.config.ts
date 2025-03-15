import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [
    vue()
  ],
  base: './newweb',
  build: {
    outDir: 'YHybrid',
  },
  server: {
    port: 8181,
  }
})
