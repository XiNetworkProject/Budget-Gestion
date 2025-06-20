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
      background: `linear-gradient(135deg, ${currentStep.color}15 0%, ${currentStep.color}05 100%)`,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header avec Skip */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary" component="span">
          {t('appName')}
        </Typography>
        <Button 
          variant="text" 
          onClick={skip}
          sx={{ color: 'text.secondary' }}
        >
          {t('onboarding.skip')}
        </Button>
      </Box>

      {/* Progress Bar */}
      <LinearProgress 
        variant="determinate" 
        value={((step + 1) / steps.length) * 100} 
        sx={{ 
          height: 4, 
          bgcolor: `${currentStep.color}20`,
          '& .MuiLinearProgress-bar': { 
            bgcolor: currentStep.color 
          }
        }} 
      />

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
        {/* Icon and Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Zoom in timeout={600}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 3,
                bgcolor: currentStep.color,
                boxShadow: `0 8px 32px ${currentStep.color}40`
              }}
            >
              {currentStep.icon}
            </Avatar>
          </Zoom>
          
          <Fade in timeout={800}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                {currentStep.title}
              </Typography>
              <Typography variant="h6" sx={{ color: currentStep.color, mb: 2, fontWeight: 500 }}>
                {currentStep.subtitle}
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Description */}
        <Slide direction="up" in timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', lineHeight: 1.6 }}>
              {currentStep.description}
            </Typography>
          </Box>
        </Slide>

        {/* Features */}
        <Fade in timeout={1200}>
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              {currentStep.features.map((feature, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ 
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: `1px solid ${currentStep.color}20`
                  }}>
                    <CardContent sx={{ py: 2, px: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ color: currentStep.color, mr: 2, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
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

        {/* Navigation */}
        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={prev}
            disabled={step === 0}
            startIcon={<ArrowBack />}
            sx={{ 
              borderColor: currentStep.color,
              color: currentStep.color,
              '&:hover': { borderColor: currentStep.color }
            }}
          >
            {t('onboarding.previous')}
          </Button>

          {/* Step Indicators */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {steps.map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: idx === step ? currentStep.color : 'grey.300',
                  transition: 'all 0.3s ease'
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
              bgcolor: currentStep.color,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              boxShadow: `0 4px 16px ${currentStep.color}40`,
              '&:hover': { 
                bgcolor: currentStep.color,
                boxShadow: `0 6px 20px ${currentStep.color}60`
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

      {/* Bottom Info */}
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
          <Star sx={{ color: '#ffc107', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary" component="span">
            {t('onboarding.satisfaction')}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" component="span">
          {t('onboarding.dataSecurity')}
        </Typography>
      </Box>
    </Box>
  );
};

export default Onboarding; 