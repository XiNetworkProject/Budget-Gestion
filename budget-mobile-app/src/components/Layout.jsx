import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  BottomNavigation, 
  BottomNavigationAction,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import SavingsIcon from '@mui/icons-material/Savings';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import Tutorial from './Tutorial';
import UpdateDialog from './UpdateDialog';
import QuickAdd from '../pages/QuickAdd';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Layout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    tutorialCompleted, 
    onboardingCompleted,
    forceTutorial,
    setTutorialCompleted,
    clearForceTutorial,
    validateAndCleanDates,
    syncExpensesWithCategories,
    showUpdateDialog,
    closeUpdateDialog,
    checkForUpdates,
    checkAndFixOnboardingState,
    activeAccount, 
    accounts, 
    setActiveAccount,
    showTutorial: storeShowTutorial,
    setShowTutorial: setStoreShowTutorial,
    showOnboarding,
    setShowOnboarding,
    subscription,
    getCurrentPlan
  } = useStore();
  
  // map path to nav value (retiré /quickadd)
  const paths = ['/home', '/analytics', '/savings', '/settings'];
  const [value, setValue] = useState(paths.indexOf(location.pathname) !== -1 ? paths.indexOf(location.pathname) : 0);
  const [showTutorial, setShowTutorial] = useState(false);

  // Log des états initiaux
  useEffect(() => {
    console.log('Layout: États initiaux:', {
      tutorialCompleted,
      onboardingCompleted,
      forceTutorial,
      showUpdateDialog
    });
  }, []);

  // Nettoyer les dates invalides et synchroniser les dépenses au chargement
  useEffect(() => {
    validateAndCleanDates();
    syncExpensesWithCategories();
  }, [validateAndCleanDates, syncExpensesWithCategories]);

  // Vérifier et corriger l'état onboarding au chargement
  useEffect(() => {
    console.log('Layout: Vérification de l\'état onboarding');
    const wasFixed = checkAndFixOnboardingState();
    if (wasFixed) {
      console.log('Layout: État onboarding corrigé automatiquement');
    }
  }, [checkAndFixOnboardingState]);

  // Vérifier les mises à jour au chargement
  useEffect(() => {
    // Ne vérifier les mises à jour qu'au premier chargement de l'application
    const hasCheckedUpdates = sessionStorage.getItem('hasCheckedUpdates');
    if (!hasCheckedUpdates) {
      console.log('Layout: Premier chargement, vérification des mises à jour');
      checkForUpdates();
      sessionStorage.setItem('hasCheckedUpdates', 'true');
    } else {
      console.log('Layout: Mises à jour déjà vérifiées dans cette session');
    }
  }, [checkForUpdates]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const path = paths[newValue];
    navigate(path);
  };

  // Fonction pour obtenir l'icône d'abonnement
  const getSubscriptionIcon = () => {
    const currentPlan = getCurrentPlan();
    
    if (currentPlan.id === 'premium') {
      return <StarIcon sx={{ color: '#FFD700' }} />;
    } else if (currentPlan.id === 'pro') {
      return <DiamondIcon sx={{ color: '#00D4FF' }} />;
    }
    return null;
  };

  // Fonction pour obtenir le texte de l'abonnement
  const getSubscriptionText = () => {
    const currentPlan = getCurrentPlan();
    
    if (currentPlan.id === 'premium') {
      return t('subscription.premium');
    } else if (currentPlan.id === 'pro') {
      return t('subscription.pro');
    }
    return '';
  };

  // Gestion du tutoriel - ne se lance qu'une seule fois après l'onboarding
  useEffect(() => {
    console.log('Layout: État des conditions tutoriel:', { 
      onboardingCompleted, 
      tutorialCompleted, 
      forceTutorial 
    });
    
    // Le tutoriel ne se lance que si :
    // 1. L'onboarding est terminé
    // 2. Le tutoriel n'a pas encore été complété
    // 3. Ou si on force le tutoriel depuis les paramètres
    if ((onboardingCompleted && !tutorialCompleted) || forceTutorial) {
      console.log('Layout: Conditions tutoriel remplies, lancement dans 3 secondes...', { 
        onboardingCompleted, 
        tutorialCompleted, 
        forceTutorial 
      });
      const timer = setTimeout(() => {
        console.log('Layout: Lancement du tutoriel maintenant');
        setShowTutorial(true);
        // Si c'était un relancement forcé, on nettoie l'état
        if (forceTutorial) {
          clearForceTutorial();
        }
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      console.log('Layout: Conditions tutoriel non remplies, pas de lancement');
    }
  }, [onboardingCompleted, tutorialCompleted, forceTutorial, clearForceTutorial]);

  return (
    <Box sx={{ pb: 7 }}>
      <Tutorial 
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => {
          setTutorialCompleted(true);
          setShowTutorial(false);
          toast.success('Tutoriel terminé ! Vous pouvez le relancer depuis les paramètres.');
        }}
      />

      <UpdateDialog 
        open={showUpdateDialog}
        onClose={closeUpdateDialog}
      />

      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>

      {/* QuickAdd global */}
      <QuickAdd />

      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigationAction label={t('navigation.home')} icon={<HomeIcon />} />
        <BottomNavigationAction label={t('navigation.analytics')} icon={<BarChartIcon />} />
        <BottomNavigationAction label={t('navigation.savings')} icon={<SavingsIcon />} />
        <BottomNavigationAction label={t('navigation.settings')} icon={<SettingsIcon />} />
      </BottomNavigation>

      {/* Indicateur d'abonnement discret */}
      {getSubscriptionIcon() && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Tooltip title={getSubscriptionText()} arrow>
            <Chip
              icon={getSubscriptionIcon()}
              label={getSubscriptionText()}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease'
                }
              }}
            />
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default Layout; 