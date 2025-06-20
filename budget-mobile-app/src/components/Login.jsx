import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useStore } from '../store';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { setUser, setToken, onboardingCompleted, checkAndFixOnboardingState } = useStore();
  const navigate = useNavigate();

  console.log('Login: État actuel onboardingCompleted:', onboardingCompleted);

  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const decoded = jwtDecode(token);
    setToken(token);
    setUser({
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture
    });
    
    // Attendre un peu pour que l'état soit restauré depuis la persistance locale
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Vérifier et corriger l'état onboarding
    console.log('Login: Vérification de l\'état onboarding après connexion');
    const wasFixed = checkAndFixOnboardingState();
    
    // Récupérer l'état mis à jour
    const currentState = useStore.getState();
    console.log('Login: État après setUser:', { 
      onboardingCompleted: currentState.onboardingCompleted,
      isAuthenticated: currentState.isAuthenticated,
      wasFixed
    });
    
    // Rediriger vers l'onboarding seulement si ce n'est pas encore terminé
    if (!currentState.onboardingCompleted) {
      console.log('Login: Redirection vers onboarding');
      navigate('/onboarding', { replace: true });
    } else {
      console.log('Login: Redirection vers home');
      navigate('/home', { replace: true });
    }
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Budget Gestion</h1>
      <div className="login-container">
        <h2 className="text-lg text-white">Connectez-vous pour démarrer</h2>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
      </div>
      <span className="login-watermark">XimaMDev - 2025</span>
    </div>
  );
};

export default Login; 