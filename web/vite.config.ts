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
    proxy: {
      '/api/10jqka': {
        target: 'https://eq.10jqka.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/10jqka/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('Referer', 'https://eq.10jqka.com.cn/')
          })
        }
      }
    }
  }
})
