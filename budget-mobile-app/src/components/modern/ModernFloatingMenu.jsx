import React, { useState, useCallback, memo } from 'react';
import { 
  Box, 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  SmartToy,
  Psychology,
  TrendingUp,
  Settings,
  AttachMoney,
  Savings,
  Notifications
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DESIGN_SYSTEM } from '../../theme/designSystem';

const ModernFloatingMenu = memo(() => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const actions = [
    {
      icon: <Add />,
      name: t('floatingMenu.quickAdd'),
      action: () => {
        // Ouvrir le modal d'ajout rapide
        console.log('Quick Add');
        handleClose();
      },
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      icon: <SmartToy />,
      name: t('floatingMenu.aiDashboard'),
      action: () => {
        navigate('/ai-dashboard');
        handleClose();
      },
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    {
      icon: <Psychology />,
      name: t('floatingMenu.gamification'),
      action: () => {
        navigate('/gamification');
        handleClose();
      },
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
    },
    {
      icon: <TrendingUp />,
      name: t('floatingMenu.analytics'),
      action: () => {
        navigate('/analytics');
        handleClose();
      },
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      icon: <AttachMoney />,
      name: t('floatingMenu.expenses'),
      action: () => {
        navigate('/expenses');
        handleClose();
      },
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    {
      icon: <Savings />,
      name: t('floatingMenu.savings'),
      action: () => {
        navigate('/savings');
        handleClose();
      },
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      icon: <Notifications />,
      name: t('floatingMenu.notifications'),
      action: () => {
        // Ouvrir les notifications
        console.log('Notifications');
        handleClose();
      },
      color: '#6b7280',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
    },
    {
      icon: <Settings />,
      name: t('floatingMenu.settings'),
      action: () => {
        navigate('/settings');
        handleClose();
      },
      color: '#6b7280',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
    }
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: isMobile ? 20 : 40,
        right: isMobile ? 20 : 40,
        zIndex: theme.zIndex.fab,
      }}
    >
      <SpeedDial
        ariaLabel={t('floatingMenu.ariaLabel')}
        sx={{
          '& .MuiFab-primary': {
            width: 64,
            height: 64,
            background: DESIGN_SYSTEM.gradients.primary,
            boxShadow: DESIGN_SYSTEM.shadows.glow.primary,
            transition: `all ${DESIGN_SYSTEM.transitions.duration.normal} ${DESIGN_SYSTEM.transitions.easing.ease}`,
            '&:hover': {
              background: DESIGN_SYSTEM.gradients.primary,
              transform: 'scale(1.05)',
              boxShadow: DESIGN_SYSTEM.shadows.glow.primary,
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          },
          '& .MuiSpeedDialIcon-icon': {
            fontSize: 28,
            color: 'white',
          },
          '& .MuiSpeedDialIcon-openIcon': {
            fontSize: 28,
            color: 'white',
          }
        }}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
        FabProps={{
          size: 'large',
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
            sx={{
              '& .MuiFab-root': {
                width: 56,
                height: 56,
                background: action.gradient,
                boxShadow: `0 8px 25px ${action.color}40`,
                transition: `all ${DESIGN_SYSTEM.transitions.duration.normal} ${DESIGN_SYSTEM.transitions.easing.ease}`,
                '&:hover': {
                  background: action.gradient,
                  transform: 'scale(1.1)',
                  boxShadow: `0 12px 35px ${action.color}60`,
                },
                '&:active': {
                  transform: 'scale(0.95)',
                }
              },
              '& .MuiSpeedDialAction-staticTooltip': {
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                boxShadow: DESIGN_SYSTEM.shadows.lg,
                borderRadius: DESIGN_SYSTEM.borderRadius.xl,
                '& .MuiSpeedDialAction-staticTooltipLabel': {
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                  fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                }
              }
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
});

ModernFloatingMenu.displayName = 'ModernFloatingMenu';

export default ModernFloatingMenu; 