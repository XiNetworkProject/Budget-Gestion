import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Fab, 
  Tooltip, 
  Zoom,
  Fade,
  Dialog,
  DialogContent
} from '@mui/material';
import {
  Home,
  Analytics,
  Add,
  AccountBalance,
  Settings
} from '@mui/icons-material';
import QuickAdd from '../pages/QuickAdd';

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
    to: '/savings', 
    label: 'Épargne', 
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
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleQuickAdd = () => {
    setShowQuickAdd(true);
  };

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Barre de navigation principale */}
      <Box sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: 80,
        display: 'flex',
        alignItems: 'flex-end',
        px: 2
      }}>
        {/* Fond de la barre */}
        <Box sx={{
          width: '100%',
          height: 70,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          position: 'relative'
        }}>
          {/* Onglets de gauche */}
          <Box sx={{ 
            display: 'flex', 
            gap: 4,
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
                      minWidth: 50,
                      height: 50,
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: active ? tab.color : 'rgba(0, 0, 0, 0.5)',
                      background: active ? `rgba(${tab.color === '#4caf50' ? '76, 175, 80' : '33, 150, 243'}, 0.1)` : 'transparent',
                      '&:hover': {
                        background: active ? `rgba(${tab.color === '#4caf50' ? '76, 175, 80' : '33, 150, 243'}, 0.15)` : 'rgba(0, 0, 0, 0.05)',
                        transform: 'translateY(-2px)',
                        boxShadow: active ? `0 4px 12px rgba(${tab.color === '#4caf50' ? '76, 175, 80' : '33, 150, 243'}, 0.3)` : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }
                    }}>
                      <Icon sx={{ 
                        fontSize: 24,
                        mb: 0.5,
                        filter: active ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                      }} />
                      <Box sx={{
                        fontSize: '0.65rem',
                        fontWeight: active ? 600 : 400,
                        opacity: active ? 1 : 0.7,
                        textAlign: 'center',
                        lineHeight: 1
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
            gap: 4,
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
                      minWidth: 50,
                      height: 50,
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: active ? tab.color : 'rgba(0, 0, 0, 0.5)',
                      background: active ? `rgba(${tab.color === '#9c27b0' ? '156, 39, 176' : '96, 125, 139'}, 0.1)` : 'transparent',
                      '&:hover': {
                        background: active ? `rgba(${tab.color === '#9c27b0' ? '156, 39, 176' : '96, 125, 139'}, 0.15)` : 'rgba(0, 0, 0, 0.05)',
                        transform: 'translateY(-2px)',
                        boxShadow: active ? `0 4px 12px rgba(${tab.color === '#9c27b0' ? '156, 39, 176' : '96, 125, 139'}, 0.3)` : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }
                    }}>
                      <Icon sx={{ 
                        fontSize: 24,
                        mb: 0.5,
                        filter: active ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                      }} />
                      <Box sx={{
                        fontSize: '0.65rem',
                        fontWeight: active ? 600 : 400,
                        opacity: active ? 1 : 0.7,
                        textAlign: 'center',
                        lineHeight: 1
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
          top: -15,
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
                  width: 70,
                  height: 70,
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4), 0 4px 10px rgba(0, 0, 0, 0.1)',
                  border: '4px solid white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                    transform: 'scale(1.1)',
                    boxShadow: '0 12px 35px rgba(76, 175, 80, 0.6), 0 6px 15px rgba(0, 0, 0, 0.15)',
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
      </Box>

      {/* Popup QuickAdd */}
      <QuickAdd 
        open={showQuickAdd} 
        onClose={() => setShowQuickAdd(false)} 
      />
    </>
  );
};

export default BottomTabs; 