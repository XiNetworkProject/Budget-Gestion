import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper
} from '@mui/material';
import { Google } from '@mui/icons-material';

const GoogleAuth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginWithGoogle } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Vérifier si on vient de Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setError('Erreur lors de l\'authentification Google');
      setLoading(false);
      return;
    }

    if (code) {
      // Traiter le code d'autorisation Google
      handleGoogleCallback(code);
    } else {
      // Rediriger vers Google OAuth
      initiateGoogleAuth();
    }
  }, []);

  const initiateGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = 'https://budget-mobile-app-pa2n.onrender.com/auth/google';
    const scope = 'email profile';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  const handleGoogleCallback = async (code) => {
    try {
      setLoading(true);
      
      // Échanger le code contre un token directement avec Google
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code,
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          redirect_uri: 'https://budget-mobile-app-pa2n.onrender.com/auth/google',
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Erreur lors de l\'échange du code');
      }

      const tokenData = await tokenResponse.json();
      
      // Récupérer les informations utilisateur
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Erreur lors de la récupération des informations utilisateur');
      }

      const userData = await userResponse.json();
      
      // Créer l'objet utilisateur
      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture
      };

      // Connecter l'utilisateur via le store
      await loginWithGoogle(tokenData.access_token, user);
      
      // Rediriger vers l'app
      if (window.Capacitor) {
        // Dans Capacitor, fermer le navigateur et retourner à l'app
        if (window.Capacitor.Plugins?.Browser) {
          await window.Capacitor.Plugins.Browser.close();
        }
      } else {
        // Sur web, rediriger vers l'app de production
        window.location.href = 'https://budget-mobile-app-pa2n.onrender.com';
      }
      
    } catch (err) {
      console.error('Erreur Google Auth:', err);
      setError('Erreur lors de l\'authentification Google');
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setLoading(true);
    initiateGoogleAuth();
  };

  const handleCancel = () => {
    if (window.Capacitor) {
      // Dans Capacitor, fermer le navigateur
      if (window.Capacitor.Plugins?.Browser) {
        window.Capacitor.Plugins.Browser.close();
      }
    } else {
      // Sur web, rediriger vers la page de connexion de production
      window.location.href = 'https://budget-mobile-app-pa2n.onrender.com/login';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: 2,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Paper elevation={8} sx={{ p: 4, borderRadius: 3, maxWidth: 400, width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Google sx={{ fontSize: 48, color: '#4285f4', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Connexion Google
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Authentification sécurisée avec votre compte Google
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1">
              Connexion en cours...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Veuillez patienter pendant que nous vous connectons
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={handleRetry}>
                Réessayer
              </Button>
              <Button variant="outlined" onClick={handleCancel}>
                Annuler
              </Button>
            </Box>
          </Box>
        ) : null}
      </Paper>
    </Box>
  );
};

export default GoogleAuth; 