import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production' || mode === 'optimized'
  const isAnalyze = mode === 'analyze'
  const isAndroid = mode === 'android'
  const devProxyTarget = process.env.VITE_DEV_API_PROXY_TARGET || process.env.VITE_API_URL || ''
  
  return {
    plugins: [
      react(),
      // PWA désactivée temporairement pour éviter les erreurs de déploiement
      // isProduction && VitePWA({
      //   registerType: 'autoUpdate',
      //   workbox: {
      //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      //     runtimeCaching: [
      //       {
      //         urlPattern: /^https:\/\/api\./,
      //         handler: 'NetworkFirst',
      //         options: {
      //           cacheName: 'api-cache',
      //           expiration: {
      //             maxEntries: 100,
      //             maxAgeSeconds: 60 * 60 * 24 // 24 heures
      //           }
      //         }
      //       }
      //     ]
      //   },
      //   manifest: {
      //     name: 'Budget Gestion',
      //     short_name: 'Budget',
      //     description: 'Application de gestion de budget moderne',
      //     theme_color: '#10131a',
      //     background_color: '#10131a',
      //     display: 'standalone',
      //     icons: [
      //       {
      //         src: 'vite.svg',
      //         sizes: 'any',
      //         type: 'image/svg+xml'
      //       }
      //     ]
      //   }
      // }),
      // Compression pour la production (désactivée pour Android)
      isProduction && !isAndroid && viteCompression({
        algorithm: 'gzip',
        ext: '.gz'
      }),
      // Analyseur de bundle
      isAnalyze && visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    
    // Optimisations de build
    build: {
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction
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
    
    // Optimisations de développement
    server: {
      port: 3000,
      host: true,
      hmr: {
        overlay: false
      },
      // Proxy de développement optionnel pour les routes API
      // Définir VITE_DEV_API_PROXY_TARGET (ex: http://localhost:10000 ou une URL déployée)
      ...(devProxyTarget && {
        proxy: {
          '/api': {
            target: devProxyTarget,
            changeOrigin: true,
            secure: false
          }
        }
      })
    },
    
    // Optimisations de preview
    preview: {
      port: 4173,
      host: true
    },
    
    // Optimisations CSS
    css: {
      devSourcemap: !isProduction
    },
    
    // Optimisations d'import
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
    
    // Variables d'environnement
    define: {
      __DEV__: !isProduction,
      __PROD__: isProduction
    },
    
    // Optimisations de résolution
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@hooks': '/src/hooks',
        '@utils': '/src/utils',
        '@config': '/src/config'
      }
    }
  }
})
