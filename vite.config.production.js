import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration simplifiée pour la production sans PWA
export default defineConfig({
  plugins: [react()],
  
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['zustand', 'react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'chart.js',
      'react-chartjs-2',
      'zustand',
      'react-router-dom'
    ]
  },
  
  define: {
    __DEV__: false,
    __PROD__: true
  },
  
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@config': '/src/config'
    }
  }
}) 