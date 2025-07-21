import React, { memo, useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Chip, 
  Avatar, 
  Menu, 
  MenuItem, 
  Fade, 
  Zoom,
  Tooltip,
  Badge,
  Divider,
  Button
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  AccountBalance,
  Star,
  Diamond,
  CardMembership,
  Notifications,
  Settings,
  Person,
  Logout,
  Refresh,
  TrendingUp,
  TrendingDown,
  Remove,
  Speed,
  Security,
  AutoAwesome
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';

// Composant d'en-tête intelligent
const SmartHeader = memo(({ 
  selectedMonth, 
  selectedYear, 
  onMonthChange, 
  onRefresh,
  showNotifications = true 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    user, 
    logout, 
    serverConnected, 
    getCurrentPlan,
    isFeatureAvailable,
    notifications,
    clearNotifications
  } = useStore();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  // Fonctions memoizées
  const getMonthName = useCallback((month, year) => {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${monthNames[month]} ${year}`;
  }, []);

  const navigateMonth = useCallback((direction) => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;
    
    if (direction === 'next') {
      newMonth = (newMonth + 1) % 12;
      if (newMonth === 0) newYear++;
    } else {
      newMonth = (newMonth - 1 + 12) % 12;
      if (newMonth === 11) newYear--;
    }
    
    onMonthChange(newMonth, newYear);
  }, [selectedMonth, selectedYear, onMonthChange]);

  const getSubscriptionIcon = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return <CardMembership sx={{ color: '#9E9E9E' }} />;
    
    if (currentPlan.id === 'premium') return <Star sx={{ color: '#FFD700' }} />;
    if (currentPlan.id === 'pro') return <Diamond sx={{ color: '#00D4FF' }} />;
    return <CardMembership sx={{ color: '#9E9E9E' }} />;
  }, [getCurrentPlan]);

  const getSubscriptionText = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return t('subscription.free');
    
    if (currentPlan.id === 'premium') return t('subscription.premium');
    if (currentPlan.id === 'pro') return t('subscription.pro');
    return t('subscription.free');
  }, [getCurrentPlan, t]);

  const getSubscriptionColor = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return '#9E9E9E';
    
    if (currentPlan.id === 'premium') return '#FFD700';
    if (currentPlan.id === 'pro') return '#00D4FF';
    return '#9E9E9E';
  }, [getCurrentPlan]);

  // Notifications non lues
  const unreadNotifications = useMemo(() => {
    return notifications?.filter(n => !n.read) || [];
  }, [notifications]);

  // Gestion des menus
  const handleProfileMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleProfileMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNotificationMenuOpen = useCallback((event) => {
    setNotificationAnchor(event.currentTarget);
  }, []);

  const handleNotificationMenuClose = useCallback(() => {
    setNotificationAnchor(null);
  }, []);

  const handleLogout = useCallback(() => {
    handleProfileMenuClose();
    logout();
  }, [logout, handleProfileMenuClose]);

  const handleSettings = useCallback(() => {
    handleProfileMenuClose();
    navigate('/settings');
  }, [navigate, handleProfileMenuClose]);

  return (
    <Fade in timeout={600}>
      <Box sx={{ 
        p: 3, 
        pb: 2,
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* En-tête principal */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3
        }}>
          {/* Titre et navigation des mois */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Zoom in timeout={800}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }}>
                <AccountBalance sx={{ color: 'white', fontSize: 28 }} />
              </Box>
            </Zoom>
            
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 0.5
              }}>
                {t('home.dashboard')}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Speed sx={{ fontSize: 16 }} />
                {t('home.smartDashboard')}
              </Typography>
            </Box>
          </Box>

          {/* Actions rapides */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Indicateur de connexion */}
            <Tooltip title={serverConnected ? t('home.serverConnected') : t('home.serverDisconnected')}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: serverConnected ? '#4caf50' : '#f44336',
                boxShadow: serverConnected ? '0 0 10px rgba(76, 175, 80, 0.5)' : '0 0 10px rgba(244, 67, 54, 0.5)'
              }} />
            </Tooltip>

            {/* Bouton de rafraîchissement */}
            <Tooltip title={t('home.refreshData')}>
              <IconButton 
                onClick={onRefresh}
                sx={{ 
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': { 
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            {showNotifications && (
              <Tooltip title={t('home.notifications')}>
                <IconButton 
                  onClick={handleNotificationMenuOpen}
                  sx={{ 
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': { background: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Badge badgeContent={unreadNotifications.length} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* Profil utilisateur */}
            <Tooltip title={t('home.profile')}>
              <IconButton 
                onClick={handleProfileMenuOpen}
                sx={{ 
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': { background: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Navigation des mois */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 3,
          p: 2,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <IconButton 
            onClick={() => navigateMonth('prev')}
            sx={{ 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': { 
                background: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: 'white',
              mb: 0.5
            }}>
              {getMonthName(selectedMonth, selectedYear)}
            </Typography>
            <Chip 
              label={t('home.currentPeriod')} 
              size="small" 
              sx={{ 
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontWeight: 500
              }}
            />
          </Box>

          <IconButton 
            onClick={() => navigateMonth('next')}
            sx={{ 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': { 
                background: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>

        {/* Indicateur d'abonnement */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mt: 2
        }}>
          <Chip
            icon={getSubscriptionIcon()}
            label={getSubscriptionText()}
            size="small"
            sx={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontWeight: 600,
              border: `1px solid ${getSubscriptionColor()}`,
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.05)'
              }
            }}
          />
        </Box>

        {/* Menu profil */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: {
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              mt: 1
            }
          }}
        >
          <MenuItem onClick={handleSettings} sx={{ color: 'white' }}>
            <Settings sx={{ mr: 2 }} />
            {t('home.settings')}
          </MenuItem>
          <Divider sx={{ background: 'rgba(255,255,255,0.1)' }} />
          <MenuItem onClick={handleLogout} sx={{ color: 'white' }}>
            <Logout sx={{ mr: 2 }} />
            {t('home.logout')}
          </MenuItem>
        </Menu>

        {/* Menu notifications */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationMenuClose}
          PaperProps={{
            sx: {
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              mt: 1,
              minWidth: 300
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {t('home.notifications')} ({unreadNotifications.length})
            </Typography>
          </Box>
          
          {notifications && notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification, index) => (
              <MenuItem key={index} sx={{ color: 'white', py: 1.5 }}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {notification.message}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {t('home.noNotifications')}
            </MenuItem>
          )}
          
          {notifications && notifications.length > 0 && (
            <>
              <Divider sx={{ background: 'rgba(255,255,255,0.1)' }} />
              <MenuItem 
                onClick={() => {
                  clearNotifications();
                  handleNotificationMenuClose();
                }}
                sx={{ color: 'white' }}
              >
                {t('home.clearAll')}
              </MenuItem>
            </>
          )}
        </Menu>
      </Box>
    </Fade>
  );
});

SmartHeader.displayName = 'SmartHeader';

export default SmartHeader; 