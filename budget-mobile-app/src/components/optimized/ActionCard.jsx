import React, { memo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  Tooltip,
  Zoom,
  Fade
} from '@mui/material';

const ActionCard = memo(({ 
  icon: Icon, 
  label, 
  description, 
  color = "#4caf50", 
  onClick, 
  variant = "secondary",
  disabled = false,
  badge = null
}) => {
  const isPrimary = variant === "primary";
  
  const getCardStyles = () => {
    const baseStyles = {
      p: isPrimary ? 3 : 2,
      borderRadius: 3,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': disabled ? {} : {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 35px ${color}40`,
      }
    };

    if (isPrimary) {
      return {
        ...baseStyles,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: `0 8px 25px ${color}30`,
        border: '1px solid rgba(255,255,255,0.2)',
        '&:hover': disabled ? {} : {
          ...baseStyles['&:hover'],
          background: `linear-gradient(135deg, ${color}dd 0%, ${color}bb 100%)`,
        }
      };
    }

    return {
      ...baseStyles,
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      '&:hover': disabled ? {} : {
        ...baseStyles['&:hover'],
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.3)',
      }
    };
  };

  const getIconStyles = () => ({
    fontSize: isPrimary ? 32 : 24,
    color: isPrimary ? 'white' : color,
    mb: isPrimary ? 2 : 1,
    filter: isPrimary ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
  });

  const getLabelStyles = () => ({
    fontWeight: isPrimary ? 700 : 600,
    color: isPrimary ? 'white' : 'white',
    fontSize: isPrimary ? '1.1rem' : '0.9rem',
    mb: isPrimary ? 1 : 0.5,
    textShadow: isPrimary ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
  });

  const getDescriptionStyles = () => ({
    color: isPrimary ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
    fontSize: isPrimary ? '0.9rem' : '0.8rem',
    fontWeight: 400,
    textAlign: 'center'
  });

  return (
    <Fade in timeout={800}>
      <Box
        sx={getCardStyles()}
        onClick={disabled ? undefined : onClick}
        component={disabled ? 'div' : 'button'}
      >
        {/* Badge */}
        {badge && (
          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
          }}>
            {badge}
          </Box>
        )}

        {/* Contenu principal */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center',
          opacity: disabled ? 0.5 : 1
        }}>
          {/* Icône */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: isPrimary ? 2 : 1
          }}>
            <Icon sx={getIconStyles()} />
          </Box>

          {/* Label */}
          <Typography variant="h6" sx={getLabelStyles()}>
            {label}
          </Typography>

          {/* Description */}
          {description && (
            <Typography variant="body2" sx={getDescriptionStyles()}>
              {description}
            </Typography>
          )}
        </Box>

        {/* Effet de brillance au survol */}
        {!disabled && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s ease',
            '&:hover': {
              left: '100%'
            }
          }} />
        )}
      </Box>
    </Fade>
  );
});

const QuickActionsSection = memo(({ actions, t }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 700, 
          mb: 3,
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}
      >
        {t('home.quickActions')}
      </Typography>
      
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 2
      }}>
        {actions.map((action, index) => (
          <Zoom in timeout={800 + index * 100} key={action.label}>
            <Box>
              <ActionCard
                icon={action.icon}
                label={action.label}
                description={action.description}
                color={action.color}
                onClick={action.onClick}
                variant={action.variant}
                disabled={action.disabled}
                badge={action.badge}
              />
            </Box>
          </Zoom>
        ))}
      </Box>
    </Box>
  );
});

ActionCard.displayName = 'ActionCard';
QuickActionsSection.displayName = 'QuickActionsSection';

export { ActionCard, QuickActionsSection };
export default ActionCard; 