import React, { memo, useState } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
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
  loading = false
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
            '&:hover': onClick ? {
              transform: 'translateY(-4px)',
              background: 'rgba(255,255,255,0.15)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            } : {}
          },
          icon: {
            fontSize: 32,
            color: color,
            mb: 2,
            filter: `drop-shadow(0 2px 4px ${color}40)`
          },
          title: {
            fontWeight: 600,
            color: color,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            mb: 1
          },
          value: {
            fontWeight: 900,
            color: color,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
          }
        };
      default:
        return {
          container: {
            p: 2,
            borderRadius: 3,
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
            fontSize: 28,
            color: color,
            mb: 1
          },
          title: {
            fontWeight: 600,
            color: 'white',
            mb: 1
          },
          value: {
            fontWeight: 700,
            color: 'white',
            mb: 1
          }
        };
    }
  };

  const styles = getVariantStyles();

  if (loading) {
    return (
      <Box sx={{
        ...styles.container,
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <Box sx={{ 
          width: styles.icon.fontSize, 
          height: styles.icon.fontSize, 
          borderRadius: '50%', 
          bgcolor: 'rgba(255,255,255,0.2)', 
          mb: 2,
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <Box sx={{ 
          width: '60%', 
          height: 20, 
          bgcolor: 'rgba(255,255,255,0.2)', 
          borderRadius: 1,
          mb: 1,
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <Box sx={{ 
          width: '40%', 
          height: 16, 
          bgcolor: 'rgba(255,255,255,0.1)', 
          borderRadius: 1,
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ...styles.container,
        animation: 'fadeInUp 0.6s ease-out'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: variant === 'elegant' ? 2 : 1 
        }}>
          {Icon && <Icon sx={styles.icon} />}
        </Box>
        
        <Typography variant="h6" sx={styles.title}>
          {title}
        </Typography>
        
        <Typography variant="h4" sx={styles.value}>
          {typeof value === 'number' ? <CurrencyFormatter amount={value} /> : value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" sx={{ 
            opacity: 0.8, 
            fontWeight: 500,
            color: 'rgba(255,255,255,0.9)'
          }}>
            {subtitle}
          </Typography>
        )}
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <Typography variant="body2" sx={{ 
              color: getTrendColor(),
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              {getTrendIcon()} {trend}
            </Typography>
          </Box>
        )}
        
        {progress !== undefined && (
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              mt: 2, 
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.2)', 
              '& .MuiLinearProgress-bar': { 
                bgcolor: color,
                borderRadius: 3
              } 
            }}
          />
        )}
        
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
          `}
        </style>
      </Box>
  );
});

KPICard.displayName = 'KPICard';

export default KPICard; 