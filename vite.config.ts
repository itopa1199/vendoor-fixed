import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — loaded on every page
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts — only loaded in admin/analytics pages
          'vendor-charts': ['recharts'],
          // State + utils
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
