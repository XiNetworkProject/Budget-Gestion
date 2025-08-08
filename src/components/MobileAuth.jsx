import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Google,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Phone
} from '@mui/icons-material';

const MobileAuth = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { login, register, isAuthenticated } = useStore();
  
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Détecter si on est sur mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());
  }, []);

  const handleGoogleAuth = async () => {
    // Mode mobile Google désactivé (temporaire)
    setError(t('auth.googleError'));
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Logique d'authentification par SMS
      // À implémenter selon vos besoins
      console.log('Phone auth:', phone);
    } catch (err) {
      setError(t('auth.phoneError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 400, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
          {t('auth.welcome')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Bouton Google - Adapté pour mobile */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleAuth}
          disabled={loading}
          sx={{ 
            mb: 2, 
            py: 1.5,
            borderColor: '#4285f4',
            color: '#4285f4',
            '&:hover': {
              borderColor: '#3367d6',
              backgroundColor: 'rgba(66, 133, 244, 0.04)'
            }
          }}
        >
          {isMobile ? t('auth.googleMobile') : t('auth.googleWeb')}
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('auth.or')}
          </Typography>
        </Divider>

        {/* Formulaire email/mot de passe */}
        <form onSubmit={handleEmailAuth}>
          <TextField
            fullWidth
            type="email"
            label={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              authMode === 'login' ? t('auth.login') : t('auth.register')
            )}
          </Button>
        </form>

        {/* Option d'authentification par téléphone */}
        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('auth.or')}
          </Typography>
        </Divider>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            type="tel"
            label={t('auth.phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 6 12 34 56 78"
            InputProps={{
              startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Button
            variant="outlined"
            onClick={handlePhoneAuth}
            disabled={loading || !phone}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            {t('auth.sendCode')}
          </Button>
        </Box>

        {/* Liens de navigation */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            sx={{ textTransform: 'none' }}
          >
            {authMode === 'login' 
              ? t('auth.noAccount') 
              : t('auth.hasAccount')
            }
          </Button>
        </Box>

        {/* Informations pour mobile */}
        {isMobile && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {t('auth.mobileInfo')}
            </Typography>
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default MobileAuth; 