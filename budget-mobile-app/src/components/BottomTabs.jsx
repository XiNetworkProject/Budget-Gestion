import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Fab, 
  Tooltip, 
  Zoom, 
  Fade,
  Badge,
  IconButton
} from '@mui/material';
import {
  Home,
  Analytics,
  Add,
  History,
  AccountBalance,
  Settings,
  Notifications,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { useStore } from '../store';
import QuickAddModal from './QuickAddModal';

const BottomTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    selectedMonthData, 
    isAuthenticated, 
    serverConnected,
    getCurrentPlan,
    isFeatureAvailable
  } = useStore();
  
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Configuration des onglets
  const tabs = [
    { 
      to: '/home', 
      label: 'Accueil', 
      icon: Home,
      badge: null
    },
    { 
      to: '/expenses', 
      label: 'Dépenses', 
      icon: TrendingDown,
      badge: selectedMonthData?.expenses > 0 ? 
        `${Math.round(selectedMonthData.expenses / 1000)}k` : null
    },
    { 
      to: '/income', 
      label: 'Revenus', 
      icon: TrendingUp,
      badge: selectedMonthData?.income > 0 ? 
        `${Math.round(selectedMonthData.income / 1000)}k` : null
    },
    { 
      to: '/savings', 
      label: 'Épargne', 
      icon: AccountBalance,
      badge: selectedMonthData?.saved > 0 ? 
        `${Math.round(selectedMonthData.saved / 1000)}k` : null
    },
    { 
      to: '/settings', 
      label: 'Paramètres', 
      icon: Settings,
      badge: null
    }
  ];

  // Fonction pour gérer l'ajout rapide
  const handleQuickAdd = () => {
    setShowQuickAdd(true);
  };

  // Fonction pour obtenir l'icône de l'abonnement
  const getSubscriptionIcon = () => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return null;
    
    if (currentPlan.id === 'premium') return '⭐';
    if (currentPlan.id === 'pro') return '💎';
    return null;
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
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        px: 2,
        boxShadow: '0 -8px 32px rgba(0,0,0,0.1)'
      }}>
        {/* Onglets de gauche */}
        <Box sx={{ display: 'flex', gap: 1, flex: 1, justifyContent: 'flex-start' }}>
          {tabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.to;
            
            return (
              <Tooltip key={tab.to} title={tab.label} arrow placement="top">
                <IconButton
                  component={Link}
                  to={tab.to}
                  sx={{
                    color: isActive ? '#4caf50' : 'rgba(255,255,255,0.7)',
                    background: isActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                    borderRadius: 2,
                    p: 1.5,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      background: isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                  {tab.badge && (
                    <Badge
                      badgeContent={tab.badge}
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18,
                          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                          color: 'white',
                          fontWeight: 600
                        }
                      }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            );
          })}
        </Box>

        {/* Espace pour le bouton central */}
        <Box sx={{ flex: 1 }} />

        {/* Onglets de droite */}
        <Box sx={{ display: 'flex', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
          {tabs.slice(2).map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.to;
            
            return (
              <Tooltip key={tab.to} title={tab.label} arrow placement="top">
                <IconButton
                  component={Link}
                  to={tab.to}
                  sx={{
                    color: isActive ? '#4caf50' : 'rgba(255,255,255,0.7)',
                    background: isActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                    borderRadius: 2,
                    p: 1.5,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      background: isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                  {tab.badge && (
                    <Badge
                      badgeContent={tab.badge}
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18,
                          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                          color: 'white',
                          fontWeight: 600
                        }
                      }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      {/* Bouton d'ajout rapide flottant au centre */}
      <Box sx={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
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
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4), 0 0 0 4px rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                  transform: 'translateY(-4px) scale(1.1)',
                  boxShadow: '0 12px 35px rgba(76, 175, 80, 0.6), 0 0 0 6px rgba(255,255,255,0.15)',
                },
                '&:active': {
                  transform: 'translateY(-2px) scale(1.05)',
                }
              }}
            >
              <Add sx={{ fontSize: 32, color: 'white' }} />
            </Fab>
          </Tooltip>
        </Zoom>
      </Box>

      {/* Indicateur de statut flottant */}
      <Box sx={{
        position: 'fixed',
        bottom: 90,
        right: 20,
        zIndex: 1000
      }}>
        <Fade in timeout={1000}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            {/* Indicateur de connexion */}
            <Tooltip title={serverConnected ? 'Connecté' : 'Mode hors ligne'} arrow>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: serverConnected ? '#4caf50' : '#ff9800',
                boxShadow: '0 0 10px currentColor',
                animation: serverConnected ? 'none' : 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.5, transform: 'scale(1.2)' },
                  '100%': { opacity: 1, transform: 'scale(1)' }
                }
              }} />
            </Tooltip>

            {/* Indicateur d'abonnement */}
            {getSubscriptionIcon() && (
              <Tooltip title="Abonnement actif" arrow>
                <Box sx={{
                  fontSize: '1.2rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}>
                  {getSubscriptionIcon()}
                </Box>
              </Tooltip>
            )}
          </Box>
        </Fade>
      </Box>

      {/* Indicateur de solde flottant */}
      {selectedMonthData?.saved !== undefined && (
        <Box sx={{
          position: 'fixed',
          bottom: 90,
          left: 20,
          zIndex: 1000
        }}>
          <Fade in timeout={1200}>
            <Tooltip title={`Solde: ${selectedMonthData.saved >= 0 ? '+' : ''}${selectedMonthData.saved}€`} arrow>
              <Box sx={{
                p: 1,
                borderRadius: 2,
                background: selectedMonthData.saved >= 0 ? 
                  'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: selectedMonthData.saved >= 0 ? '#4caf50' : '#f44336',
                fontSize: '0.8rem',
                fontWeight: 600,
                textAlign: 'center',
                minWidth: 60,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {selectedMonthData.saved >= 0 ? '+' : ''}{Math.round(selectedMonthData.saved)}€
              </Box>
            </Tooltip>
          </Fade>
                 </Box>
       )}

       {/* Modal d'ajout rapide */}
       <QuickAddModal 
         open={showQuickAdd} 
         onClose={() => setShowQuickAdd(false)} 
       />
     </>
   );
 };

export default BottomTabs; 