import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import LoadingSpinner from './optimized/LoadingSpinner';
import { useStore } from '../store';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { checkAutoLogin, user, initialDataLoaded } = useStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      await new Promise(r => setTimeout(r, 700));
      const hasSession = await checkAutoLogin();
      // attendre que les données serveur soient chargées pour éviter l'état par défaut
      for (let i = 0; i < 20; i++) {
        if (initialDataLoaded) break;
        await new Promise(r => setTimeout(r, 100));
      }
      if (!mounted) return;
      if (hasSession && user) {
        navigate('/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    })();
    return () => { mounted = false; };
  }, [checkAutoLogin, user, navigate, initialDataLoaded]);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)'
    }}>
      <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
        Budget Gestion
      </Typography>
      <LoadingSpinner message="Chargement..." variant="elegant" fullScreen={false} size={64} />
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 2 }}>
        Initialisation de votre session
      </Typography>
    </Box>
  );
};

export default SplashScreen;

