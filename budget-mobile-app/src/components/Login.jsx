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
    try {
      const token = credentialResponse.credential;
      const decoded = jwtDecode(token);
      setToken(token);
      
      console.log('Login: Début de la connexion pour:', decoded.email);
      
      // Attendre que setUser charge les données depuis le serveur
      await setUser({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      });
      
      console.log('Login: setUser terminé, vérification de l\'état onboarding');
      
      // Vérifier et corriger l'état onboarding
      const wasFixed = checkAndFixOnboardingState();
      
      // Récupérer l'état mis à jour
      const currentState = useStore.getState();
      console.log('Login: État après setUser:', { 
        onboardingCompleted: currentState.onboardingCompleted,
        isAuthenticated: currentState.isAuthenticated,
        wasFixed,
        hasData: !!(currentState.expenses?.length || currentState.incomeTransactions?.length || currentState.transactions?.length)
      });
      
      // Rediriger vers l'onboarding seulement si ce n'est pas encore terminé
      if (!currentState.onboardingCompleted) {
        console.log('Login: Redirection vers onboarding');
        navigate('/onboarding', { replace: true });
      } else {
        console.log('Login: Redirection vers home');
        navigate('/home', { replace: true });
      }
    } catch (error) {
      console.error('Login: Erreur lors de la connexion:', error);
      // Gérer l'erreur (afficher un message à l'utilisateur)
    }
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <div className="login-page">
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