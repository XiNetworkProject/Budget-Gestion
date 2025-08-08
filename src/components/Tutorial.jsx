import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Slide
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
  TouchApp,
  Receipt,
  Dashboard,
  Schedule,
  Psychology,
  Notifications,
  Category,
  Payment,
  TrendingDown,
  AccountBalanceWallet,
  AutoAwesome,
  Speed,
  Shield,
  Palette,
  Timeline,
  Assessment,
  Star
} from '@mui/icons-material';
import { useStore } from '../store';

const Tutorial = ({ open, onClose, onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const { setTutorialCompleted } = useStore();
  const { t } = useTranslation();

  const tutorialSteps = [
    {
      id: 'welcome',
      title: "Bienvenue dans le tutoriel",
      subtitle: "Découvrez toutes les fonctionnalités",
      description: "Ce tutoriel vous guidera à travers toutes les fonctionnalités de BudgetGestion. Prenez votre temps pour explorer chaque section.",
      icon: <School sx={{ fontSize: 50 }} />,
      color: '#667eea',
      action: "Commencer l'exploration",
      features: [
        "Interface moderne et intuitive",
        "Fonctionnalités avancées",
        "Conseils personnalisés",
        "Navigation simplifiée"
      ]
    },
    {
      id: 'home-overview',
      title: "Tableau de bord principal",
      subtitle: "Vue d'ensemble de vos finances",
      description: "Votre page d'accueil affiche tous vos KPIs financiers en temps réel, avec des graphiques interactifs et des recommandations IA.",
      icon: <Dashboard sx={{ fontSize: 50 }} />,
      color: '#ff9800',
      action: "Explorer le dashboard",
      features: [
        "KPIs financiers en temps réel",
        "Graphiques interactifs animés",
        "Recommandations IA personnalisées",
        "Prévisions intelligentes"
      ]
    },
    {
      id: 'quick-add-button',
      title: "Ajout rapide de transactions",
      subtitle: "Enregistrez vos dépenses et revenus",
      description: "Le bouton flottant + vous permet d'ajouter rapidement des dépenses ou revenus. Interface simplifiée pour un enregistrement en quelques secondes.",
      icon: <Add sx={{ fontSize: 50 }} />,
      color: '#4caf50',
      action: "Tester l'ajout rapide",
      features: [
        "Ajout en un clic",
        "Catégorisation automatique",
        "Interface simplifiée",
        "Validation en temps réel"
      ]
    },
    {
      id: 'expenses-management',
      title: "Gestion des dépenses",
      subtitle: "Suivi détaillé et catégorisation",
      description: "Page dédiée à la gestion de vos dépenses avec catégorisation avancée, gestion des catégories et analyses détaillées.",
      icon: <Receipt sx={{ fontSize: 50 }} />,
      color: '#f44336',
      action: "Gérer les dépenses",
      features: [
        "Catégorisation automatique",
        "Gestion avancée des catégories",
        "Suppression avec options",
        "Analyses par catégorie"
      ]
    },
    {
      id: 'income-management',
      title: "Gestion des revenus",
      subtitle: "Suivi de vos sources de revenus",
      description: "Organisez et analysez vos revenus par type, suivez les tendances et optimisez votre stratégie financière.",
      icon: <TrendingUp sx={{ fontSize: 50 }} />,
      color: '#4caf50',
      action: "Gérer les revenus",
      features: [
        "Types de revenus personnalisables",
        "Analyse des sources",
        "Suivi des tendances",
        "Optimisation des revenus"
      ]
    },
    {
      id: 'analytics-page',
      title: "Analytics avancés",
      subtitle: "Analyses détaillées et insights",
      description: "Explorez vos données financières avec des graphiques interactifs, analyses par période et insights personnalisés.",
      icon: <Analytics sx={{ fontSize: 50 }} />,
      color: '#9c27b0',
      action: "Explorer les analytics",
      features: [
        "Graphiques interactifs",
        "Analyses par période",
        "Insights personnalisés",
        "Rapports détaillés"
      ]
    },
    {
      id: 'recurring-payments',
      title: "Paiements récurrents",
      subtitle: "Gestion des abonnements",
      description: "Suivez vos paiements récurrents, abonnements et factures avec rappels automatiques et gestion intelligente.",
      icon: <Schedule sx={{ fontSize: 50 }} />,
      color: '#2196f3',
      action: "Gérer les paiements",
      features: [
        "Gestion des abonnements",
        "Rappels automatiques",
        "Suivi des paiements",
        "Alertes intelligentes"
      ]
    },
    {
      id: 'action-plans',
      title: "Plans d'actions IA",
      subtitle: "Objectifs personnalisés",
      description: "Créez des plans d'actions personnalisés avec l'aide de l'IA, suivez vos objectifs et recevez des recommandations.",
      icon: <Psychology sx={{ fontSize: 50 }} />,
      color: '#ff5722',
      action: "Créer des plans",
      features: [
        "Plans d'actions IA",
        "Objectifs personnalisés",
        "Suivi des progrès",
        "Recommandations adaptées"
      ]
    },
    {
      id: 'savings-goals',
      title: "Épargne et objectifs",
      subtitle: "Atteignez vos objectifs",
      description: "Définissez des objectifs d'épargne, suivez vos progrès et recevez des conseils pour optimiser votre épargne.",
      icon: <Savings sx={{ fontSize: 50 }} />,
      color: '#00bcd4',
      action: "Définir des objectifs",
      features: [
        "Objectifs d'épargne",
        "Suivi des progrès",
        "Conseils d'optimisation",
        "Alertes d'objectifs"
      ]
    },
    {
      id: 'settings-customization',
      title: "Paramètres et personnalisation",
      subtitle: "Personnalisez votre expérience",
      description: "Configurez l'application selon vos préférences, gérez votre compte et personnalisez l'interface.",
      icon: <Settings sx={{ fontSize: 50 }} />,
      color: '#607d8b',
      action: "Personnaliser",
      features: [
        "Paramètres du compte",
        "Personnalisation de l'interface",
        "Gestion des notifications",
        "Sécurité et confidentialité"
      ]
    },
    {
      id: 'navigation-tips',
      title: "Navigation et astuces",
      subtitle: "Maîtrisez l'interface",
      description: "Découvrez les raccourcis et astuces pour naviguer efficacement dans l'application et optimiser votre utilisation.",
      icon: <TouchApp sx={{ fontSize: 50 }} />,
      color: '#795548',
      action: "Découvrir les astuces",
      features: [
        "Navigation fluide",
        "Raccourcis clavier",
        "Gestes tactiles",
        "Interface responsive"
      ]
    }
  ];

  const handleNext = () => {
    if (activeStep < tutorialSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  const completeTutorial = () => {
    setTutorialCompleted(true);
    if (onComplete) onComplete();
    if (onClose) onClose();
  };

  const getTipText = (stepIndex) => {
    const tips = [
      "💡 Conseil : Utilisez le bouton + pour ajouter rapidement des transactions",
      "💡 Conseil : Explorez les analytics pour mieux comprendre vos finances",
      "💡 Conseil : Configurez vos catégories selon vos besoins",
      "💡 Conseil : Activez les notifications pour ne rien manquer",
      "💡 Conseil : Utilisez les plans d'actions IA pour vos objectifs",
      "💡 Conseil : Personnalisez l'interface selon vos préférences"
    ];
    return tips[stepIndex % tips.length];
  };

  const currentStep = tutorialSteps[activeStep];
  const isLast = activeStep === tutorialSteps.length - 1;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isMobile ? 'sm' : 'md'}
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          minHeight: isMobile ? '70vh' : '80vh'
        }
      }}
    >
      {/* Header avec titre et bouton fermer */}
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}>
            <School />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Tutoriel BudgetGestion
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              Étape {activeStep + 1} sur {tutorialSteps.length}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { 
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Progress Bar */}
      <LinearProgress 
        variant="determinate" 
        value={((activeStep + 1) / tutorialSteps.length) * 100} 
        sx={{ 
          height: 4, 
          background: 'rgba(255, 255, 255, 0.1)',
          '& .MuiLinearProgress-bar': { 
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
          }
        }} 
      />

      <DialogContent sx={{ p: isMobile ? 2 : 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* Icon */}
          <Fade in timeout={600}>
            <Avatar 
              sx={{ 
                width: isMobile ? 80 : 120, 
                height: isMobile ? 80 : 120, 
                mx: 'auto', 
                mb: isMobile ? 2 : 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
                color: 'white'
              }}
            >
              {currentStep.icon}
            </Avatar>
          </Fade>

          {/* Title and Subtitle */}
          <Fade in timeout={800}>
            <Box>
              <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ 
                fontWeight: 'bold', 
                mb: 1, 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {currentStep.title}
              </Typography>
              <Typography variant={isMobile ? 'body2' : 'h6'} sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                mb: isMobile ? 1 : 2, 
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {currentStep.subtitle}
              </Typography>
            </Box>
          </Fade>

          {/* Description */}
          <Slide direction="up" in timeout={1000}>
            <Typography variant={isMobile ? 'body2' : 'body1'} sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              lineHeight: isMobile ? 1.6 : 1.8,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              fontSize: isMobile ? '0.95rem' : '1.1rem',
              mb: isMobile ? 2 : 3
            }}>
              {currentStep.description}
            </Typography>
          </Slide>

          {/* Features Grid */}
          <Fade in timeout={1200}>
            <Grid container spacing={isMobile ? 1.2 : 2} sx={{ mb: isMobile ? 2 : 4 }}>
              {currentStep.features.slice(0, isMobile ? 2 : 3).map((feature, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }
                  }}>
                    <CardContent sx={{ py: isMobile ? 1 : 2, px: isMobile ? 2 : 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ 
                          color: '#4caf50', 
                          mr: 2, 
                          fontSize: isMobile ? 20 : 24,
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                        }} />
                        <Typography variant={isMobile ? 'caption' : 'body2'} sx={{ 
                          fontWeight: 500,
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          fontSize: isMobile ? '0.85rem' : '0.95rem'
                        }}>
                          {feature}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Fade>

          {/* Tip */}
          <Fade in timeout={1400}>
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              p: 2,
              mb: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb sx={{ color: '#ffc107', fontSize: 24 }} />
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontStyle: 'italic',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {getTipText(activeStep)}
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ 
        p: 3, 
        background: 'rgba(255, 255, 255, 0.05)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<NavigateBefore />}
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
          Précédent
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button
          variant="text"
          onClick={handleSkip}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { 
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }
          }}
        >
          Passer
        </Button>

        <Button
          variant="contained"
          onClick={handleNext}
          endIcon={isLast ? <CheckCircle /> : <NavigateNext />}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            px: 4,
            py: 1.5,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          {isLast ? 'Terminer' : 'Suivant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Tutorial; 