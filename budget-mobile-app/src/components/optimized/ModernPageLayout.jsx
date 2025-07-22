import React, { memo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Chip, 
  Tooltip, 
  Fade, 
  Zoom,
  Divider,
  LinearProgress,
  Avatar,
  Badge,
  Button,
  Fab
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Add,
  MoreVert,
  Star,
  Diamond,
  CardMembership,
  Notifications,
  Refresh,
  Info,
  CheckCircle,
  Warning,
  Error,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

// Composant pour les cartes de métriques modernes
export const ModernMetricCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  color = '#2196f3', 
  trend, 
  trendDirection = 'neutral',
  subtitle,
  onClick,
  loading = false,
  badge
}) => {
  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up': return <TrendingUp sx={{ color: '#4caf50' }} />;
      case 'down': return <TrendingDown sx={{ color: '#f44336' }} />;
      default: return null;
    }
  };

  return (
    <Zoom in timeout={300} mountOnEnter unmountOnExit>
      <Card
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'visible',
          '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            background: 'rgba(255,255,255,0.15)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          } : {}
        }}
      >
        {badge && (
          <Badge
            badgeContent={badge}
            color="error"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              '& .MuiBadge-badge': {
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
              }
            }}
          >
            <Box />
          </Badge>
        )}

        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2,
            position: 'relative'
          }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                boxShadow: `0 4px 16px ${color}40`,
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: `0 6px 20px ${color}60`,
                }
              }}
            >
              <Icon sx={{ fontSize: 28, color: 'white' }} />
            </Avatar>
          </Box>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
            {title}
          </Typography>
          
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: color }}>
            {loading ? '...' : value}
          </Typography>
          
          {subtitle && (
            <Typography variant="body2" sx={{ 
              opacity: 0.8, 
              fontWeight: 500,
              color: 'rgba(255,255,255,0.9)',
              mb: 1
            }}>
              {subtitle}
            </Typography>
          )}
          
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              {getTrendIcon()}
              <Typography variant="body2" sx={{ 
                color: trendDirection === 'up' ? '#4caf50' : trendDirection === 'down' ? '#f44336' : 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>
                {trend}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
});

// Composant pour les sections de page
export const ModernSection = memo(({ 
  title, 
  subtitle, 
  children, 
  action, 
  actionIcon: ActionIcon,
  onActionClick,
  loading = false,
  premium = false
}) => (
  <Fade in timeout={400} mountOnEnter unmountOnExit>
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
            {title}
            {premium && (
              <Star sx={{ ml: 1, fontSize: 20, color: '#FFD700' }} />
            )}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {action && (
          <Button
            variant="outlined"
            startIcon={ActionIcon && <ActionIcon />}
            onClick={onActionClick}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            {action}
          </Button>
        )}
      </Box>
      
      {loading ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Chargement...
          </Typography>
        </Box>
      ) : (
        children
      )}
    </Box>
  </Fade>
));

// Composant pour les listes modernes
export const ModernList = memo(({ 
  items, 
  renderItem, 
  emptyMessage = "Aucun élément",
  emptyIcon: EmptyIcon,
  loading = false
}) => (
  <Fade in timeout={500} mountOnEnter unmountOnExit>
    <Box>
      {loading ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Chargement...
          </Typography>
        </Box>
      ) : items && items.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item, index) => (
            <Zoom in timeout={300 + index * 100} key={item.id || index} mountOnEnter unmountOnExit>
              {renderItem(item, index)}
            </Zoom>
          ))}
        </Box>
      ) : (
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {EmptyIcon && (
            <EmptyIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
          )}
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {emptyMessage}
          </Typography>
        </Box>
      )}
    </Box>
  </Fade>
));

// Composant pour les actions rapides
export const QuickActionButton = memo(({ 
  icon: Icon, 
  label, 
  onClick, 
  color = '#4caf50',
  disabled = false
}) => (
  <Tooltip title={label} arrow>
    <IconButton
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: 48,
        height: 48,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: `0 4px 16px ${color}40`,
        color: 'white',
        '&:hover': {
          background: `linear-gradient(135deg, ${color}dd 0%, ${color}bb 100%)`,
          transform: 'scale(1.1)',
          boxShadow: `0 6px 20px ${color}60`,
        },
        '&:disabled': {
          background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.3)',
          boxShadow: 'none'
        }
      }}
    >
      <Icon />
    </IconButton>
  </Tooltip>
));

// Composant pour les statuts
export const StatusChip = memo(({ 
  status, 
  label, 
  icon: Icon 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      case 'info': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'warning': return <Warning sx={{ fontSize: 16 }} />;
      case 'error': return <Error sx={{ fontSize: 16 }} />;
      case 'info': return <Info sx={{ fontSize: 16 }} />;
      default: return Icon;
    }
  };

  return (
    <Chip
      icon={getStatusIcon()}
      label={label}
      size="small"
      sx={{
        background: `linear-gradient(135deg, ${getStatusColor()} 0%, ${getStatusColor()}dd 100%)`,
        color: 'white',
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: 'white'
        }
      }}
    />
  );
});

// Composant principal pour le layout de page
const ModernPageLayout = memo(({ 
  children, 
  title, 
  subtitle,
  actions,
  loading = false,
  showBackButton = false,
  onBackClick
}) => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      pb: 10 // Espace pour la navigation
    }}>
      {/* Header de page */}
      <Box sx={{ 
        p: 3, 
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions}
          </Box>
        </Box>
      </Box>

      {/* Contenu de la page */}
      <Box sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Chargement de la page...
            </Typography>
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
});

ModernPageLayout.displayName = 'ModernPageLayout';
ModernMetricCard.displayName = 'ModernMetricCard';
ModernSection.displayName = 'ModernSection';
ModernList.displayName = 'ModernList';
QuickActionButton.displayName = 'QuickActionButton';
StatusChip.displayName = 'StatusChip';

export default ModernPageLayout; 