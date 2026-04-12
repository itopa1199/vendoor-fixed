import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-libs': ['zustand', 'axios', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/vd-api': {
        target: 'https://vendoor.ng',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vd-api/, '/store/api'),
        secure: true,
      },
    },
  },
})