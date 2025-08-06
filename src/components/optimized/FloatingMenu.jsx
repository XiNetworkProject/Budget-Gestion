import React, { useState, useCallback, memo } from 'react';
import { 
  Box, 
  Fab, 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon,
  Tooltip,
  Zoom
} from '@mui/material';
import {
  Add,
  SmartToy,
  Psychology,
  Notifications,
  TrendingUp,
  Settings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FloatingMenu = memo(({ onQuickAdd }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const actions = [
    {
      icon: <Add />,
      name: t('floatingMenu.quickAdd'),
      action: () => {
        onQuickAdd();
        handleClose();
      },
      color: '#4caf50'
    },
    {
      icon: <SmartToy />,
      name: t('floatingMenu.aiDashboard'),
      action: () => {
        navigate('/ai-dashboard');
        handleClose();
      },
      color: '#9c27b0'
    },
    {
      icon: <Psychology />,
      name: t('floatingMenu.gamification'),
      action: () => {
        navigate('/gamification');
        handleClose();
      },
      color: '#ff9800'
    },
    {
      icon: <TrendingUp />,
      name: t('floatingMenu.analytics'),
      action: () => {
        navigate('/analytics');
        handleClose();
      },
      color: '#2196f3'
    },
    {
      icon: <Settings />,
      name: t('floatingMenu.settings'),
      action: () => {
        navigate('/settings');
        handleClose();
      },
      color: '#607d8b'
    }
  ];

  return (
    <Box sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
      <SpeedDial
        ariaLabel={t('floatingMenu.ariaLabel')}
        sx={{
          '& .MuiFab-primary': {
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              transform: 'scale(1.05)',
              boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)',
            }
          }
        }}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
            sx={{
              '& .MuiFab-root': {
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                boxShadow: `0 6px 20px ${action.color}40`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${action.color}dd 0%, ${action.color}bb 100%)`,
                  transform: 'scale(1.1)',
                  boxShadow: `0 8px 25px ${action.color}60`,
                }
              }
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
});

FloatingMenu.displayName = 'FloatingMenu';

export default FloatingMenu; 