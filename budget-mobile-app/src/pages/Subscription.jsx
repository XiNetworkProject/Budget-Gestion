import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Fade,
  Zoom,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar
} from '@mui/material';
import {
  CheckCircle,
  Close,
  Star,
  Diamond,
  LocalOffer,
  CreditCard,
  Security,
  Analytics,
  Savings,
  Timeline,
  AccountBalance,
  Support,
  CloudSync,
  Psychology,
  TrendingUp,
  Cancel,
  Edit
} from '@mui/icons-material';

const Subscription = () => {
  const { t } = useTranslation();
  const {
    subscriptionPlans,
    getCurrentPlan,
    hasSpecialAccess,
    isFeatureAvailable,
    checkUsageLimit,
    applyPromoCode,
    removePromoCode,
    appliedPromoCode,
    promoCodeDiscount,
    updateSubscription,
    cancelSubscription,
    resetSubscription,
    expenses,
    savings,
    transactions
  } = useStore();

  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const currentPlan = getCurrentPlan();
  const isSpecialAccess = hasSpecialAccess();

  // Calculer l'utilisation actuelle
  const currentUsage = {
    transactions: transactions?.length || 0,
    savingsGoals: savings?.length || 0,
    actionPlans: 0 // À implémenter quand les plans d'action seront créés
  };

  const handlePromoCodeSubmit = () => {
    if (applyPromoCode(promoCode)) {
      setShowPromoDialog(false);
      setPromoCode('');
    }
  };

  const handleUpgrade = (planId) => {
    // Simulation d'upgrade (à remplacer par l'intégration Stripe)
    updateSubscription(planId);
  };

  const handleCancelSubscription = () => {
    cancelSubscription();
    setShowCancelDialog(false);
  };

  const handleResetSubscription = () => {
    resetSubscription();
    setShowResetDialog(false);
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      maxTransactions: <TrendingUp />,
      unlimitedCategories: <AccountBalance />,
      maxSavingsGoals: <Savings />,
      basicAnalytics: <Analytics />,
      aiAnalysis: <Psychology />,
      maxActionPlans: <Timeline />,
      multipleAccounts: <AccountBalance />,
      prioritySupport: <Support />,
      advancedReports: <CloudSync />
    };
    return icons[feature] || <CheckCircle />;
  };

  const getFeatureLabel = (feature) => {
    const labels = {
      maxTransactions: t('subscription.features.transactions'),
      unlimitedCategories: t('subscription.features.categories'),
      maxSavingsGoals: t('subscription.features.savingsGoals'),
      basicAnalytics: t('subscription.features.analytics'),
      aiAnalysis: t('subscription.features.aiAnalysis'),
      maxActionPlans: t('subscription.features.actionPlans'),
      multipleAccounts: t('subscription.features.multipleAccounts'),
      prioritySupport: t('subscription.features.prioritySupport'),
      advancedReports: t('subscription.features.advancedReports')
    };
    return labels[feature] || feature;
  };

  const getFeatureValue = (plan, feature) => {
    const value = plan.features[feature];
    if (value === -1) return t('subscription.unlimited');
    if (value === false || value === 0) return t('subscription.notAvailable');
    if (feature === 'aiAnalysis') {
      if (value === 'partial') return t('subscription.partial');
      if (value === 'full') return t('subscription.full');
    }
    return value;
  };

  const renderPlanCard = (planKey, plan) => {
    const isCurrentPlan = currentPlan.id === plan.id;
    const isUpgrade = plan.price > currentPlan.price;
    const isDowngrade = plan.price < currentPlan.price;

    return (
      <Zoom in timeout={600}>
        <Card 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: isCurrentPlan ? `3px solid ${plan.color || '#1976d2'}` : '1px solid #e0e0e0',
            boxShadow: isCurrentPlan ? '0 8px 32px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
            transform: isCurrentPlan ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}
        >
          {isCurrentPlan && (
            <Chip
              label={t('subscription.currentPlan')}
              color="primary"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 1
              }}
            />
          )}

          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {plan.name}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                {plan.price === 0 ? t('subscription.free') : `${plan.price}€`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {plan.price === 0 ? t('subscription.forever') : t('subscription.perMonth')}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <List sx={{ py: 0 }}>
              {Object.entries(plan.features).map(([feature, value]) => (
                <ListItem key={feature} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {value !== false && value !== 0 ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Close color="disabled" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={getFeatureLabel(feature)}
                    secondary={getFeatureValue(plan, feature)}
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>

          <CardActions sx={{ p: 3, pt: 0 }}>
            {isCurrentPlan ? (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => setShowCancelDialog(true)}
                startIcon={<Cancel />}
              >
                {t('subscription.cancel')}
              </Button>
            ) : (
              <Button
                fullWidth
                variant={isUpgrade ? "contained" : "outlined"}
                color={isUpgrade ? "primary" : "inherit"}
                onClick={() => handleUpgrade(planKey)}
                startIcon={isUpgrade ? <Star /> : <Edit />}
              >
                {isUpgrade ? t('subscription.upgrade') : t('subscription.downgrade')}
              </Button>
            )}
          </CardActions>
        </Card>
      </Zoom>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
          {t('subscription.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {t('subscription.subtitle')}
        </Typography>

        {isSpecialAccess && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {t('subscription.specialAccess')}
          </Alert>
        )}

        {/* Utilisation actuelle */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('subscription.currentUsage')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {currentUsage.transactions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('subscription.transactionsUsed')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {currentUsage.savingsGoals}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('subscription.savingsGoalsUsed')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {currentUsage.actionPlans}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('subscription.actionPlansUsed')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Plans d'abonnement */}
        <Grid container spacing={3}>
          {Object.entries(subscriptionPlans).map(([key, plan]) => (
            <Grid item xs={12} md={4} key={key}>
              {renderPlanCard(key, plan)}
            </Grid>
          ))}
        </Grid>

        {/* Code promo */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <LocalOffer color="primary" />
            <Typography variant="h6">
              {t('subscription.promoCode')}
            </Typography>
          </Box>
          
          {appliedPromoCode ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={`${appliedPromoCode} - ${promoCodeDiscount}%`} 
                color="success" 
                onDelete={removePromoCode}
              />
            </Box>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setShowPromoDialog(true)}
              startIcon={<LocalOffer />}
            >
              {t('subscription.applyPromoCode')}
            </Button>
          )}
        </Paper>

        {/* Boutons de développement (à supprimer en production) */}
        {isSpecialAccess && (
          <Paper sx={{ p: 3, mt: 4, bgcolor: 'warning.light' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('subscription.developerTools')}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setShowResetDialog(true)}
              color="warning"
            >
              {t('subscription.resetSubscription')}
            </Button>
          </Paper>
        )}
      </Box>

      {/* Dialog code promo */}
      <Dialog open={showPromoDialog} onClose={() => setShowPromoDialog(false)}>
        <DialogTitle>{t('subscription.enterPromoCode')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('subscription.promoCode')}
            fullWidth
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePromoCodeSubmit()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPromoDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handlePromoCodeSubmit} variant="contained">
            {t('subscription.apply')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'annulation */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>{t('subscription.cancelSubscription')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('subscription.cancelConfirmation')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCancelSubscription} color="error" variant="contained">
            {t('subscription.confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de réinitialisation */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>{t('subscription.resetSubscription')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('subscription.resetConfirmation')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleResetSubscription} color="warning" variant="contained">
            {t('subscription.confirmReset')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Subscription; 