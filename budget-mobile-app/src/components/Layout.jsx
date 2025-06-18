import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SavingsIcon from '@mui/icons-material/Savings';
import Tutorial from './Tutorial';
import { useStore } from '../store';
import toast from 'react-hot-toast';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    tutorialCompleted, 
    forceTutorial,
    setTutorialCompleted,
    clearForceTutorial,
    forceShowTutorial
  } = useStore();
  
  // map path to nav value
  const paths = ['/home', '/analytics', '/quickadd', '/savings', '/settings'];
  const [value, setValue] = useState(paths.indexOf(location.pathname) !== -1 ? paths.indexOf(location.pathname) : 0);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const path = paths[newValue];
    navigate(path);
  };

  // Gestion du tutoriel
  useEffect(() => {
    if (!tutorialCompleted || forceTutorial) {
      console.log('Layout: Conditions tutoriel remplies, lancement dans 3 secondes...', { tutorialCompleted, forceTutorial });
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
  }, [tutorialCompleted, forceTutorial, clearForceTutorial]);

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

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Budget Gestion
          </Typography>
          {/* Bouton de test temporaire pour le tutoriel */}
          <button
            onClick={() => {
              console.log('Test: Forcer l\'affichage du tutoriel');
              setShowTutorial(true);
            }}
            style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '4px 8px',
              cursor: 'pointer',
              marginRight: '8px',
              fontSize: '12px'
            }}
          >
            Test Tutoriel
          </button>
          {/* Bouton de test pour forcer le relancement */}
          <button
            onClick={() => {
              console.log('Test: Forcer le relancement du tutoriel');
              forceShowTutorial();
            }}
            style={{
              background: '#ed6c02',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '4px 8px',
              cursor: 'pointer',
              marginRight: '8px',
              fontSize: '12px'
            }}
          >
            Force Relance
          </button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>

      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigationAction label="Accueil" icon={<HomeIcon />} />
        <BottomNavigationAction label="Analytics" icon={<BarChartIcon />} />
        <BottomNavigationAction label="Ajouter" icon={<AddCircleIcon />} />
        <BottomNavigationAction label="Épargne" icon={<SavingsIcon />} />
        <BottomNavigationAction label="Paramètres" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Box>
  );
};

export default Layout; 