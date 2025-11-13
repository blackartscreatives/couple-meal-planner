import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Replace process.cwd() with '.' to avoid TypeScript type errors.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    base: "/couple-meal-planner/",
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  }
})