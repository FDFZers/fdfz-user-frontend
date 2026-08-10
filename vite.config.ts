import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Proxy API requests to the Go backend during development.
    // Frontend calls `/api/...`, the rewrite strips `/api` so the backend
    // receives the documented `/auth/...` paths.
    proxy: {
      '/api': {
        target: 'http://localhost:11450',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
