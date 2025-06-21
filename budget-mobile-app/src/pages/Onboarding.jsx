import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Fade,
  Zoom,
  Slide,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  Savings,
  Analytics,
  Notifications,
  Security,
  CloudSync,
  CheckCircle,
  ArrowForward,
  ArrowBack,
  PlayArrow,
  Star,
  AccountBalance,
  Timeline,
  Assessment,
  Settings
} from '@mui/icons-material';
import { useStore } from '../store';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setOnboardingCompleted } = useStore();
  const { t } = useTranslation();

const steps = [
  {
      title: t('onboarding.welcome'),
      subtitle: t('onboarding.welcomeSubtitle'),
      description: t('onboarding.welcomeDescription'),
    icon: <TrendingUp sx={{ fontSize: 60 }} />,
    color: '#1976d2',
      features: t('onboarding.welcomeFeatures')
  },
  {
      title: t('onboarding.trackFinances'),
      subtitle: t('onboarding.trackFinancesSubtitle'),
      description: t('onboarding.trackFinancesDescription'),
    icon: <Analytics sx={{ fontSize: 60 }} />,
    color: '#2e7d32',
      features: t('onboarding.trackFinancesFeatures')
  },
  {
      title: t('onboarding.reachGoals'),
      subtitle: t('onboarding.reachGoalsSubtitle'),
      description: t('onboarding.reachGoalsDescription'),
    icon: <Savings sx={{ fontSize: 60 }} />,
    color: '#ed6c02',
      features: t('onboarding.reachGoalsFeatures')
  },
  {
      title: t('onboarding.readyToStart'),
      subtitle: t('onboarding.readyToStartSubtitle'),
      description: t('onboarding.readyToStartDescription'),
    icon: <CheckCircle sx={{ fontSize: 60 }} />,
    color: '#9c27b0',
      features: t('onboarding.readyToStartFeatures')
    }
  ];

  const isLast = step === steps.length - 1;

  const next = async () => {
    if (isLast) {
      setLoading(true);
      // Marquer l'onboarding comme terminé
      setOnboardingCompleted(true);
      // Simuler un délai de chargement
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1000);
    } else {
      setStep(s => s + 1);
    }
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const skip = () => {
    // Marquer l'onboarding comme terminé même si on le saute
    setOnboardingCompleted(true);
    navigate('/home', { replace: true });
  };

  const currentStep = steps[step];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Particules animées */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '@keyframes float': {
                '0%': {
                  transform: 'translateY(0px) rotate(0deg)',
                  opacity: 0
                },
                '10%': {
                  opacity: 1
                },
                '90%': {
                  opacity: 1
                },
                '100%': {
                  transform: 'translateY(-100vh) rotate(360deg)',
                  opacity: 0
                }
              }
            }}
          />
        ))}
      </Box>

      {/* Header avec Skip glassmorphism */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <Typography variant="h6" sx={{ 
          color: 'white',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }} component="span">
          {t('appName')}
        </Typography>
        <Button 
          variant="text" 
          onClick={skip}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          {t('onboarding.skip')}
        </Button>
      </Box>

      {/* Progress Bar glassmorphism */}
      <LinearProgress 
        variant="determinate" 
        value={((step + 1) / steps.length) * 100} 
        sx={{ 
          height: 4, 
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          '& .MuiLinearProgress-bar': { 
            background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
            borderRadius: 2
          }
        }} 
      />

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        py: 4,
        position: 'relative',
        zIndex: 1
      }}>
        {/* Icon and Title glassmorphism */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Zoom in timeout={600}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 3,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                color: 'white'
              }}
            >
              {currentStep.icon}
            </Avatar>
          </Zoom>
          
          <Fade in timeout={800}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                mb: 1, 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {currentStep.title}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                mb: 2, 
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {currentStep.subtitle}
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Description glassmorphism */}
        <Slide direction="up" in timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ 
              textAlign: 'center', 
              color: 'rgba(255, 255, 255, 0.8)', 
              lineHeight: 1.6,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              {currentStep.description}
            </Typography>
          </Box>
        </Slide>

        {/* Features glassmorphism */}
        <Fade in timeout={1200}>
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              {currentStep.features.map((feature, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    <CardContent sx={{ py: 2, px: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ 
                          color: '#4caf50', 
                          mr: 2, 
                          fontSize: 20,
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                        }} />
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500,
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {feature}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Navigation glassmorphism */}
        <Box sx={{ 
          mt: 'auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          p: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Button
            variant="outlined"
            onClick={prev}
            disabled={step === 0}
            startIcon={<ArrowBack />}
            sx={{ 
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': { 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.1)'
              },
              '&.Mui-disabled': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            {t('onboarding.previous')}
          </Button>

          {/* Step Indicators glassmorphism */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {steps.map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: idx === step ? '#4caf50' : 'rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  boxShadow: idx === step ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none'
                }}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={next}
            disabled={loading}
            endIcon={isLast ? <PlayArrow /> : <ArrowForward />}
            sx={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)',
                boxShadow: '0 12px 40px rgba(76, 175, 80, 0.4)'
              },
              '&.Mui-disabled': {
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {t('onboarding.configuring')}...
                </Typography>
                <LinearProgress sx={{ width: 20, height: 2 }} />
              </Box>
            ) : (
              isLast ? t('onboarding.start') : t('onboarding.next')
            )}
          </Button>
        </Box>
      </Container>

      {/* Bottom Info glassmorphism */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
          <Star sx={{ color: '#ffc107', fontSize: 20, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }} component="span">
            {t('onboarding.satisfaction')}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ 
          color: 'rgba(255, 255, 255, 0.6)',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }} component="span">
          {t('onboarding.dataSecurity')}
        </Typography>
      </Box>
    </Box>
  );
};

export default Onboarding; 