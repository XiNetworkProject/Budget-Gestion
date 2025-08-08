import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  IconButton,
  Fade,
  Zoom,
  Chip,
  Avatar,
  LinearProgress,
  Stack
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

  // Version compacte (mobile): moins d'étapes, infos condensées
  const visibleSteps = useMemo(() => (isMobile ? steps.slice(0, 5) : steps.slice(0, 7)), [isMobile]);
  const totalSteps = visibleSteps.length;
  const clampedStep = Math.min(step, totalSteps - 1);
  const isLast = clampedStep === totalSteps - 1;

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
      setStep(s => Math.min(s + 1, totalSteps - 1));
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

  const currentStep = visibleSteps[clampedStep];
  const featureItems = (currentStep.features || []).slice(0, 3);
  const shortDescription = (currentStep.description?.split('.')?.[0] || currentStep.description) + '.';

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      p: isMobile ? 1.5 : 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Arrière-plan minimal pour rester lisible et sans surcharge */}

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
        value={((clampedStep + 1) / totalSteps) * 100} 
        sx={{ 
          height: isMobile ? 4 : 6, 
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
      <Container maxWidth={isMobile ? 'xs' : 'sm'} sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        py: isMobile ? 1.5 : 2,
        position: 'relative',
        zIndex: 1
      }}>
        {/* En-tête compact */}
        <Box sx={{ textAlign: 'center', mb: isMobile ? 2 : 3 }}>
          <Zoom in timeout={600}>
            <Avatar 
              sx={{ 
                width: isMobile ? 80 : 140, 
                height: isMobile ? 80 : 140, 
                mx: 'auto', 
                mb: isMobile ? 1.5 : 2.5,
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
              <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ 
                fontWeight: 'bold', 
                mb: isMobile ? 0.5 : 1, 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {currentStep.title}
              </Typography>
              <Typography variant={isMobile ? 'caption' : 'subtitle1'} sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                mb: isMobile ? 1 : 1.5, 
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {currentStep.subtitle}
              </Typography>
            </Box>
          </Fade>
        </Box>
        {/* Description + puces ultra compactes */}
        <Fade in timeout={900}>
          <Box sx={{ textAlign: 'center', mb: isMobile ? 1.5 : 2 }}>
            <Typography variant={isMobile ? 'body2' : 'body1'} sx={{ 
              color: 'rgba(255,255,255,0.85)'
            }}>
              {shortDescription}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1, flexWrap: 'wrap' }}>
              {featureItems.map((f, idx) => (
                <Chip key={idx} label={f} size={isMobile ? 'small' : 'medium'} sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} variant="outlined" />
              ))}
            </Stack>
          </Box>
        </Fade>

        {/* Barre d’action fixe, aucune scroll nécessaire */}
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mt: isMobile ? 1.5 : 2 }}>
          <Button variant="outlined" onClick={prev} disabled={clampedStep === 0} startIcon={<ArrowBack />} sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>Précédent</Button>
          <Stack direction="row" spacing={0.8} alignItems="center">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <Box key={idx} sx={{ width: 8, height: 8, borderRadius: '50%', background: idx === clampedStep ? '#667eea' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </Stack>
          <Button variant="contained" onClick={next} disabled={loading} endIcon={isLast ? <PlayArrow /> : <ArrowForward />} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {isLast ? 'Commencer' : 'Suivant'}
          </Button>
        </Stack>
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