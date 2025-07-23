import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import i18n from './i18n'
import ErrorBoundary from './components/optimized/ErrorBoundary'
import { startPerformanceMonitoring } from './utils/performanceTest'
import SmartNotifications from './components/optimized/SmartNotifications'

// Supprimer les warnings React sur defaultProps dans les composants memo
const suppressedErrors = [/Support for defaultProps/];
const originalConsoleError = console.error.bind(console);
console.error = (...args) => {
  if (typeof args[0] === 'string' && suppressedErrors.some(re => re.test(args[0]))) {
    return;
  }
  originalConsoleError(...args);
};

// Routes optimisées avec lazy loading
import AppRoutesOptimized from './RoutesOptimized.jsx'
import { Toaster } from 'react-hot-toast'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Démarrer le monitoring de performance en mode développement
if (process.env.NODE_ENV === 'development') {
  startPerformanceMonitoring();
}

// Attendre que i18n soit initialisé avant de rendre l'app
i18n.on('initialized', () => {
  console.log('i18n initialized successfully');
  console.log('Current language:', i18n.language);
  console.log('Available languages:', i18n.languages);
  
  // Optimisation du rendu avec ErrorBoundary et routes optimisées
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <AppRoutesOptimized />
            <SmartNotifications />
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(0,0,0,0.9)',
                  color: 'white',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }
              }}
            />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
});

// Fallback si i18n ne s'initialise pas
setTimeout(() => {
  if (!i18n.isInitialized) {
    console.warn('i18n not initialized, rendering app anyway');
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <ErrorBoundary>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
              <AppRoutesOptimized />
              <SmartNotifications />
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(0,0,0,0.9)',
                    color: 'white',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }
                }}
              />
            </BrowserRouter>
          </GoogleOAuthProvider>
        </ErrorBoundary>
      </StrictMode>,
    )
  }
}, 2000);
