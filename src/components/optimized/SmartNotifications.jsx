import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Box, 
  Snackbar, 
  Alert, 
  AlertTitle, 
  IconButton, 
  Typography, 
  Chip,
  Fade,
  Slide,
  Paper
} from '@mui/material';
import {
  Notifications,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Info,
  Close,
  Star,
  Diamond,
  Savings,
  AttachMoney
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';

// Types de notifications
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
  ERROR: 'error',
  ACHIEVEMENT: 'achievement',
  GOAL: 'goal',
  BUDGET: 'budget',
  SAVINGS: 'savings'
};

// Configuration des notifications
const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.SUCCESS]: {
    icon: <CheckCircle />,
    color: '#4caf50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4caf50'
  },
  [NOTIFICATION_TYPES.WARNING]: {
    icon: <Warning />,
    color: '#ff9800',
    bgColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: '#ff9800'
  },
  [NOTIFICATION_TYPES.INFO]: {
    icon: <Info />,
    color: '#2196f3',
    bgColor: 'rgba(33, 150, 243, 0.1)',
    borderColor: '#2196f3'
  },
  [NOTIFICATION_TYPES.ERROR]: {
    icon: <Warning />,
    color: '#f44336',
    bgColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#f44336'
  },
  [NOTIFICATION_TYPES.ACHIEVEMENT]: {
    icon: <Star />,
    color: '#ffd700',
    bgColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#ffd700'
  },
  [NOTIFICATION_TYPES.GOAL]: {
    icon: <Diamond />,
    color: '#9c27b0',
    bgColor: 'rgba(156, 39, 176, 0.1)',
    borderColor: '#9c27b0'
  },
  [NOTIFICATION_TYPES.BUDGET]: {
    icon: <AttachMoney />,
    color: '#2196f3',
    bgColor: 'rgba(33, 150, 243, 0.1)',
    borderColor: '#2196f3'
  },
  [NOTIFICATION_TYPES.SAVINGS]: {
    icon: <Savings />,
    color: '#4caf50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4caf50'
  }
};

// Composant de notification individuelle
const SmartNotification = memo(({ 
  notification, 
  onClose, 
  onAction 
}) => {
  const { t } = useTranslation();
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG[NOTIFICATION_TYPES.INFO];

  return (
    <Slide direction="left" in={true} mountOnEnter unmountOnExit>
      <Paper
        sx={{
          mb: 2,
          p: 2,
          background: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: 3,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ 
            color: config.color, 
            mt: 0.5,
            display: 'flex',
            alignItems: 'center'
          }}>
            {config.icon}
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600, 
                color: config.color 
              }}>
                {notification.title}
              </Typography>
              {notification.priority === 'high' && (
                <Chip 
                  label={t('notifications.priority.high')} 
                  size="small" 
                  sx={{ 
                    bgcolor: config.color, 
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20
                  }} 
                />
              )}
            </Box>
            
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              mb: notification.action ? 1 : 0
            }}>
              {notification.message}
            </Typography>
            
            {notification.action && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={notification.action.label}
                  size="small"
                  onClick={() => onAction(notification.action)}
                  sx={{
                    bgcolor: config.color,
                    color: 'white',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: `${config.color}dd`
                    }
                  }}
                />
              </Box>
            )}
          </Box>
          
          <IconButton
            size="small"
            onClick={() => onClose(notification.id)}
            sx={{ 
              color: 'rgba(255,255,255,0.6)',
              '&:hover': { color: 'white' }
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    </Slide>
  );
});

SmartNotification.displayName = 'SmartNotification';

// Hook pour les notifications intelligentes
export const useSmartNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { t } = useTranslation();
  const store = useStore();

  // Ajouter une notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: Date.now(),
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    
    // Auto-remove après 8 secondes
    setTimeout(() => {
      removeNotification(id);
    }, 8000);
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Analyser les données et générer des notifications intelligentes
  const analyzeAndNotify = useCallback(() => {
    const { expenses, incomeTransactions, selectedMonth, selectedYear } = store;
    
    // Calculer les métriques
    const currentMonthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
    });
    
    const currentMonthIncome = incomeTransactions.filter(i => {
      const incomeDate = new Date(i.date);
      return incomeDate.getMonth() === selectedMonth && incomeDate.getFullYear() === selectedYear;
    });
    
    const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = currentMonthIncome.reduce((sum, i) => sum + i.amount, 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    // Notifications intelligentes basées sur les données
    if (savingsRate >= 20) {
      addNotification({
        type: NOTIFICATION_TYPES.ACHIEVEMENT,
        title: t('notifications.achievements.excellentSavings'),
        message: t('notifications.achievements.excellentSavingsMessage', { rate: savingsRate.toFixed(1) }),
        priority: 'high'
      });
    } else if (savingsRate < 10) {
      addNotification({
        type: NOTIFICATION_TYPES.WARNING,
        title: t('notifications.warnings.lowSavings'),
        message: t('notifications.warnings.lowSavingsMessage', { rate: savingsRate.toFixed(1) }),
        priority: 'high',
        action: {
          label: t('notifications.actions.createSavingsPlan'),
          action: 'createSavingsPlan'
        }
      });
    }

    // Notification pour les dépenses élevées
    if (totalExpenses > totalIncome * 0.9) {
      addNotification({
        type: NOTIFICATION_TYPES.WARNING,
        title: t('notifications.warnings.highExpenses'),
        message: t('notifications.warnings.highExpensesMessage'),
        priority: 'medium',
        action: {
          label: t('notifications.actions.reviewExpenses'),
          action: 'reviewExpenses'
        }
      });
    }

    // Notification pour les objectifs atteints
    if (savings > 0 && savings >= totalIncome * 0.3) {
      addNotification({
        type: NOTIFICATION_TYPES.GOAL,
        title: t('notifications.goals.savingsGoalReached'),
        message: t('notifications.goals.savingsGoalReachedMessage', { amount: savings.toFixed(0) }),
        priority: 'high'
      });
    }
  }, [store, addNotification, t]);

  // Analyser périodiquement
  useEffect(() => {
    const interval = setInterval(analyzeAndNotify, 30000); // Toutes les 30 secondes
    return () => clearInterval(interval);
  }, [analyzeAndNotify]);

  return {
    notifications,
    addNotification,
    removeNotification,
    analyzeAndNotify
  };
};

// Composant principal des notifications
const SmartNotifications = memo(() => {
  const { notifications, removeNotification } = useSmartNotifications();

  const handleAction = useCallback((action) => {
    console.log('Action clicked:', action);
    // Implémenter les actions ici
  }, []);

  if (notifications.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: 400,
        width: '100%'
      }}
    >
      {notifications.map((notification) => (
        <SmartNotification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
          onAction={handleAction}
        />
      ))}
    </Box>
  );
});

SmartNotifications.displayName = 'SmartNotifications';

export default SmartNotifications; 