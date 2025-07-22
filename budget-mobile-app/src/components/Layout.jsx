import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { Box, Chip, Tooltip } from '@mui/material';
import { 
  Star as StarIcon, 
  Diamond as DiamondIcon, 
  CardMembership
} from '@mui/icons-material';
import Tutorial from './Tutorial';
import UpdateDialog from './UpdateDialog';
import FloatingMenu from './optimized/FloatingMenu';
import BottomTabs from './BottomTabs';
import toast from 'react-hot-toast';

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
    getCurrentPlan,
    fetchSubscriptionFromStripe
  } = useStore();
  
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

  // Récupérer l'abonnement depuis Stripe au chargement
  useEffect(() => {
    console.log('Layout: Vérification de l\'abonnement Stripe à chaque connexion');
    fetchSubscriptionFromStripe();
  }, [fetchSubscriptionFromStripe]);

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

  // Fonction pour obtenir l'icône d'abonnement
  const getSubscriptionIcon = () => {
    const currentPlan = getCurrentPlan();
    
    // Gérer le cas où currentPlan est undefined
    if (!currentPlan) {
      return <CardMembership sx={{ color: '#9E9E9E' }} />;
    }
    
    if (currentPlan.id === 'premium') {
      return <StarIcon sx={{ color: '#FFD700' }} />;
    } else if (currentPlan.id === 'pro') {
      return <DiamondIcon sx={{ color: '#00D4FF' }} />;
    }
    return <CardMembership sx={{ color: '#9E9E9E' }} />;
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

  return (
    <Box sx={{ pb: 10 }}>
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

      <FloatingMenu onQuickAdd={() => navigate('/quick-add')} />

      {/* Nouvelle barre de navigation BottomTabs */}
      <BottomTabs />

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