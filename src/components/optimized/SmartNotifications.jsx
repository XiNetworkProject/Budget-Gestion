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
  onAction,
  mode = 'full'
}) => {
  const { t } = useTranslation();
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG[NOTIFICATION_TYPES.INFO];

  if (mode === 'minimal') {
    return (
      <Slide direction="left" in={true} mountOnEnter unmountOnExit>
        <Paper sx={{
          mb: 1,
          px: 1.25,
          py: 0.75,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          background: 'rgba(20,20,30,0.8)',
          border: `1px solid ${config.borderColor}`,
          color: 'rgba(255,255,255,0.9)'
        }}>
          <Box sx={{ color: config.color, display: 'flex', alignItems: 'center' }}>
            {config.icon}
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mr: 1 }}>
            {notification.title}
          </Typography>
          {notification.action && (
            <Chip size="small" label={notification.action.label} onClick={() => onAction(notification.action)} sx={{ ml: 'auto', bgcolor: config.color, color: 'white' }} />
          )}
          <IconButton size="small" onClick={() => onClose(notification.id)} sx={{ ml: 0.5, color: 'rgba(255,255,255,0.6)' }}>
            <Close fontSize="inherit" />
          </IconButton>
        </Paper>
      </Slide>
    );
  }

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
  const recentKeysRef = React.useRef(new Map());

  // Ajouter une notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: Date.now(),
      ...notification
    };
    // Déduplication simple sur 2 minutes
    const key = `${notification.type}|${notification.title}|${notification.message}`;
    const now = Date.now();
    const last = recentKeysRef.current.get(key) || 0;
    if (now - last < 120000) return;
    recentKeysRef.current.set(key, now);

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
    const {
      expenses,
      incomeTransactions,
      selectedMonth,
      selectedYear,
      budgetLimits,
      savings,
      subscription,
      appSettings,
      gamification
    } = store;
    if (appSettings?.notifications?.mode === 'off') return;
    
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
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

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

    // Objectifs d'épargne (milestones)
    if (Array.isArray(savings) && savings.length > 0) {
      savings.forEach((goal) => {
        const target = Number(goal.target) || 0;
        const current = Number(goal.current) || 0;
        if (target > 0) {
          const progress = (current / target) * 100;
          if (progress >= 100) {
            addNotification({ type: NOTIFICATION_TYPES.SAVINGS, title: 'Objectif atteint', message: `"${goal.name}" atteint (${target.toLocaleString()}€).`, priority: 'high' });
          } else if (progress >= 80) {
            addNotification({ type: NOTIFICATION_TYPES.SAVINGS, title: 'Objectif bientôt atteint', message: `"${goal.name}" à ${progress.toFixed(0)}%.`, priority: 'medium' });
          }
        }
      });
    }

    // Spins disponibles (rappel discret)
    if (gamification && Number(gamification.spins || 0) > 0) {
      addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title: 'Spin disponible',
        message: `${gamification.spins} spin(s) à utiliser`,
        priority: 'low',
        action: { label: 'Tourner', action: 'openSpin' }
      });
    }
    if (gamification && gamification.lastDailyGrant) {
      const last = new Date(gamification.lastDailyGrant);
      const today = new Date();
      const sameDay = last.getFullYear() === today.getFullYear() && last.getMonth() === today.getMonth() && last.getDate() === today.getDate();
      if (!sameDay) {
        addNotification({ type: NOTIFICATION_TYPES.INFO, title: 'Spin quotidien', message: 'Votre spin quotidien est dispo', priority: 'low', action: { label: 'Obtenir', action: 'openSpin' } });
      }
    }

    // Dépassement / seuils budgétaires par catégorie
    if (budgetLimits && typeof budgetLimits === 'object') {
      const byCategory = currentMonthExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
        return acc;
      }, {});
      Object.entries(budgetLimits).forEach(([cat, limit]) => {
        const l = Number(limit) || 0;
        if (l <= 0) return;
        const spent = byCategory[cat] || 0;
        if (spent >= l) {
          addNotification({ type: NOTIFICATION_TYPES.BUDGET, title: `Budget dépassé: ${cat}`, message: `${spent.toLocaleString()}€ / ${l.toLocaleString()}€`, priority: 'high', action: { label: 'Analyser', action: 'reviewExpenses' } });
        } else if (spent >= l * 0.8) {
          addNotification({ type: NOTIFICATION_TYPES.BUDGET, title: `Budget proche: ${cat}`, message: `${spent.toLocaleString()}€ (≥80% de ${l.toLocaleString()}€)`, priority: 'medium', action: { label: 'Analyser', action: 'reviewExpenses' } });
        }
      });
    }

    // Paiements récurrents imminents / en retard (3 jours)
    const today = new Date();
    const inDays = (d) => {
      const diff = Math.ceil((d.setHours(0,0,0,0) - new Date(today).setHours(0,0,0,0)) / (1000*60*60*24));
      return diff;
    };
    const nextDate = (start, type) => {
      let next = new Date(start);
      while (next < today) {
        if (type === 'daily') next.setDate(next.getDate() + 1);
        else if (type === 'weekly') next.setDate(next.getDate() + 7);
        else if (type === 'monthly') next = new Date(next.getFullYear(), next.getMonth() + 1, next.getDate());
        else if (type === 'yearly') next = new Date(next.getFullYear() + 1, next.getMonth(), next.getDate());
        else break;
      }
      return next;
    };
    (expenses || []).forEach((e) => {
      if (!e.recurring) return;
      const n = nextDate(new Date(e.date), e.recurringType);
      const d = inDays(new Date(n));
      if (d < 0) addNotification({ type: NOTIFICATION_TYPES.WARNING, title: 'Paiement en retard', message: `${e.description || e.category} en retard de ${Math.abs(d)} j.`, priority: 'high' });
      else if (d <= 3) addNotification({ type: NOTIFICATION_TYPES.INFO, title: 'Paiement imminent', message: `${e.description || e.category} dans ${d} j.`, priority: 'medium' });
    });
    (incomeTransactions || []).forEach((i) => {
      if (!i.recurring) return;
      const n = nextDate(new Date(i.date), i.recurringType);
      const d = inDays(new Date(n));
      if (d < 0) addNotification({ type: NOTIFICATION_TYPES.INFO, title: 'Revenu en retard', message: `${i.description || i.type} en retard de ${Math.abs(d)} j.`, priority: 'low' });
      else if (d <= 3) addNotification({ type: NOTIFICATION_TYPES.INFO, title: 'Revenu imminent', message: `${i.description || i.type} dans ${d} j.`, priority: 'low' });
    });

    // Abonnement: fin d’essai proche (3 jours)
    if (subscription?.isTrialing && subscription?.trialEnd) {
      const trialEnd = new Date(subscription.trialEnd);
      const d = Math.ceil((trialEnd.setHours(0,0,0,0) - new Date(today).setHours(0,0,0,0)) / (1000*60*60*24));
      if (d <= 3) addNotification({ type: NOTIFICATION_TYPES.INFO, title: 'Fin d’essai', message: `Votre essai se termine dans ${Math.max(d, 0)} j.`, priority: 'medium', action: { label: 'Gérer', action: 'manageSubscription' } });
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
  const { appSettings } = useStore();
  const mode = appSettings?.notifications?.mode || 'full';

  const handleAction = useCallback((action) => {
    if (!action) return;
    if (action.action === 'openSpin') {
      try {
        const event = new CustomEvent('open-spin');
        window.dispatchEvent(event);
      } catch (_) {}
      return;
    }
    console.log('Action clicked:', action);
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
          mode={mode}
        />
      ))}
    </Box>
  );
});

SmartNotifications.displayName = 'SmartNotifications';

export default SmartNotifications; 