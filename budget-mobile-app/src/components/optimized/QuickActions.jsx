import React, { memo, useState, useCallback } from 'react';
import { 
  Box, 
  Fab, 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon,
  Tooltip,
  Zoom,
  Fade,
  Paper,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import {
  Add,
  AttachMoney,
  TrendingUp,
  Savings,
  Analytics,
  Settings,
  Add as AddIcon,
  Remove as RemoveIcon,
  AccountBalance,
  Assessment,
  Lightbulb,
  AutoAwesome,
  Speed,
  Security
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Composant de boutons d'action rapide ultra-optimisé
const QuickActions = memo(({ onQuickAdd, showQuickAdd = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [hoveredAction, setHoveredAction] = useState(null);

  // Actions rapides disponibles
  const actions = [
    {
      icon: <AddIcon />,
      name: t('home.addExpense'),
      action: () => onQuickAdd('expense'),
      color: '#f44336',
      description: t('home.addExpenseDescription'),
      shortcut: 'E'
    },
    {
      icon: <TrendingUp />,
      name: t('home.addIncome'),
      action: () => onQuickAdd('income'),
      color: '#4caf50',
      description: t('home.addIncomeDescription'),
      shortcut: 'I'
    },
    {
      icon: <Savings />,
      name: t('home.addSavings'),
      action: () => onQuickAdd('savings'),
      color: '#2196f3',
      description: t('home.addSavingsDescription'),
      shortcut: 'S'
    },
    {
      icon: <Analytics />,
      name: t('home.viewAnalytics'),
      action: () => navigate('/analytics'),
      color: '#ff9800',
      description: t('home.viewAnalyticsDescription'),
      shortcut: 'A'
    },
    {
      icon: <Assessment />,
      name: t('home.actionPlans'),
      action: () => navigate('/action-plans'),
      color: '#9c27b0',
      description: t('home.actionPlansDescription'),
      shortcut: 'P'
    }
  ];

  // Gestionnaires d'événements
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleActionClick = useCallback((action) => {
    handleClose();
    action();
  }, [handleClose]);

  const handleMouseEnter = useCallback((actionName) => {
    setHoveredAction(actionName);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredAction(null);
  }, []);

  // Raccourcis clavier
  React.useEffect(() => {
    const handleKeyPress = (event) => {
      const action = actions.find(a => a.shortcut.toLowerCase() === event.key.toLowerCase());
      if (action) {
        event.preventDefault();
        action.action();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [actions]);

  return (
    <>
      {/* Bouton principal flottant */}
      <Box sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
        <Zoom in timeout={800}>
          <SpeedDial
            ariaLabel={t('home.quickActions')}
            sx={{
              '& .MuiFab-primary': {
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  transform: 'scale(1.1)',
                  boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)'
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
                tooltipTitle={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{action.name}</Typography>
                    <Chip 
                      label={action.shortcut} 
                      size="small" 
                      sx={{ 
                        height: 16, 
                        fontSize: '0.7rem',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }} 
                    />
                  </Box>
                }
                tooltipPlacement="left"
                onClick={() => handleActionClick(action.action)}
                sx={{
                  background: action.color,
                  color: 'white',
                  '&:hover': {
                    background: action.color,
                    transform: 'scale(1.1)',
                    boxShadow: `0 8px 25px ${action.color}40`
                  }
                }}
              />
            ))}
          </SpeedDial>
        </Zoom>
      </Box>

      {/* Bouton d'ajout rapide principal */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
        <Zoom in timeout={1000}>
          <Tooltip 
            title={t('home.quickAdd')}
            placement="left"
            arrow
          >
            <Fab
              color="primary"
              aria-label={t('home.quickAdd')}
              onClick={() => onQuickAdd('general')}
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                  transform: 'scale(1.1) rotate(90deg)',
                  boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Add sx={{ fontSize: 28 }} />
            </Fab>
          </Tooltip>
        </Zoom>
      </Box>

      {/* Indicateur de raccourcis clavier */}
      <Fade in timeout={2000}>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            p: 2,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            zIndex: 999,
            maxWidth: 300
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 1 }}>
            {t('home.keyboardShortcuts')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {actions.slice(0, 3).map((action) => (
              <Chip
                key={action.shortcut}
                label={`${action.shortcut}: ${action.name}`}
                size="small"
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)'
                  }
                }}
              />
            ))}
          </Box>
        </Paper>
      </Fade>

      {/* Indicateur de performance */}
      <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 999 }}>
        <Fade in timeout={3000}>
          <Paper
            sx={{
              p: 1.5,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Speed sx={{ color: '#4caf50', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
              {t('home.ultraOptimized')}
            </Typography>
            <AutoAwesome sx={{ color: '#FFD700', fontSize: 14 }} />
          </Paper>
        </Fade>
      </Box>

      {/* Indicateur de sécurité */}
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 999 }}>
        <Fade in timeout={4000}>
          <Paper
            sx={{
              p: 1.5,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Security sx={{ color: '#4caf50', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
              {t('home.secureConnection')}
            </Typography>
          </Paper>
        </Fade>
      </Box>
    </>
  );
});

QuickActions.displayName = 'QuickActions';

export default QuickActions; 