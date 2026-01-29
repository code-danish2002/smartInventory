import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    //define env variables from .env files
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    },
    server: {
      port: 5174,
      cors: true,
      host: '0.0.0.0',
      fs: {
        allow: ['.'],
      }
    },
  }
});