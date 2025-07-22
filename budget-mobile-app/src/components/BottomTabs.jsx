import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Fab, 
  Tooltip, 
  Zoom,
  Fade
} from '@mui/material';
import {
  Home,
  Analytics,
  Add,
  History,
  AccountBalance,
  Settings
} from '@mui/icons-material';

const tabs = [
  { 
    to: '/home', 
    label: 'Accueil', 
    icon: Home,
    color: '#4caf50'
  },
  { 
    to: '/analytics', 
    label: 'Analytics', 
    icon: Analytics,
    color: '#2196f3'
  },
  { 
    to: '/history', 
    label: 'Historique', 
    icon: History,
    color: '#ff9800'
  },
  { 
    to: '/bank', 
    label: 'Banque', 
    icon: AccountBalance,
    color: '#9c27b0'
  },
  { 
    to: '/settings', 
    label: 'Paramètres', 
    icon: Settings,
    color: '#607d8b'
  },
];

const BottomTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleQuickAdd = () => {
    navigate('/quick-add');
  };

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <Box sx={{ 
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: 80,
      display: 'flex',
      alignItems: 'flex-end'
    }}>
      {/* Barre de navigation principale */}
      <Box sx={{
        width: '100%',
        height: 60,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        px: 2
      }}>
        {/* Onglets de gauche */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flex: 1,
          justifyContent: 'flex-start'
        }}>
          {tabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.to);
            
            return (
              <Tooltip key={tab.to} title={tab.label} arrow placement="top">
                <Link
                  to={tab.to}
                  style={{ textDecoration: 'none' }}
                >
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 60,
                    height: 50,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    color: active ? tab.color : 'rgba(0, 0, 0, 0.6)',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Icon sx={{ 
                      fontSize: 24,
                      mb: 0.5,
                      filter: active ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                    }} />
                    <Box sx={{
                      fontSize: '0.7rem',
                      fontWeight: active ? 600 : 400,
                      opacity: active ? 1 : 0.7
                    }}>
                      {tab.label}
                    </Box>
                  </Box>
                </Link>
              </Tooltip>
            );
          })}
        </Box>

        {/* Espace pour le bouton central */}
        <Box sx={{ width: 80 }} />

        {/* Onglets de droite */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flex: 1,
          justifyContent: 'flex-end'
        }}>
          {tabs.slice(2).map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.to);
            
            return (
              <Tooltip key={tab.to} title={tab.label} arrow placement="top">
                <Link
                  to={tab.to}
                  style={{ textDecoration: 'none' }}
                >
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 60,
                    height: 50,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    color: active ? tab.color : 'rgba(0, 0, 0, 0.6)',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Icon sx={{ 
                      fontSize: 24,
                      mb: 0.5,
                      filter: active ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                    }} />
                    <Box sx={{
                      fontSize: '0.7rem',
                      fontWeight: active ? 600 : 400,
                      opacity: active ? 1 : 0.7
                    }}>
                      {tab.label}
                    </Box>
                  </Box>
                </Link>
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      {/* Bouton d'ajout rapide flottant */}
      <Box sx={{
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        zIndex: 1001
      }}>
        <Zoom in timeout={800}>
          <Tooltip title="Ajouter une transaction" arrow placement="top">
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleQuickAdd}
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                border: '3px solid white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                  transform: 'scale(1.1)',
                  boxShadow: '0 12px 35px rgba(76, 175, 80, 0.6)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                }
              }}
            >
              <Add sx={{ fontSize: 32, color: 'white' }} />
            </Fab>
          </Tooltip>
        </Zoom>
      </Box>

      {/* Indicateur de navigation active */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.3), transparent)',
        opacity: 0.5
      }} />
    </Box>
  );
};

export default BottomTabs; 