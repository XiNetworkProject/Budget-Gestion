import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import SavingsIcon from '@mui/icons-material/Savings';
import Tutorial from './Tutorial';
import UpdateDialog from './UpdateDialog';
import QuickAdd from '../pages/QuickAdd';
import { useStore } from '../store';
import toast from 'react-hot-toast';

const Layout = () => {
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
    checkForUpdates
  } = useStore();
  
  // map path to nav value (retiré /quickadd)
  const paths = ['/home', '/analytics', '/savings', '/settings'];
  const [value, setValue] = useState(paths.indexOf(location.pathname) !== -1 ? paths.indexOf(location.pathname) : 0);
  const [showTutorial, setShowTutorial] = useState(false);

  // Nettoyer les dates invalides et synchroniser les dépenses au chargement
  useEffect(() => {
    validateAndCleanDates();
    syncExpensesWithCategories();
  }, [validateAndCleanDates, syncExpensesWithCategories]);

  // Vérifier les mises à jour au chargement
  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const path = paths[newValue];
    navigate(path);
  };

  // Gestion du tutoriel - ne se lance qu'une seule fois après l'onboarding
  useEffect(() => {
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

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Budget Gestion
          </Typography>
        </Toolbar>
      </AppBar>

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
        <BottomNavigationAction label="Accueil" icon={<HomeIcon />} />
        <BottomNavigationAction label="Analytics" icon={<BarChartIcon />} />
        <BottomNavigationAction label="Épargne" icon={<SavingsIcon />} />
        <BottomNavigationAction label="Paramètres" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Box>
  );
};

export default Layout; 