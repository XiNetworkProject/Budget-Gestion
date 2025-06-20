import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Avatar,
  IconButton,
  Fade,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import {
  Home,
  TrendingUp,
  AccountBalance,
  Savings,
  Settings,
  Analytics,
  Add,
  CheckCircle,
  Close,
  NavigateNext,
  NavigateBefore,
  Lightbulb,
  School,
  TouchApp
} from '@mui/icons-material';
import { useStore } from '../store';

const Tutorial = ({ open, onClose, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const { setTutorialCompleted } = useStore();
  const { t } = useTranslation();

  const tutorialSteps = [
    {
      id: 'welcome',
      title: t('tutorial.welcome.title'),
      subtitle: t('tutorial.welcome.subtitle'),
      description: t('tutorial.welcome.description'),
      icon: <School sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      action: t('tutorial.welcome.action'),
      features: t('tutorial.welcome.features')
    },
    {
      id: 'home-overview',
      title: t('tutorial.homeOverview.title'),
      subtitle: t('tutorial.homeOverview.subtitle'),
      description: t('tutorial.homeOverview.description'),
      icon: <Home sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      action: t('tutorial.homeOverview.action'),
      features: t('tutorial.homeOverview.features')
    },
    {
      id: 'quick-add-button',
      title: t('tutorial.quickAddButton.title'),
      subtitle: t('tutorial.quickAddButton.subtitle'),
      description: t('tutorial.quickAddButton.description'),
      icon: <Add sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      action: t('tutorial.quickAddButton.action'),
      features: t('tutorial.quickAddButton.features')
    },
    {
      id: 'navigation',
      title: t('tutorial.navigation.title'),
      subtitle: t('tutorial.navigation.subtitle'),
      description: t('tutorial.navigation.description'),
      icon: <TouchApp sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      action: t('tutorial.navigation.action'),
      features: t('tutorial.navigation.features')
    },
    {
      id: 'analytics-page',
      title: t('tutorial.analyticsPage.title'),
      subtitle: t('tutorial.analyticsPage.subtitle'),
      description: t('tutorial.analyticsPage.description'),
      icon: <Analytics sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      action: t('tutorial.analyticsPage.action'),
      features: t('tutorial.analyticsPage.features')
    },
    {
      id: 'expenses-page',
      title: t('tutorial.expensesPage.title'),
      subtitle: t('tutorial.expensesPage.subtitle'),
      description: t('tutorial.expensesPage.description'),
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      action: t('tutorial.expensesPage.action'),
      features: t('tutorial.expensesPage.features')
    },
    {
      id: 'income-page',
      title: t('tutorial.incomePage.title'),
      subtitle: t('tutorial.incomePage.subtitle'),
      description: t('tutorial.incomePage.description'),
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      action: t('tutorial.incomePage.action'),
      features: t('tutorial.incomePage.features')
    },
    {
      id: 'savings-page',
      title: t('tutorial.savingsPage.title'),
      subtitle: t('tutorial.savingsPage.subtitle'),
      description: t('tutorial.savingsPage.description'),
      icon: <Savings sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      action: t('tutorial.savingsPage.action'),
      features: t('tutorial.savingsPage.features')
    },
    {
      id: 'settings-page',
      title: t('tutorial.settingsPage.title'),
      subtitle: t('tutorial.settingsPage.subtitle'),
      description: t('tutorial.settingsPage.description'),
      icon: <Settings sx={{ fontSize: 40 }} />,
      color: '#5d4037',
      action: t('tutorial.settingsPage.action'),
      features: t('tutorial.settingsPage.features')
    },
    {
      id: 'complete',
      title: t('tutorial.complete.title'),
      subtitle: t('tutorial.complete.subtitle'),
      description: t('tutorial.complete.description'),
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      action: t('tutorial.complete.action'),
      features: t('tutorial.complete.features')
    }
  ];

  const currentStep = tutorialSteps[activeStep];
  const isLast = activeStep === tutorialSteps.length - 1;

  // Reset step when tutorial opens
  useEffect(() => {
    if (open) {
      setActiveStep(0);
    }
  }, [open]);

  const handleNext = () => {
    if (isLast) {
      completeTutorial();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSkip = () => {
    completeTutorial();
  };

  const completeTutorial = () => {
    setTutorialCompleted(true);
    onComplete?.();
    onClose();
  };

  const getTipText = (stepIndex) => {
    const tips = [
      t('tutorial.tips.restart'),
      t('tutorial.tips.filters'),
      t('tutorial.tips.categories'),
      t('tutorial.tips.navigation'),
      t('tutorial.tips.charts'),
      t('tutorial.tips.customCategories'),
      t('tutorial.tips.recurringIncome'),
      t('tutorial.tips.goals'),
      t('tutorial.tips.multipleAccounts'),
      t('tutorial.tips.explore')
    ];
    return tips[stepIndex] || t('tutorial.tips.default');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, ${currentStep.color}05 0%, ${currentStep.color}10 100%)`,
          border: `2px solid ${currentStep.color}30`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, bgcolor: `${currentStep.color}20` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: currentStep.color, width: 50, height: 50 }}>
              {currentStep.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {currentStep.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentStep.subtitle}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, bgcolor: 'background.paper' }}>
        {/* Progress Bar */}
        <LinearProgress 
          variant="determinate" 
          value={((activeStep + 1) / tutorialSteps.length) * 100} 
          sx={{ 
            height: 6, 
            mb: 3,
            bgcolor: `${currentStep.color}20`,
            borderRadius: 3,
            '& .MuiLinearProgress-bar': { 
              bgcolor: currentStep.color,
              borderRadius: 3
            }
          }} 
        />

        {/* Step indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Chip 
            label={t('tutorial.stepIndicator', { current: activeStep + 1, total: tutorialSteps.length })}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        {/* Description */}
        <Fade in timeout={300}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2, color: 'text.primary', fontSize: '1.1rem' }}>
              {currentStep.description}
            </Typography>
            
            {/* Features */}
            <Grid container spacing={1}>
              {currentStep.features.map((feature, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ 
                    bgcolor: `${currentStep.color}10`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: `1px solid ${currentStep.color}30`
                  }}>
                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ color: currentStep.color, mr: 1.5, fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
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

        {/* Tips */}
        <Paper sx={{ p: 2, bgcolor: `${currentStep.color}15`, border: `2px solid ${currentStep.color}40` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Lightbulb sx={{ color: currentStep.color, fontSize: 22 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: currentStep.color }}>
              {t('tutorial.tip')}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
            {getTipText(activeStep)}
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<NavigateBefore />}
            sx={{ 
              borderColor: currentStep.color,
              color: currentStep.color,
              fontWeight: 'bold',
              px: 3
            }}
          >
            {t('tutorial.previous')}
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="text"
              onClick={handleSkip}
              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
            >
              {t('tutorial.skip')}
            </Button>
            
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={isLast ? <CheckCircle /> : <NavigateNext />}
              sx={{ 
                bgcolor: currentStep.color,
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: `0 4px 16px ${currentStep.color}40`,
                '&:hover': { 
                  bgcolor: currentStep.color,
                  boxShadow: `0 6px 20px ${currentStep.color}60`
                }
              }}
            >
              {isLast ? t('tutorial.finish') : currentStep.action}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default Tutorial; 