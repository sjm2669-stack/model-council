import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Only proxy /api locally when no Supabase URL is configured
  const useProxy = !env.VITE_COUNCIL_URL

  return {
    plugins: [react()],
    server: useProxy
      ? { proxy: { '/api': 'http://localhost:8000' } }
      : {},
  }
})
