import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // 开发环境下将 `/api` 代理到后端，避免跨域 CORS 问题。
    // 前端请求 `/api/v1/...`，代理原样转发到 https://space.dev.fdfz.top/api/v1/...
    proxy: {
      '/api': {
        target: 'https://space.dev.fdfz.top',
        changeOrigin: true,
      },
    },
  },
})
