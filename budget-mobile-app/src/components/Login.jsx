import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useStore } from '../store';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const { setUser, setToken, onboardingCompleted } = useStore();

  const handleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    const decoded = jwtDecode(token);
    setToken(token);
    setUser({
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture
    });
    
    // Pas besoin de navigate() car l'App.jsx gère automatiquement l'affichage
    // basé sur isAuthenticated dans le store
    console.log('Connexion réussie, redirection automatique...');
  };

  const handleError = () => {
    console.error('Login Failed');
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
          useOneTap={!isMobileWebView()} // Désactiver OneTap dans WebView mobile
          auto_select={isMobileWebView()} // Activer auto_select pour WebView
          cancel_on_tap_outside={false} // Empêcher l'annulation
          prompt_parent_id="google-login-container" // Container spécifique
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