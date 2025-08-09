import React, { memo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Chip,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Notifications,
  Refresh,
  AccountCircle,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import Badge from '@mui/material/Badge';
import SpinLauncher from './SpinLauncher';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeaderSection = memo(({ 
  user, 
  selectedMonth, 
  selectedYear, 
  navigateMonth, 
  getMonthName, 
  getSubscriptionIcon, 
  getSubscriptionText, 
  getSubscriptionColor, 
  serverConnected, 
  logout,
  balanceTrend = 0,
  onQuickAdd,
  onRefresh
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getTrendIcon = () => {
    if (balanceTrend > 0) return <TrendingUp sx={{ color: '#4caf50' }} />;
    if (balanceTrend < 0) return <TrendingDown sx={{ color: '#f44336' }} />;
    return null;
  };

  const getTrendColor = () => {
    if (balanceTrend > 0) return '#4caf50';
    if (balanceTrend < 0) return '#f44336';
    return '#ff9800';
  };

  const { unreadCount = 0 } = useStore();

  return (
    <Fade in timeout={1000}>
      <Box sx={{ mb: 4 }}>
        {/* En-tête principal */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          {/* Salutation et informations utilisateur */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                mb: 1
              }}
            >
              {t('home.hello')}{user?.name ? `, ${user.name}` : ''}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                  letterSpacing: '0.5px'
                }}
              >
                {getMonthName(selectedMonth, selectedYear)}
              </Typography>
              
              {getTrendIcon() && (
                <Tooltip title={`Tendance: ${balanceTrend > 0 ? '+' : ''}${balanceTrend}%`} arrow>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getTrendIcon()}
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Box>
          
          {/* Actions rapides */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Indicateur de connexion */}
            <Tooltip title={serverConnected ? 'Connecté' : 'Mode hors ligne'} arrow>
              <Chip
                size="small"
                icon={serverConnected ? 
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} /> :
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff9800' }} />
                }
                label={serverConnected ? 'En ligne' : 'Hors ligne'}
                sx={{
                  bgcolor: serverConnected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </Tooltip>

            {/* Bouton notifications avec badge */}
            <Tooltip title="Notifications" arrow>
              <IconButton
                sx={{
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <Badge color="secondary" variant={unreadCount > 0 ? 'standard' : 'dot'} badgeContent={unreadCount} overlap="circular">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Roulette d'épargne (spins) */}
            <SpinLauncher />

            {/* Bouton rafraîchir */}
            <Tooltip title="Rafraîchir les données" arrow>
              <IconButton
                onClick={onRefresh}
                sx={{
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>

            {/* Bouton profil */}
            <Tooltip title="Profil" arrow>
              <IconButton
                onClick={() => navigate('/settings')}
                sx={{
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Navigation temporelle intuitive */}
        <Zoom in timeout={1200}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            p: 2,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Tooltip title="Mois précédent" arrow>
              <IconButton
                onClick={() => navigateMonth('prev')}
                sx={{
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>

            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 0.5
                }}
              >
                {getMonthName(selectedMonth, selectedYear)}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontStyle: 'italic'
                }}
              >
                Cliquez pour changer de période
              </Typography>
            </Box>

            <Tooltip title="Mois suivant" arrow>
              <IconButton
                onClick={() => navigateMonth('next')}
                sx={{
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ArrowForward />
              </IconButton>
            </Tooltip>
          </Box>
        </Zoom>

        {/* Indicateur d'abonnement */}
        {getSubscriptionText() && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 2 
          }}>
            <Tooltip title={getSubscriptionText()} arrow>
              <Chip
                icon={getSubscriptionIcon()}
                label={getSubscriptionText()}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s ease'
                  }
                }}
              />
            </Tooltip>
          </Box>
        )}
      </Box>
    </Fade>
  );
});

HeaderSection.displayName = 'HeaderSection';

export default HeaderSection; 