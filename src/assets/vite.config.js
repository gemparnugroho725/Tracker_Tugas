import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ FIX untuk Netlify blank screen
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
})
