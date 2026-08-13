import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // 代理目标必须指向当前正确的 API 域名，不能误用本地后端。
    // 前端请求 `/api/v1/...`，代理原样转发到 https://fdfz.top/api/v1/...
    proxy: {
      '/api': {
        target: 'https://fdfz.top',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
