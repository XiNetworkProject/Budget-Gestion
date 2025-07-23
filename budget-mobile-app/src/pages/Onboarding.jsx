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
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
  Settings,
  Login,
  Email,
  Google,
  Category,
  Payment,
  Psychology,
  AutoAwesome,
  Dashboard,
  Receipt,
  AccountBalanceWallet,
  TrendingDown,
  Schedule,
  NotificationsActive,
  Palette,
  Speed,
  Shield
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
    title: "Bienvenue sur BudgetGestion",
    subtitle: "Votre assistant financier intelligent",
    description: "Découvrez une application moderne et intuitive pour prendre le contrôle de vos finances. Interface glassmorphism, IA intégrée et fonctionnalités avancées vous attendent.",
    icon: <AccountBalance sx={{ fontSize: 60 }} />,
    color: '#667eea',
    features: [
      "Interface moderne avec design glassmorphism",
      "Thème sombre élégant et cohérent",
      "Particules animées et effets visuels",
      "Navigation fluide et intuitive"
    ]
  },
  {
    title: "Connexion sécurisée",
    subtitle: "Plusieurs options d'authentification",
    description: "Connectez-vous facilement avec Google ou créez un compte par email. Votre session est automatiquement sauvegardée pour une expérience sans friction.",
    icon: <Security sx={{ fontSize: 60 }} />,
    color: '#4caf50',
    features: [
      "Connexion Google en un clic",
      "Inscription par email sécurisée",
      "Connexion automatique activée",
      "Déconnexion dans les paramètres"
    ]
  },
  {
    title: "Tableau de bord intelligent",
    subtitle: "Vue d'ensemble de vos finances",
    description: "Votre page d'accueil personnalisée avec KPIs en temps réel, graphiques interactifs et recommandations IA pour optimiser votre budget.",
    icon: <Dashboard sx={{ fontSize: 60 }} />,
    color: '#ff9800',
    features: [
      "KPIs financiers en temps réel",
      "Graphiques interactifs et animés",
      "Recommandations IA personnalisées",
      "Prévisions intelligentes"
    ]
  },
  {
    title: "Gestion des dépenses",
    subtitle: "Suivi détaillé et catégorisation",
    description: "Enregistrez vos dépenses avec catégorisation automatique, gestion avancée des catégories avec icônes et couleurs personnalisées.",
    icon: <Receipt sx={{ fontSize: 60 }} />,
    color: '#f44336',
    features: [
      "Ajout rapide en un clic",
      "Catégorisation automatique",
      "Gestion avancée des catégories",
      "Suppression avec options"
    ]
  },
  {
    title: "Gestion des revenus",
    subtitle: "Suivi de vos sources de revenus",
    description: "Organisez vos revenus par type, analysez vos sources de revenus et optimisez votre stratégie financière.",
    icon: <TrendingUp sx={{ fontSize: 60 }} />,
    color: '#4caf50',
    features: [
      "Types de revenus personnalisables",
      "Analyse des sources de revenus",
      "Suivi des tendances",
      "Optimisation des revenus"
    ]
  },
  {
    title: "Analytics avancés",
    subtitle: "Analyses détaillées et insights",
    description: "Explorez vos données avec des graphiques interactifs, analyses par catégorie et insights personnalisés pour améliorer vos finances.",
    icon: <Analytics sx={{ fontSize: 60 }} />,
    color: '#9c27b0',
    features: [
      "Graphiques interactifs",
      "Analyses par catégorie",
      "Insights personnalisés",
      "Rapports détaillés"
    ]
  },
  {
    title: "Paiements récurrents",
    subtitle: "Gestion des abonnements et factures",
    description: "Suivez vos paiements récurrents, abonnements et factures avec rappels automatiques et gestion intelligente.",
    icon: <Schedule sx={{ fontSize: 60 }} />,
    color: '#2196f3',
    features: [
      "Gestion des abonnements",
      "Rappels automatiques",
      "Suivi des paiements",
      "Alertes intelligentes"
    ]
  },
  {
    title: "Plans d'actions IA",
    subtitle: "Objectifs personnalisés et suivi",
    description: "Créez des plans d'actions personnalisés avec l'aide de l'IA, suivez vos objectifs et recevez des recommandations adaptées.",
    icon: <Psychology sx={{ fontSize: 60 }} />,
    color: '#ff5722',
    features: [
      "Plans d'actions IA",
      "Objectifs personnalisés",
      "Suivi des progrès",
      "Recommandations adaptées"
    ]
  },
  {
    title: "Épargne et objectifs",
    subtitle: "Atteignez vos objectifs financiers",
    description: "Définissez des objectifs d'épargne, suivez vos progrès et recevez des conseils pour optimiser votre épargne.",
    icon: <Savings sx={{ fontSize: 60 }} />,
    color: '#00bcd4',
    features: [
      "Objectifs d'épargne",
      "Suivi des progrès",
      "Conseils d'optimisation",
      "Alertes d'objectifs"
    ]
  },
  {
    title: "Prêt à commencer ?",
    subtitle: "Votre avenir financier commence ici",
    description: "Toutes les fonctionnalités sont prêtes ! Commencez par explorer votre tableau de bord et découvrez toutes les possibilités de BudgetGestion.",
    icon: <CheckCircle sx={{ fontSize: 60 }} />,
    color: '#4caf50',
    features: [
      "Configuration en 2 minutes",
      "Données sécurisées",
      "Support 24/7",
      "Mises à jour régulières"
    ]
  }
];

  const isLast = step === steps.length - 1;

  const next = async () => {
    if (isLast) {
      setLoading(true);
      // Marquer l'onboarding comme terminé
      setOnboardingCompleted(true);
      
      // Attendre un peu pour que l'état soit mis à jour
      setTimeout(() => {
        console.log('Onboarding: Navigation vers home après completion');
        navigate('/home', { replace: true });
      }, 1500);
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
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      padding: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules animées améliorées */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        {[...Array(30)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 6 + 3,
              height: Math.random() * 6 + 3,
              background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, ${Math.random() * 0.4 + 0.1})`,
              borderRadius: '50%',
              animation: `floatParticle ${Math.random() * 15 + 15}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
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
                  transform: 'translateY(-100px) translateX(100px) rotate(360deg)',
                  opacity: 0
                }
              }
            }}
          />
        ))}
        
        {[...Array(10)].map((_, i) => (
          <Box
            key={`large-${i}`}
            sx={{
              position: 'absolute',
              width: Math.random() * 12 + 6,
              height: Math.random() * 12 + 6,
              background: `rgba(255, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 0.3 + 0.05})`,
              borderRadius: '50%',
              animation: `floatParticleLarge ${Math.random() * 20 + 25}s linear infinite`,
              animationDelay: `${Math.random() * 15}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
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
                  transform: 'translateY(-100px) translateX(200px) rotate(720deg)',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ 
            width: 32, 
            height: 32, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}>
            <AccountBalance sx={{ fontSize: 20 }} />
          </Avatar>
          <Typography variant="h6" sx={{ 
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }} component="span">
            BudgetGestion
          </Typography>
        </Box>
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
          Passer
        </Button>
      </Box>

      {/* Progress Bar glassmorphism */}
      <LinearProgress 
        variant="determinate" 
        value={((step + 1) / steps.length) * 100} 
        sx={{ 
          height: 6, 
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          '& .MuiLinearProgress-bar': { 
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3
          }
        }} 
      />

      {/* Main Content */}
      <Container maxWidth="md" sx={{ 
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
                width: 140, 
                height: 140, 
                mx: 'auto', 
                mb: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
                color: 'white'
              }}
            >
              {currentStep.icon}
            </Avatar>
          </Zoom>
          
          <Fade in timeout={800}>
            <Box>
              <Typography variant="h3" sx={{ 
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
              <Typography variant="h5" sx={{ 
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
              lineHeight: 1.8,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              fontSize: '1.1rem'
            }}>
              {currentStep.description}
            </Typography>
          </Box>
        </Slide>

        {/* Features glassmorphism */}
        <Fade in timeout={1200}>
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              {Array.isArray(currentStep.features) && currentStep.features.map((feature, index) => (
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
                    <CardContent sx={{ py: 2, px: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ 
                          color: '#4caf50', 
                          mr: 2, 
                          fontSize: 24,
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                        }} />
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500,
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          fontSize: '0.95rem'
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
          p: 3,
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
            Précédent
          </Button>

          {/* Step Indicators glassmorphism */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {steps.map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: idx === step ? '#667eea' : 'rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  boxShadow: idx === step ? '0 2px 8px rgba(102, 126, 234, 0.4)' : 'none'
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
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
                  Configuration...
                </Typography>
                <LinearProgress sx={{ width: 20, height: 2 }} />
              </Box>
            ) : (
              isLast ? 'Commencer' : 'Suivant'
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
            Plus de 10,000 utilisateurs satisfaits
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ 
          color: 'rgba(255, 255, 255, 0.6)',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }} component="span">
          Vos données sont sécurisées et privées
        </Typography>
      </Box>
    </Box>
  );
};

export default Onboarding; 