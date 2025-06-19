import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useStore } from '../store';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const { setUser, setToken, onboardingCompleted } = useStore();

  // Nettoyer les erreurs de console au chargement
  useEffect(() => {
    // Supprimer complètement les erreurs de tracking Google
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ');
      if (!message.includes('play.google.com/log') && 
          !message.includes('ERR_BLOCKED_BY_CLIENT') &&
          !message.includes('google-analytics.com') &&
          !message.includes('googlesyndication.com')) {
        originalError.apply(console, args);
      }
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      if (!message.includes('play.google.com/log') && 
          !message.includes('ERR_BLOCKED_BY_CLIENT') &&
          !message.includes('google-analytics.com')) {
        originalWarn.apply(console, args);
      }
    };

    // Nettoyer les erreurs réseau dans la console
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && (
          url.includes('play.google.com/log') ||
          url.includes('google-analytics.com') ||
          url.includes('googlesyndication.com')
      )) {
        // Ignorer silencieusement les requêtes de tracking
        return Promise.resolve(new Response('', { status: 200 }));
      }
      return originalFetch.apply(this, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.fetch = originalFetch;
    };
  }, []);

  const handleSuccess = (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const decoded = jwtDecode(token);
      setToken(token);
      setUser({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      });
      
      console.log('Connexion réussie, redirection automatique...');
    } catch (error) {
      console.error('Erreur lors du traitement de la connexion:', error);
    }
  };

  const handleError = (error) => {
    console.error('Login Failed:', error);
  };

  // Détecter si on est dans une WebView mobile
  const isMobileWebView = () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
           /wv|WebView/i.test(navigator.userAgent);
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Budget Gestion</h1>
      <div className="login-container">
        <h2 className="text-lg text-white">Connectez-vous pour démarrer</h2>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          auto_select={false}
          cancel_on_tap_outside={false}
          context="signin"
          type="standard"
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="rectangular"
          prompt_parent_id="google-login-container"
        />
      </div>
      <span className="login-watermark">XimaMDev - 2025</span>
    </div>
  );
};

export default Login; 