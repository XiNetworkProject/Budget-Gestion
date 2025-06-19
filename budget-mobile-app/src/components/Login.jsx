import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useStore } from '../store';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const { setUser, setToken, onboardingCompleted } = useStore();

  // Nettoyer les erreurs de console au chargement
  useEffect(() => {
    // Supprimer les erreurs de tracking Google
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (!message.includes('play.google.com/log') && !message.includes('ERR_BLOCKED_BY_CLIENT')) {
        originalError.apply(console, args);
      }
    };

    return () => {
      console.error = originalError;
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
          useOneTap={false} // Désactiver OneTap pour éviter les problèmes
          auto_select={false} // Désactiver auto_select
          cancel_on_tap_outside={false}
          context="signin"
          type="standard"
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>
      <span className="login-watermark">XimaMDev - 2025</span>
    </div>
  );
};

export default Login; 