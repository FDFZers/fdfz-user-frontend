import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Proxy API requests to the Go backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:11450',
        changeOrigin: true,
      },
    },
  },
})
