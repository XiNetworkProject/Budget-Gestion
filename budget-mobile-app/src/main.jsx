import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import './i18n'
import ErrorBoundary from './components/optimized/ErrorBoundary'
import NotificationManager from './components/optimized/NotificationManager'
// Supprimer les warnings React sur defaultProps dans les composants memo
const suppressedErrors = [/Support for defaultProps/];
const originalConsoleError = console.error.bind(console);
console.error = (...args) => {
  if (typeof args[0] === 'string' && suppressedErrors.some(re => re.test(args[0]))) {
    return;
  }
  originalConsoleError(...args);
};
import AppRoutes from './Routes.jsx'
import { Toaster } from 'react-hot-toast'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <>
            <AppRoutes />
            <Toaster position="bottom-right" />
            <NotificationManager />
        </>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
