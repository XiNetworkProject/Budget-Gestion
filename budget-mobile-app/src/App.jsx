import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import Splash from './components/Splash';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline
} from '@mui/material';
import AppRoutes from './Routes';

const App = () => {
  const { appSettings } = useStore();
  const [showSplash, setShowSplash] = useState(true);
  
  // Splash screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  console.log('App: appSettings reçues:', appSettings);

  // Créer le thème basé sur les paramètres
  const theme = createTheme({
    palette: {
      mode: appSettings.theme || 'light',
      primary: {
        main: '#2563eb',
      },
      secondary: {
        main: '#7c3aed',
      },
      background: {
        default: appSettings.theme === 'dark' ? '#0f172a' : '#f8fafc',
        paper: appSettings.theme === 'dark' ? '#1e293b' : '#ffffff',
      },
    },
    spacing: appSettings.display?.compactMode ? 1 : 2,
    typography: {
      fontSize: appSettings.display?.compactMode ? 14 : 16,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: appSettings.display?.compactMode ? 4 : 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: appSettings.display?.compactMode ? 4 : 8,
          },
        },
      },
    },
  });

  console.log('App: Thème créé:', {
    mode: theme.palette.mode,
    spacing: theme.spacing(1),
    fontSize: theme.typography.fontSize,
    compactMode: appSettings.display?.compactMode
  });

  if (showSplash) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Splash />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;
