import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Lock,
  Star,
  TrendingUp,
  Warning
} from '@mui/icons-material';

const FeatureRestriction = ({ 
  feature, 
  currentUsage = 0, 
  children, 
  showUpgradeDialog = true,
  customMessage = null 
}) => {
  const { t } = useTranslation();
  const { 
    getCurrentPlan, 
    checkUsageLimit, 
    isFeatureAvailable,
    hasSpecialAccess 
  } = useStore();

  const currentPlan = getCurrentPlan();
  const isSpecialAccessUser = hasSpecialAccess();
  const isAvailable = isFeatureAvailable(feature);
  const usageLimit = checkUsageLimit(feature, currentUsage);

  // Si l'utilisateur a un accès spécial, tout est autorisé
  if (isSpecialAccessUser) {
    return children;
  }

  // Si la fonctionnalité n'est pas disponible
  if (!isAvailable) {
    return (
      <Box>
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
          <Lock sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t('restrictions.featureNotAvailable')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {customMessage || t('restrictions.upgradeRequired')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Star />}
            onClick={() => window.location.href = '/subscription'}
          >
            {t('restrictions.upgradeNow')}
          </Button>
        </Paper>
      </Box>
    );
  }

  // Si la limite d'utilisation est atteinte
  if (!usageLimit.allowed) {
    return (
      <Box>
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light' }}>
          <Warning sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t('restrictions.limitReached')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('restrictions.limitReachedDescription', { 
              feature: t(`restrictions.features.${feature}`),
              limit: currentPlan.features[feature]
            })}
          </Typography>
          <Button
            variant="contained"
            color="warning"
            startIcon={<TrendingUp />}
            onClick={() => window.location.href = '/subscription'}
          >
            {t('restrictions.upgradeToUnlock')}
          </Button>
        </Paper>
      </Box>
    );
  }

  // Si la fonctionnalité est disponible mais avec des limites
  if (usageLimit.remaining !== -1 && usageLimit.remaining < 10) {
    return (
      <Box>
        {children}
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            {t('restrictions.usageWarning', { 
              remaining: usageLimit.remaining,
              feature: t(`restrictions.features.${feature}`)
            })}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => window.location.href = '/subscription'}
          >
            {t('restrictions.upgradeForMore')}
          </Button>
        </Alert>
      </Box>
    );
  }

  // Si tout est OK, afficher le contenu normal
  return children;
};

// Composant pour afficher les statistiques d'utilisation
export const UsageStats = ({ feature, currentUsage }) => {
  const { t } = useTranslation();
  const { getCurrentPlan, checkUsageLimit } = useStore();
  
  const currentPlan = getCurrentPlan();
  const usageLimit = checkUsageLimit(feature, currentUsage);
  const limit = currentPlan.features[feature];
  
  if (limit === -1) return null; // Illimité
  
  const percentage = (currentUsage / limit) * 100;
  
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t(`restrictions.features.${feature}`)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentUsage} / {limit}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        color={percentage > 80 ? 'warning' : 'primary'}
        sx={{ height: 4, borderRadius: 2 }}
      />
    </Box>
  );
};

// Hook pour vérifier les restrictions
export const useFeatureRestriction = (feature, currentUsage = 0) => {
  const { 
    getCurrentPlan, 
    checkUsageLimit, 
    isFeatureAvailable,
    hasSpecialAccess 
  } = useStore();

  const currentPlan = getCurrentPlan();
  const isSpecialAccessUser = hasSpecialAccess();
  const isAvailable = isFeatureAvailable(feature);
  const usageLimit = checkUsageLimit(feature, currentUsage);

  return {
    isAvailable,
    isSpecialAccessUser,
    usageLimit,
    currentPlan,
    canUse: isSpecialAccessUser || (isAvailable && usageLimit.allowed),
    shouldShowWarning: usageLimit.remaining !== -1 && usageLimit.remaining < 10,
    percentage: usageLimit.remaining !== -1 ? ((currentUsage / currentPlan.features[feature]) * 100) : 0
  };
};

export default FeatureRestriction; 