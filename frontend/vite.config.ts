/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// The browser never talks to the backend directly: all /api and /health calls
// are proxied by the dev server (or by nginx in Docker) so no host names or
// keys live in frontend code.
const backend = process.env.VITE_BACKEND_PROXY ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': backend,
      '/health': backend,
    },
  },
  preview: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
