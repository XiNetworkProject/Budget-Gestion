import React, { useState } from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Box,
  Slide,
  Fade,
  Paper
} from '@mui/material';
import { 
  Home as HomeIcon,
  BarChart as AnalyticsIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  AccountBalance as BankIcon,
  Savings as SavingsIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

const BottomNavigationOptimized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isFeatureAvailable } = useStore();
  
  const [value, setValue] = useState(() => {
    const path = location.pathname;
    if (path === '/home' || path === '/') return 0;
    if (path === '/analytics') return 1;
    if (path === '/history') return 2;
    if (path === '/savings') return 3;
    if (path === '/bank') return 4;
    if (path === '/settings') return 5;
    return 0;
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
    
    // Navigation avec animation
    const routes = ['/home', '/analytics', '/history', '/savings', '/bank', '/settings'];
    const targetRoute = routes[newValue];
    
    if (targetRoute && targetRoute !== location.pathname) {
      navigate(targetRoute);
    }
  };

  const navigationItems = [
    {
      label: 'Accueil',
      value: 0,
      icon: <HomeIcon />,
      path: '/home',
      available: true
    },
    {
      label: 'Analytics',
      value: 1,
      icon: <AnalyticsIcon />,
      path: '/analytics',
      available: true
    },
    {
      label: 'Historique',
      value: 2,
      icon: <HistoryIcon />,
      path: '/history',
      available: true
    },
    {
      label: 'Épargne',
      value: 3,
      icon: <SavingsIcon />,
      path: '/savings',
      available: isFeatureAvailable('maxSavingsGoals')
    },
    {
      label: 'Banque',
      value: 4,
      icon: <BankIcon />,
      path: '/bank',
      available: isFeatureAvailable('multipleAccounts')
    },
    {
      label: 'Paramètres',
      value: 5,
      icon: <SettingsIcon />,
      path: '/settings',
      available: true
    }
  ];

  const availableItems = navigationItems.filter(item => item.available);

  return (
    <Slide direction="up" in timeout={300}>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '20px 20px 0 0'
        }}
        elevation={8}
      >
        <BottomNavigation
          value={value}
          onChange={handleChange}
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: '#2563eb',
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                transition: 'all 0.3s ease'
              }
            },
            '& .MuiBottomNavigationAction-icon': {
              fontSize: '1.5rem',
              transition: 'all 0.3s ease'
            }
          }}
        >
          {availableItems.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={item.icon}
              sx={{
                '&.Mui-selected': {
                  '& .MuiBottomNavigationAction-icon': {
                    transform: 'scale(1.1)',
                    color: '#2563eb'
                  }
                }
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Slide>
  );
};

export default BottomNavigationOptimized; 