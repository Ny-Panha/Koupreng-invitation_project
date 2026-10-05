import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const envDir = fileURLToPath(new URL('../../', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')
  const backendPort = process.env.BACKEND_PORT || env.BACKEND_PORT || '8080'
  const frontendAdminPort = Number(process.env.FRONTEND_ADMIN_PORT || env.FRONTEND_ADMIN_PORT || 5174)

  return {
    plugins: [react(), tailwindcss()],
    envDir,
    server: {
      host: true,
      port: frontendAdminPort,
      strictPort: true,
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.js'],
    },
  }
})
