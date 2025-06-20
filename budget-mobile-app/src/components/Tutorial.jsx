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

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Bienvenue dans votre tutoriel !',
    subtitle: 'Découvrez Budget Gestion en quelques minutes',
    description: 'Ce tutoriel interactif vous guidera à travers les principales fonctionnalités de l\'application. Cliquez sur "Suivant" pour commencer.',
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
    id: 'home-overview',
    title: 'Page d\'accueil',
    subtitle: 'Votre tableau de bord personnel',
    description: 'Voici votre page d\'accueil avec tous vos KPIs financiers. Vous pouvez voir vos revenus, dépenses, économies et objectifs en un coup d\'œil.',
    icon: <Home sx={{ fontSize: 40 }} />,
    color: '#2e7d32',
    action: 'Explorer',
    features: [
      'KPIs en temps réel',
      'Vue d\'ensemble rapide',
      'Navigation principale'
    ]
  },
  {
    id: 'quick-add-button',
    title: 'Ajout rapide',
    subtitle: 'Enregistrez vos transactions en un clic',
    description: 'Le bouton "+" flottant vous permet d\'ajouter rapidement une dépense ou un revenu. C\'est votre raccourci principal pour enregistrer vos transactions.',
    icon: <Add sx={{ fontSize: 40 }} />,
    color: '#ed6c02',
    action: 'Essayer',
    features: [
      'Ajout en un clic',
      'Interface intuitive',
      'Catégorisation automatique'
    ]
  },
  {
    id: 'navigation',
    title: 'Navigation principale',
    subtitle: 'Accédez à toutes les fonctionnalités',
    description: 'La barre de navigation en bas vous permet d\'accéder rapidement à toutes les sections de l\'application.',
    icon: <TouchApp sx={{ fontSize: 40 }} />,
    color: '#d32f2f',
    action: 'Naviguer',
    features: [
      'Accueil - Vue d\'ensemble',
      'Analytics - Graphiques et analyses',
      'Plans d\'actions - Objectifs et suivi',
      'Épargne - Objectifs financiers',
      'Paramètres - Configuration'
    ]
  },
  {
    id: 'analytics-page',
    title: 'Analytics avancés',
    subtitle: 'Analysez vos habitudes financières',
    description: 'La page Analytics vous donne des insights précieux sur vos finances avec des graphiques interactifs et des rapports détaillés.',
    icon: <Analytics sx={{ fontSize: 40 }} />,
    color: '#1976d2',
    action: 'Analyser',
    features: [
      'Graphiques interactifs',
      'Rapports détaillés',
      'Insights personnalisés'
    ]
  },
  {
    id: 'expenses-page',
    title: 'Gestion des dépenses',
    subtitle: 'Suivez et analysez vos dépenses',
    description: 'La page Dépenses vous permet d\'enregistrer, modifier et analyser toutes vos dépenses. Créez des catégories personnalisées.',
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    color: '#d32f2f',
    action: 'Découvrir',
    features: [
      'Catégories personnalisées',
      'Historique détaillé',
      'Graphiques interactifs'
    ]
  },
  {
    id: 'income-page',
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
    ]
  },
  {
    id: 'savings-page',
    title: 'Objectifs d\'épargne',
    subtitle: 'Atteignez vos objectifs financiers',
    description: 'Définissez des objectifs d\'épargne personnalisés et suivez vos progrès. L\'application vous aide à rester motivé.',
    icon: <Savings sx={{ fontSize: 40 }} />,
    color: '#7b1fa2',
    action: 'Créer',
    features: [
      'Objectifs personnalisés',
      'Suivi des progrès',
      'Motivation continue'
    ]
  },
  {
    id: 'settings-page',
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
    ]
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
  const { setTutorialCompleted } = useStore();

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
      "Vous pouvez reprendre ce tutoriel à tout moment depuis les paramètres.",
      "Utilisez les filtres pour voir vos données par période ou par catégorie.",
      "L'application mémorise vos dernières catégories pour un ajout plus rapide.",
      "La navigation est intuitive - explorez chaque section pour découvrir toutes les fonctionnalités.",
      "Les graphiques sont interactifs - cliquez dessus pour plus de détails.",
      "Créez des catégories personnalisées pour mieux organiser vos dépenses.",
      "Enregistrez vos revenus récurrents pour un suivi automatique.",
      "Définissez des objectifs réalistes pour rester motivé.",
      "Configurez plusieurs comptes pour séparer vos finances personnelles et professionnelles.",
      "N'hésitez pas à explorer toutes les fonctionnalités pour tirer le meilleur parti de l'application !"
    ];
    return tips[stepIndex] || "Explorez l'application pour découvrir toutes les fonctionnalités !";
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
            label={`Étape ${activeStep + 1} sur ${tutorialSteps.length}`}
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
              Astuce
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
            Précédent
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="text"
              onClick={handleSkip}
              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
            >
              Passer
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
              {isLast ? 'Terminer' : currentStep.action}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default Tutorial; 