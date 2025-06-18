import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Chip,
  IconButton,
  Fade,
  Zoom,
  Slide,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
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
  ArrowForward,
  ArrowBack,
  Close,
  PlayArrow,
  Pause,
  SkipNext,
  Help,
  Star,
  Lightbulb,
  School,
  TouchApp
} from '@mui/icons-material';
import { useStore } from '../store';

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Bienvenue dans votre tutoriel !',
    subtitle: 'Découvrez Budget Gestion en quelques minutes',
    description: 'Ce tutoriel interactif vous guidera à travers les principales fonctionnalités de l\'application. Vous pouvez le reprendre à tout moment depuis les paramètres.',
    icon: <School sx={{ fontSize: 40 }} />,
    color: '#1976d2',
    action: 'Commencer',
    features: [
      'Navigation intuitive',
      'Fonctionnalités principales',
      'Astuces et conseils'
    ]
  },
  {
    id: 'home',
    title: 'Page d\'accueil',
    subtitle: 'Votre tableau de bord personnel',
    description: 'La page d\'accueil vous donne une vue d\'ensemble de vos finances : revenus, dépenses, économies et objectifs. Les KPIs sont mis à jour en temps réel.',
    icon: <Home sx={{ fontSize: 40 }} />,
    color: '#2e7d32',
    action: 'Explorer',
    features: [
      'KPIs en temps réel',
      'Transactions récentes',
      'Vue d\'ensemble rapide'
    ],
    target: '.home-page',
    position: 'bottom'
  },
  {
    id: 'quick-add',
    title: 'Ajout rapide',
    subtitle: 'Enregistrez vos transactions en un clic',
    description: 'Utilisez le bouton "+" flottant pour ajouter rapidement une dépense ou un revenu. L\'application vous guide pour catégoriser automatiquement vos transactions.',
    icon: <Add sx={{ fontSize: 40 }} />,
    color: '#ed6c02',
    action: 'Essayer',
    features: [
      'Ajout en un clic',
      'Catégorisation automatique',
      'Interface intuitive'
    ],
    target: '.fab-add',
    position: 'top'
  },
  {
    id: 'expenses',
    title: 'Gestion des dépenses',
    subtitle: 'Suivez et analysez vos dépenses',
    description: 'La page Dépenses vous permet d\'enregistrer, modifier et analyser toutes vos dépenses. Créez des catégories personnalisées et suivez vos budgets.',
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    color: '#d32f2f',
    action: 'Découvrir',
    features: [
      'Catégories personnalisées',
      'Historique détaillé',
      'Graphiques interactifs'
    ],
    target: '.expenses-page',
    position: 'left'
  },
  {
    id: 'income',
    title: 'Gestion des revenus',
    subtitle: 'Suivez vos sources de revenus',
    description: 'Enregistrez tous vos revenus : salaire, freelance, investissements, etc. Analysez l\'évolution de vos revenus dans le temps.',
    icon: <AccountBalance sx={{ fontSize: 40 }} />,
    color: '#388e3c',
    action: 'Explorer',
    features: [
      'Sources multiples',
      'Évolution temporelle',
      'Analyse détaillée'
    ],
    target: '.income-page',
    position: 'right'
  },
  {
    id: 'savings',
    title: 'Objectifs d\'épargne',
    subtitle: 'Atteignez vos objectifs financiers',
    description: 'Définissez des objectifs d\'épargne personnalisés et suivez vos progrès. L\'application vous aide à rester motivé avec des graphiques et des alertes.',
    icon: <Savings sx={{ fontSize: 40 }} />,
    color: '#7b1fa2',
    action: 'Créer',
    features: [
      'Objectifs personnalisés',
      'Suivi des progrès',
      'Motivation continue'
    ],
    target: '.savings-page',
    position: 'bottom'
  },
  {
    id: 'analytics',
    title: 'Analytics avancés',
    subtitle: 'Analysez vos habitudes financières',
    description: 'Découvrez des insights précieux sur vos habitudes de consommation avec des graphiques interactifs et des rapports détaillés.',
    icon: <Analytics sx={{ fontSize: 40 }} />,
    color: '#1976d2',
    action: 'Analyser',
    features: [
      'Graphiques interactifs',
      'Rapports détaillés',
      'Insights personnalisés'
    ],
    target: '.analytics-page',
    position: 'top'
  },
  {
    id: 'settings',
    title: 'Paramètres et personnalisation',
    subtitle: 'Adaptez l\'application à vos besoins',
    description: 'Personnalisez l\'application selon vos préférences : thème, notifications, comptes multiples, export de données, etc.',
    icon: <Settings sx={{ fontSize: 40 }} />,
    color: '#5d4037',
    action: 'Personnaliser',
    features: [
      'Comptes multiples',
      'Thèmes personnalisés',
      'Export/Import de données'
    ],
    target: '.settings-page',
    position: 'left'
  },
  {
    id: 'complete',
    title: 'Tutoriel terminé !',
    subtitle: 'Vous êtes prêt à utiliser Budget Gestion',
    description: 'Félicitations ! Vous connaissez maintenant les principales fonctionnalités de l\'application. N\'hésitez pas à explorer et à personnaliser selon vos besoins.',
    icon: <CheckCircle sx={{ fontSize: 40 }} />,
    color: '#2e7d32',
    action: 'Commencer',
    features: [
      'Toutes les fonctionnalités débloquées',
      'Support disponible',
      'Mises à jour régulières'
    ]
  }
];

const Tutorial = ({ open, onClose, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const { setTutorialCompleted } = useStore();

  const currentStep = tutorialSteps[activeStep];
  const isLast = activeStep === tutorialSteps.length - 1;

  useEffect(() => {
    if (open && currentStep.target) {
      highlightElement(currentStep.target);
    }
  }, [activeStep, open]);

  const highlightElement = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      setHighlightedElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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

  const handleStepClick = (stepIndex) => {
    setActiveStep(stepIndex);
  };

  return (
    <>
      {/* Overlay pour mettre en évidence les éléments */}
      {showOverlay && highlightedElement && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.7)',
            zIndex: 1300,
            pointerEvents: 'none'
          }}
        />
      )}

      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: `linear-gradient(135deg, ${currentStep.color}05 0%, ${currentStep.color}10 100%)`,
            border: `1px solid ${currentStep.color}20`
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: currentStep.color }}>
                {currentStep.icon}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {currentStep.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentStep.subtitle}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {/* Progress Bar */}
          <LinearProgress 
            variant="determinate" 
            value={((activeStep + 1) / tutorialSteps.length) * 100} 
            sx={{ 
              height: 4, 
              mb: 3,
              bgcolor: `${currentStep.color}20`,
              '& .MuiLinearProgress-bar': { 
                bgcolor: currentStep.color 
              }
            }} 
          />

          {/* Stepper */}
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
            {tutorialSteps.map((step, index) => (
              <Step key={step.id} completed={index < activeStep}>
                <StepLabel
                  onClick={() => handleStepClick(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: index === activeStep ? 'bold' : 'normal' }}>
                      {step.title}
                    </Typography>
                    {index < activeStep && <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />}
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Description */}
          <Fade in timeout={300}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2 }}>
                {currentStep.description}
              </Typography>
              
              {/* Features */}
              <Grid container spacing={1}>
                {currentStep.features.map((feature, index) => (
                  <Grid item xs={12} key={index}>
                    <Card sx={{ 
                      bgcolor: 'background.paper',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      border: `1px solid ${currentStep.color}20`
                    }}>
                      <CardContent sx={{ py: 1, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircle sx={{ color: currentStep.color, mr: 1, fontSize: 16 }} />
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

          {/* Tips */}
          <Paper sx={{ p: 2, bgcolor: `${currentStep.color}10`, border: `1px solid ${currentStep.color}30` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Lightbulb sx={{ color: currentStep.color, fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: currentStep.color }}>
                Astuce
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {activeStep === 0 && "Vous pouvez reprendre ce tutoriel à tout moment depuis les paramètres."}
              {activeStep === 1 && "Utilisez les filtres pour voir vos données par période ou par catégorie."}
              {activeStep === 2 && "L'application mémorise vos dernières catégories pour un ajout plus rapide."}
              {activeStep === 3 && "Créez des catégories personnalisées pour mieux organiser vos dépenses."}
              {activeStep === 4 && "Enregistrez vos revenus récurrents pour un suivi automatique."}
              {activeStep === 5 && "Définissez des objectifs réalistes pour rester motivé."}
              {activeStep === 6 && "Consultez régulièrement vos analytics pour optimiser votre budget."}
              {activeStep === 7 && "Configurez plusieurs comptes pour séparer vos finances personnelles et professionnelles."}
              {activeStep === 8 && "N'hésitez pas à explorer toutes les fonctionnalités pour tirer le meilleur parti de l'application !"}
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
              sx={{ 
                borderColor: currentStep.color,
                color: currentStep.color
              }}
            >
              Précédent
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="text"
                onClick={handleSkip}
                sx={{ color: 'text.secondary' }}
              >
                Passer
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={isLast ? <CheckCircle /> : <ArrowForward />}
                sx={{ 
                  bgcolor: currentStep.color,
                  px: 3,
                  '&:hover': { bgcolor: currentStep.color }
                }}
              >
                {isLast ? 'Terminer' : currentStep.action}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Tutorial; 