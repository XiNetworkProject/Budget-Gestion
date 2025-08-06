import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useStore } from '../store';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useMobileAuth } from '../hooks/useMobileAuth';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Fade,
  Zoom,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import {
  Google,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  CheckCircle,
  Error,
  AutoAwesome,
  TrendingUp,
  AccountBalance,
  Savings
} from '@mui/icons-material';

const Login = () => {
  const { 
    setUser, 
    setToken, 
    onboardingCompleted, 
    checkAndFixOnboardingState,
    isAuthenticated,
    user,
    autoLogin,
    checkAutoLogin: storeCheckAutoLogin,
    forceSave
  } = useStore();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // États pour le formulaire de connexion
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // États pour le formulaire d'inscription
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // États pour l'affichage des mots de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Vérifier la connexion automatique au chargement
  useEffect(() => {
    const checkAutoLogin = async () => {
      console.log('Vérification de la connexion automatique:', { autoLogin, isAuthenticated, user: !!user });
      
      if (autoLogin && isAuthenticated && user) {
        console.log('Connexion automatique détectée - utilisateur déjà connecté');
        redirectToApp();
        return;
      }
      
      // Vérifier s'il y a des données persistées pour la reconnexion automatique
      if (autoLogin && !isAuthenticated) {
        try {
          const canAutoLogin = await storeCheckAutoLogin();
          if (canAutoLogin) {
            console.log('Connexion automatique détectée - restauration de session');
            redirectToApp();
            return;
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de la connexion automatique:', error);
        }
      }
      
      console.log('Aucune connexion automatique détectée');
    };
    
    // Délai pour laisser le temps au store de se charger
    const timer = setTimeout(checkAutoLogin, 1000);
    
    return () => clearTimeout(timer);
  }, [autoLogin, isAuthenticated, user, storeCheckAutoLogin]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleLoginFormChange = (field) => (event) => {
    setLoginForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const handleRegisterFormChange = (field) => (event) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validation
      if (!validateEmail(loginForm.email)) {
        throw new Error('Adresse email invalide');
      }
      
      if (!validatePassword(loginForm.password)) {
        throw new Error('Mot de passe trop court (minimum 6 caractères)');
      }
      
      // Simulation de connexion (à remplacer par votre API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Créer un token simulé
      const mockToken = btoa(JSON.stringify({
        sub: 'user_' + Date.now(),
        email: loginForm.email,
        name: loginForm.email.split('@')[0],
        picture: null
      }));
      
      const decoded = {
        sub: 'user_' + Date.now(),
        email: loginForm.email,
        name: loginForm.email.split('@')[0],
        picture: null
      };
      
      // Définir le token et l'utilisateur
      setToken(mockToken);
      
      const user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      };
      
      await setUser(user);
      
      setSuccess('Connexion réussie !');
      
      // Forcer la sauvegarde des données de session
      console.log('Login Email: Sauvegarde de la session pour la reconnexion automatique');
      forceSave();
      
      setTimeout(() => {
        redirectToApp();
      }, 1000);
      
    } catch (error) {
      setError(error.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validation
      if (!registerForm.name.trim()) {
        throw new Error('Le nom est requis');
      }
      
      if (!validateEmail(registerForm.email)) {
        throw new Error('Adresse email invalide');
      }
      
      if (!validatePassword(registerForm.password)) {
        throw new Error('Mot de passe trop court (minimum 6 caractères)');
      }
      
      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      
      // Simulation d'inscription (à remplacer par votre API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Créer un token simulé
      const mockToken = btoa(JSON.stringify({
        sub: 'user_' + Date.now(),
        email: registerForm.email,
        name: registerForm.name,
        picture: null
      }));
      
      const decoded = {
        sub: 'user_' + Date.now(),
        email: registerForm.email,
        name: registerForm.name,
        picture: null
      };
      
      // Définir le token et l'utilisateur
      setToken(mockToken);
      
      const user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      };
      
      await setUser(user);
      
      setSuccess('Compte créé avec succès !');
      
      // Forcer la sauvegarde des données de session
      console.log('Inscription Email: Sauvegarde de la session pour la reconnexion automatique');
      forceSave();
      
      setTimeout(() => {
        redirectToApp();
      }, 1000);
      
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const { isMobile, isCapacitor, handleGoogleAuth } = useMobileAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      
      const token = credentialResponse.credential;
      const decoded = jwtDecode(token);
      
      console.log('Login Google: Début de la connexion pour:', decoded.email);
      
      // Définir le token d'abord
      setToken(token);
      
      // Créer l'objet utilisateur
      const user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      };
      
      console.log('Login Google: Tentative de récupération des données pour:', user.id);
      
      // Attendre que setUser récupère les données depuis le serveur
      await setUser(user);
      
      // Récupérer l'état mis à jour après setUser
      const currentState = useStore.getState();
      console.log('Login Google: État après setUser:', { 
        onboardingCompleted: currentState.onboardingCompleted,
        isAuthenticated: currentState.isAuthenticated,
        hasData: !!currentState.expenses?.length || !!currentState.incomeTransactions?.length,
        error: currentState.error
      });
      
      // Vérifier s'il y a eu une erreur
      if (currentState.error) {
        console.error('Login Google: Erreur lors de la récupération des données:', currentState.error);
        // Continuer quand même, les données locales seront utilisées
      }
      
      // Vérifier et corriger l'état onboarding
      console.log('Login Google: Vérification de l\'état onboarding après connexion');
      const wasFixed = checkAndFixOnboardingState();
      
      // Récupérer l'état final
      const finalState = useStore.getState();
      console.log('Login Google: État final:', { 
        onboardingCompleted: finalState.onboardingCompleted,
        isAuthenticated: finalState.isAuthenticated,
        wasFixed
      });
      
      setSuccess('Connexion Google réussie !');
      
      // Forcer la sauvegarde des données de session
      console.log('Login Google: Sauvegarde de la session pour la reconnexion automatique');
      forceSave();
      
      setTimeout(() => {
        redirectToApp();
      }, 1000);
      
    } catch (error) {
      console.error('Login Google: Erreur lors de la connexion:', error);
      setError('Erreur lors de la connexion Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Login Google Failed');
    setError('Erreur lors de la connexion Google');
  };

  const redirectToApp = () => {
    // Récupérer l'état final
    const finalState = useStore.getState();
      
      // Rediriger vers l'onboarding seulement si ce n'est pas encore terminé
      if (!finalState.onboardingCompleted) {
        console.log('Login: Redirection vers onboarding');
        navigate('/onboarding', { replace: true });
      } else {
        console.log('Login: Redirection vers home');
        navigate('/home', { replace: true });
      }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules d'arrière-plan */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0
      }}>
        {[...Array(20)].map((_, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, ${Math.random() * 0.3 + 0.1})`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              filter: 'blur(0.5px)',
              boxShadow: '0 0 10px rgba(255,255,255,0.3)',
              '@keyframes floatParticle': {
                '0%': {
                  transform: 'translateY(100vh) translateX(0px) rotate(0deg)',
                  opacity: 0
                },
                '10%': {
                  opacity: 1
                },
                '90%': {
                  opacity: 1
                },
                '100%': {
                  transform: 'translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg)',
                  opacity: 0
                }
              }
            }}
          />
        ))}
        
        {[...Array(8)].map((_, index) => (
          <Box
            key={`large-${index}`}
            sx={{
              position: 'absolute',
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              background: `rgba(255, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 0.2 + 0.05})`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticleLarge ${Math.random() * 15 + 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
              filter: 'blur(1px)',
              boxShadow: '0 0 20px rgba(255,255,255,0.2)',
              '@keyframes floatParticleLarge': {
                '0%': {
                  transform: 'translateY(100vh) translateX(0px) rotate(0deg)',
                  opacity: 0
                },
                '10%': {
                  opacity: 1
                },
                '90%': {
                  opacity: 1
                },
                '100%': {
                  transform: 'translateY(-100px) translateX(${Math.random() * 300 - 150}px) rotate(720deg)',
                  opacity: 0
                }
              }
            }}
          />
        ))}
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1000}>
          <Paper sx={{
            p: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Zoom in timeout={800}>
                <Box sx={{ mb: 2 }}>
                  <Avatar sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                  }}>
                    <AccountBalance sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}>
                    BudgetGestion
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                    Gérez vos finances en toute simplicité
                  </Typography>
                </Box>
              </Zoom>

              {/* Fonctionnalités */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Suivi intelligent" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  icon={<Savings />} 
                  label="Épargne optimisée" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  icon={<AutoAwesome />} 
                  label="IA intégrée" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Onglets */}
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ 
                mb: 3,
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: 'white'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#667eea'
                }
              }}
            >
              <Tab label="Connexion" />
              <Tab label="Inscription" />
            </Tabs>

            {/* Messages d'erreur et de succès */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {/* Contenu des onglets */}
            {activeTab === 0 && (
              <Fade in timeout={300}>
                <Box>
                  {/* Connexion par email */}
                  <form onSubmit={handleEmailLogin}>
                                         <TextField
                       fullWidth
                       label="Adresse email"
                       type="email"
                       value={loginForm.email}
                       onChange={handleLoginFormChange('email')}
                       margin="normal"
                       InputProps={{
                         startAdornment: <Email sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                       }}
                       disabled={loading}
                       sx={{
                         '& .MuiInputLabel-root': {
                           color: 'rgba(255, 255, 255, 0.7)'
                         },
                         '& .MuiInputBase-root': {
                           color: 'white',
                           '& fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.3)'
                           },
                           '&:hover fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.5)'
                           },
                           '&.Mui-focused fieldset': {
                             borderColor: '#667eea'
                           }
                         }
                       }}
                     />
                                         <TextField
                       fullWidth
                       label="Mot de passe"
                       type={showPassword ? 'text' : 'password'}
                       value={loginForm.password}
                       onChange={handleLoginFormChange('password')}
                       margin="normal"
                       InputProps={{
                         startAdornment: <Lock sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
                         endAdornment: (
                           <InputAdornment position="end">
                             <IconButton
                               onClick={() => setShowPassword(!showPassword)}
                               edge="end"
                               disabled={loading}
                               sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                             >
                               {showPassword ? <VisibilityOff /> : <Visibility />}
                             </IconButton>
                           </InputAdornment>
                         )
                       }}
                       disabled={loading}
                       sx={{
                         '& .MuiInputLabel-root': {
                           color: 'rgba(255, 255, 255, 0.7)'
                         },
                         '& .MuiInputBase-root': {
                           color: 'white',
                           '& fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.3)'
                           },
                           '&:hover fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.5)'
                           },
                           '&.Mui-focused fieldset': {
                             borderColor: '#667eea'
                           }
                         }
                       }}
                     />
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{ 
                        mt: 3, 
                        mb: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
                    </Button>
                  </form>

                  <Divider sx={{ 
                    my: 3,
                    '& .MuiDivider-wrapper': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '&::before, &::after': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      ou
                    </Typography>
                  </Divider>

                  {/* Connexion Google - Adaptatif selon la plateforme */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {isMobile || isCapacitor ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Google />}
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        sx={{
                          py: 1.5,
                          borderColor: '#4285f4',
                          color: '#4285f4',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            borderColor: '#3367d6',
                            backgroundColor: 'rgba(255, 255, 255, 0.15)'
                          },
                          '&:disabled': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }
                        }}
                      >
                        {isCapacitor ? 'Se connecter avec Google' : 'Continuer avec Google'}
                      </Button>
                    ) : (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        disabled={loading}
                      />
                    )}
                  </Box>
                </Box>
              </Fade>
            )}

            {activeTab === 1 && (
              <Fade in timeout={300}>
                <Box>
                  {/* Inscription par email */}
                  <form onSubmit={handleEmailRegister}>
                                         <TextField
                       fullWidth
                       label="Nom complet"
                       value={registerForm.name}
                       onChange={handleRegisterFormChange('name')}
                       margin="normal"
                       InputProps={{
                         startAdornment: <Person sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                       }}
                       disabled={loading}
                       sx={{
                         '& .MuiInputLabel-root': {
                           color: 'rgba(255, 255, 255, 0.7)'
                         },
                         '& .MuiInputBase-root': {
                           color: 'white',
                           '& fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.3)'
                           },
                           '&:hover fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.5)'
                           },
                           '&.Mui-focused fieldset': {
                             borderColor: '#667eea'
                           }
                         }
                       }}
                     />
                                         <TextField
                       fullWidth
                       label="Adresse email"
                       type="email"
                       value={registerForm.email}
                       onChange={handleRegisterFormChange('email')}
                       margin="normal"
                       InputProps={{
                         startAdornment: <Email sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                       }}
                       disabled={loading}
                       sx={{
                         '& .MuiInputLabel-root': {
                           color: 'rgba(255, 255, 255, 0.7)'
                         },
                         '& .MuiInputBase-root': {
                           color: 'white',
                           '& fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.3)'
                           },
                           '&:hover fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.5)'
                           },
                           '&.Mui-focused fieldset': {
                             borderColor: '#667eea'
                           }
                         }
                       }}
                     />
                                         <TextField
                       fullWidth
                       label="Mot de passe"
                       type={showPassword ? 'text' : 'password'}
                       value={registerForm.password}
                       onChange={handleRegisterFormChange('password')}
                       margin="normal"
                       InputProps={{
                         startAdornment: <Lock sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
                         endAdornment: (
                           <InputAdornment position="end">
                             <IconButton
                               onClick={() => setShowPassword(!showPassword)}
                               edge="end"
                               disabled={loading}
                               sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                             >
                               {showPassword ? <VisibilityOff /> : <Visibility />}
                             </IconButton>
                           </InputAdornment>
                         )
                       }}
                       disabled={loading}
                       sx={{
                         '& .MuiInputLabel-root': {
                           color: 'rgba(255, 255, 255, 0.7)'
                         },
                         '& .MuiInputBase-root': {
                           color: 'white',
                           '& fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.3)'
                           },
                           '&:hover fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.5)'
                           },
                           '&.Mui-focused fieldset': {
                             borderColor: '#667eea'
                           }
                         }
                       }}
                     />
                                         <TextField
                       fullWidth
                       label="Confirmer le mot de passe"
                       type={showConfirmPassword ? 'text' : 'password'}
                       value={registerForm.confirmPassword}
                       onChange={handleRegisterFormChange('confirmPassword')}
                       margin="normal"
                       InputProps={{
                         startAdornment: <Lock sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
                         endAdornment: (
                           <InputAdornment position="end">
                             <IconButton
                               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                               edge="end"
                               disabled={loading}
                               sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                             >
                               {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                             </IconButton>
                           </InputAdornment>
                         )
                       }}
                       disabled={loading}
                       sx={{
                         '& .MuiInputLabel-root': {
                           color: 'rgba(255, 255, 255, 0.7)'
                         },
                         '& .MuiInputBase-root': {
                           color: 'white',
                           '& fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.3)'
                           },
                           '&:hover fieldset': {
                             borderColor: 'rgba(255, 255, 255, 0.5)'
                           },
                           '&.Mui-focused fieldset': {
                             borderColor: '#667eea'
                           }
                         }
                       }}
                     />
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{ 
                        mt: 3, 
                        mb: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Créer un compte'}
                    </Button>
                  </form>

                  <Divider sx={{ 
                    my: 3,
                    '& .MuiDivider-wrapper': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '&::before, &::after': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      ou
                    </Typography>
                  </Divider>

                  {/* Inscription Google - Adaptatif selon la plateforme */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {isMobile || isCapacitor ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Google />}
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        sx={{
                          py: 1.5,
                          borderColor: '#4285f4',
                          color: '#4285f4',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            borderColor: '#3367d6',
                            backgroundColor: 'rgba(255, 255, 255, 0.15)'
                          },
                          '&:disabled': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }
                        }}
                      >
                        {isCapacitor ? 'S\'inscrire avec Google' : 'Continuer avec Google'}
                      </Button>
                    ) : (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        disabled={loading}
                      />
                    )}
                  </Box>
                </Box>
              </Fade>
            )}

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                En continuant, vous acceptez nos conditions d'utilisation
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 1 }}>
                © 2025 XimaMDev - BudgetGestion
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login; 