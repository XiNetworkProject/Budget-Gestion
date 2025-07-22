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
      
      console.log('Login: Début de la connexion pour:', decoded.email);
      
      // Définir le token d'abord
      setToken(token);
      
      // Créer l'objet utilisateur
      const user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      };
      
      console.log('Login: Tentative de récupération des données pour:', user.id);
      
      // Attendre que setUser récupère les données depuis le serveur
      await setUser(user);
      
      // Récupérer l'état mis à jour après setUser
      const currentState = useStore.getState();
      console.log('Login: État après setUser:', { 
        onboardingCompleted: currentState.onboardingCompleted,
        isAuthenticated: currentState.isAuthenticated,
        hasData: !!currentState.expenses?.length || !!currentState.incomeTransactions?.length,
        error: currentState.error
      });
      
      // Vérifier s'il y a eu une erreur
      if (currentState.error) {
        console.error('Login: Erreur lors de la récupération des données:', currentState.error);
        // Continuer quand même, les données locales seront utilisées
      }
      
      // Vérifier et corriger l'état onboarding
      console.log('Login: Vérification de l\'état onboarding après connexion');
      const wasFixed = checkAndFixOnboardingState();
      
      // Récupérer l'état final
      const finalState = useStore.getState();
      console.log('Login: État final:', { 
        onboardingCompleted: finalState.onboardingCompleted,
        isAuthenticated: finalState.isAuthenticated,
        wasFixed
      });
      
      // Rediriger vers l'onboarding seulement si ce n'est pas encore terminé
      if (!finalState.onboardingCompleted) {
        console.log('Login: Redirection vers onboarding');
        navigate('/onboarding', { replace: true });
      } else {
        console.log('Login: Redirection vers home');
        navigate('/home', { replace: true });
      }
    } catch (error) {
      console.error('Login: Erreur lors de la connexion:', error);
      // En cas d'erreur, rediriger vers home quand même
      navigate('/home', { replace: true });
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