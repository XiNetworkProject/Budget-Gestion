import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Fab, 
  Tooltip, 
  Zoom,
  useTheme,
  useMediaQuery,
  Paper,
  Avatar,
  IconButton,
  Typography,
  Badge
} from '@mui/material';
import { useStore } from '../store';
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
  { to: '/analytics', label: 'Analytics', icon: Analytics, color: '#2196f3' },
  { 
    to: '/savings', 
    label: 'Épargne', 
    icon: AccountBalance,
    color: '#9c27b0'
  },
  { to: '/settings', label: 'Paramètres', icon: Settings, color: '#607d8b' },
];

const BottomTabs = () => {
  const location = useLocation();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showUpdateDialog } = useStore();

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
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, px: isMobile ? 1 : 2, pb: 0 }}>
        <Paper elevation={0} sx={{
          width: '100%',
          height: isMobile ? 62 : 74,
          borderRadius: isMobile ? '16px 16px 0 0' : '20px 20px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: isMobile ? 1.5 : 2.5,
          position: 'relative',
        }}>
          {/* Onglets de gauche */}
          <Box sx={{ 
            display: 'flex', 
            gap: isMobile ? 2 : 4,
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
                      minWidth: isMobile ? 44 : 56,
                      height: isMobile ? 44 : 56,
                      borderRadius: isMobile ? '8px' : '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: active ? tab.color : 'rgba(255,255,255,0.7)',
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.12)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }
                      }}>
                      <Badge variant="dot" color="secondary" invisible={tab.to !== '/settings' ? true : !showUpdateDialog} overlap="circular">
                        <Icon sx={{ 
                        fontSize: isMobile ? 22 : 24,
                        mb: 0.2,
                        filter: active ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                        }} />
                      </Badge>
                      <Box sx={{
                        fontSize: isMobile ? '0.68rem' : '0.7rem',
                        fontWeight: active ? 600 : 400,
                        opacity: active ? 1 : 0.85,
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
          <Box sx={{ width: isMobile ? 60 : 80 }} />

          {/* Onglets de droite */}
          <Box sx={{ 
            display: 'flex', 
            gap: isMobile ? 2 : 4,
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
                      minWidth: isMobile ? 44 : 56,
                      height: isMobile ? 44 : 56,
                      borderRadius: isMobile ? '8px' : '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: active ? tab.color : 'rgba(255,255,255,0.7)',
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.12)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }
                      }}>
                      <Badge variant="dot" color="secondary" invisible={tab.to !== '/settings' ? true : !showUpdateDialog} overlap="circular">
                        <Icon sx={{ 
                        fontSize: isMobile ? 22 : 24,
                        mb: 0.2,
                        filter: active ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                        }} />
                      </Badge>
                      <Box sx={{
                        fontSize: isMobile ? '0.68rem' : '0.7rem',
                        fontWeight: active ? 600 : 400,
                        opacity: active ? 1 : 0.85,
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
        </Paper>

        {/* Bouton d'ajout rapide flottant */}
        <Box sx={{ position: 'absolute', left: '50%', top: isMobile ? -14 : -16, transform: 'translateX(-50%)', zIndex: 1001 }}>
          <Zoom in timeout={800}>
            <Tooltip title="Ajouter une transaction" arrow placement="top">
              <Fab
                color="primary"
                aria-label="add"
                onClick={handleQuickAdd}
                sx={{
                  width: isMobile ? 56 : 68,
                  height: isMobile ? 56 : 68,
                  background: 'linear-gradient(135deg, #00e1d6 0%, #1976d2 100%)',
                  boxShadow: '0 10px 24px rgba(0, 225, 214, 0.45) , 0 6px 14px rgba(0,0,0,0.14)',
                  border: isMobile ? '3px solid rgba(255,255,255,0.96)' : '3px solid rgba(255,255,255,0.96)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00cfc4 0%, #166dc1 100%)',
                    transform: 'scale(1.1)',
                    boxShadow: '0 14px 32px rgba(0, 225, 214, 0.6) , 0 8px 18px rgba(0,0,0,0.18)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  }
                }}
              >
                <Add sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
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