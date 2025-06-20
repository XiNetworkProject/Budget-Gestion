import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import notificationService from '../services/notificationService';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  LinearProgress
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  TrendingUp
} from '@mui/icons-material';

const LimitNotification = () => {
  const { t } = useTranslation();
  const { 
    getCurrentPlan, 
    checkUsageLimit, 
    hasSpecialAccess,
    transactions,
    savings,
    expenses,
    categories
  } = useStore();

  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);

  // Vérifier toutes les limites d'utilisation
  useEffect(() => {
    if (hasSpecialAccess()) return; // Pas de notifications pour les accès spéciaux

    const currentPlan = getCurrentPlan();
    const newNotifications = [];

    // Vérifier les transactions
    const transactionLimit = checkUsageLimit('maxTransactions', transactions?.length || 0);
    if (!transactionLimit.allowed) {
      newNotifications.push({
        type: 'error',
        message: t('notifications.limitReachedMessage'),
        action: 'upgrade',
        feature: 'transactions'
      });
    } else if (transactionLimit.remaining < 10) {
      newNotifications.push({
        type: 'warning',
        message: t('restrictions.usageWarning', { 
          remaining: transactionLimit.remaining,
          feature: t('restrictions.features.maxTransactions')
        }),
        action: 'upgrade',
        feature: 'transactions'
      });
    }

    // Vérifier les objectifs d'épargne
    const savingsLimit = checkUsageLimit('maxSavingsGoals', savings?.length || 0);
    if (!savingsLimit.allowed) {
      newNotifications.push({
        type: 'error',
        message: t('notifications.limitReachedMessage'),
        action: 'upgrade',
        feature: 'savings'
      });
    } else if (savingsLimit.remaining < 3) {
      newNotifications.push({
        type: 'warning',
        message: t('restrictions.usageWarning', { 
          remaining: savingsLimit.remaining,
          feature: t('restrictions.features.maxSavingsGoals')
        }),
        action: 'upgrade',
        feature: 'savings'
      });
    }

    // Vérifier les catégories
    const categoryLimit = checkUsageLimit('maxCategories', categories?.length || 0);
    if (!categoryLimit.allowed) {
      newNotifications.push({
        type: 'error',
        message: t('notifications.limitReachedMessage'),
        action: 'upgrade',
        feature: 'categories'
      });
    } else if (categoryLimit.remaining < 5) {
      newNotifications.push({
        type: 'warning',
        message: t('restrictions.usageWarning', { 
          remaining: categoryLimit.remaining,
          feature: t('restrictions.features.maxCategories')
        }),
        action: 'upgrade',
        feature: 'categories'
      });
    }

    setNotifications(newNotifications);
  }, [transactions?.length, savings?.length, categories?.length, hasSpecialAccess]);

  // Afficher les notifications une par une
  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      setCurrentNotification(notifications[0]);
    }
  }, [notifications, currentNotification]);

  const handleClose = () => {
    setCurrentNotification(null);
    setNotifications(prev => prev.slice(1));
  };

  const handleUpgrade = () => {
    window.location.href = '/subscription';
    handleClose();
  };

  if (!currentNotification) return null;

  return (
    <Snackbar
      open={!!currentNotification}
      autoHideDuration={currentNotification.type === 'error' ? 8000 : 6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={currentNotification.type}
        action={
          currentNotification.action === 'upgrade' ? (
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleUpgrade}
              startIcon={<TrendingUp />}
            >
              {t('restrictions.upgradeNow')}
            </Button>
          ) : null
        }
        sx={{ width: '100%' }}
      >
        <Box>
          <Typography variant="body2">
            {currentNotification.message}
          </Typography>
          {currentNotification.feature && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={80} 
                color="warning"
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
          )}
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default LimitNotification; 