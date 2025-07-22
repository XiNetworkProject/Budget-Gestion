import React, { memo, useState } from 'react';
import { Box, Typography, LinearProgress, Zoom, Fade, Chip } from '@mui/material';
import CurrencyFormatter from '../CurrencyFormatter';

const KPICard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  color = '#2196f3', 
  subtitle, 
  progress, 
  trend, 
  trendDirection = 'neutral',
  onClick,
  variant = 'default',
  loading = false,
  badge = null,
  badgeColor = '#FF9800',
  isNew = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '';
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up': return '#4caf50';
      case 'down': return '#f44336';
      case 'stable': return '#ff9800';
      default: return 'rgba(255,255,255,0.7)';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: {
            p: 2,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.2s ease',
            cursor: onClick ? 'pointer' : 'default',
            position: 'relative',
            '&:hover': onClick ? {
              background: 'rgba(255,255,255,0.1)',
              transform: 'translateY(-2px)'
            } : {}
          },
          icon: {
            fontSize: 24,
            color: color,
            mb: 1
          },
          title: {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.8)',
            mb: 0.5
          },
          value: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
            mb: 0.5
          }
        };
      case 'elegant':
        return {
          container: {
            p: 3,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            cursor: onClick ? 'pointer' : 'default',
            minHeight: 210,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'visible',
            '&:hover': onClick ? {
              transform: 'translateY(-4px)',
              background: 'rgba(255,255,255,0.15)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              '& .kpi-icon': {
                transform: 'scale(1.1) rotate(5deg)',
              }
            } : {}
          },
          icon: {
            fontSize: 32,
            color: color,
            mb: 2,
            filter: `drop-shadow(0 2px 4px ${color}40)`,
            transition: 'all 0.3s ease'
          },
          title: {
            fontSize: '1rem',
            fontWeight: 600,
            color: 'white',
            mb: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          },
          value: {
            fontSize: '2rem',
            fontWeight: 700,
            color: 'white',
            mb: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          },
          subtitle: {
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 500
          }
        };
      default:
        return {
          container: {
            p: 2,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.2s ease',
            cursor: onClick ? 'pointer' : 'default',
            '&:hover': onClick ? {
              background: 'rgba(255,255,255,0.15)',
              transform: 'translateY(-2px)'
            } : {}
          },
          icon: {
            fontSize: 20,
            color: color,
            mb: 1
          },
          title: {
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.8)',
            mb: 0.5
          },
          value: {
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'white',
            mb: 0.5
          }
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Zoom in timeout={800}>
      <Box
        sx={styles.container}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge pour les nouvelles fonctionnalités */}
        {badge && (
          <Chip
            label={badge}
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: 16,
              zIndex: 2,
              background: badgeColor,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        )}

        {/* Indicateur de nouveauté */}
        {isNew && (
          <Box sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#FF6B6B',
            boxShadow: '0 0 8px rgba(255, 107, 107, 0.6)',
            animation: 'pulse 2s infinite'
          }} />
        )}

        {/* Icône */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: variant === 'elegant' ? 2 : 1 }}>
          <Icon 
            className="kpi-icon"
            sx={styles.icon} 
          />
        </Box>

        {/* Titre */}
        <Typography variant="h6" sx={styles.title}>
          {title}
        </Typography>

        {/* Valeur */}
        <Typography variant="h4" sx={styles.value}>
          {loading ? (
            <Box sx={{ 
              width: '60%', 
              height: '2rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: 1,
              mx: 'auto'
            }} />
          ) : (
            <CurrencyFormatter value={value} />
          )}
        </Typography>

        {/* Sous-titre */}
        {subtitle && (
          <Typography variant="body2" sx={styles.subtitle}>
            {subtitle}
          </Typography>
        )}

        {/* Tendance */}
        {trend && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mt: 1,
            gap: 0.5
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: getTrendColor(),
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {getTrendIcon()} {trend}
            </Typography>
          </Box>
        )}

        {/* Barre de progression */}
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                  borderRadius: 3,
                }
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                mt: 0.5,
                display: 'block',
                textAlign: 'center'
              }}
            >
              {Math.round(progress)}%
            </Typography>
          </Box>
        )}

        {/* Effet de brillance au survol */}
        {onClick && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            transition: 'left 0.5s ease',
            pointerEvents: 'none',
            '&:hover': {
              left: '100%'
            }
          }} />
        )}
      </Box>
    </Zoom>
  );
});

KPICard.displayName = 'KPICard';

export default KPICard; 