import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production' || mode === 'optimized'
  const isAnalyze = mode === 'analyze'
  
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
      // Compression pour la production
      isProduction && viteCompression({
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
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Désactiver COOP pour permettre les postMessage de Google OAuth
        // 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        // 'Cross-Origin-Embedder-Policy': 'require-corp',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.gstatic.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://accounts.google.com https://www.googleapis.com https://budget-mobile-app-pa2n.onrender.com; frame-src 'self' https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'"
      }
    },
    
    // Optimisations de preview
    preview: {
      port: 4173,
      host: true,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Désactiver COOP pour permettre les postMessage de Google OAuth
        // 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        // 'Cross-Origin-Embedder-Policy': 'require-corp',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.gstatic.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://accounts.google.com https://accounts.google.com https://www.googleapis.com https://budget-mobile-app-pa2n.onrender.com; frame-src 'self' https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'"
      }
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
