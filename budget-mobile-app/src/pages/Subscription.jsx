import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { stripeService } from '../services/stripeService';
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
  IconButton,
  Fade,
  Zoom,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Close,
  Star,
  Diamond,
  Cancel,
  Edit,
  Payment,
  Security,
  Analytics,
  Savings,
  Timeline,
  AccountBalance,
  Support,
  CloudSync,
  Psychology,
  TrendingUp,
  Warning
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

const Subscription = () => {
  const { t } = useTranslation();
  const {
    subscription,
    subscriptionPlans,
    specialAccessEmails,
    user,
    updateSubscription,
    hasSpecialAccess
  } = useStore();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const currentPlan = getCurrentPlan();
  const isSpecialAccess = hasSpecialAccess();

  // Calculer l'utilisation actuelle
  const currentUsage = {
    transactions: 0, // À calculer depuis les vraies données
    savingsGoals: 0, // À calculer depuis les vraies données
    actionPlans: 0 // À calculer depuis les vraies données
  };

  const handleUpgrade = async (planId) => {
    try {
      setIsProcessing(true);
      
      // Utiliser le service Stripe
      await stripeService.createCheckoutSession(planId);
      
      // La redirection se fait automatiquement dans le service
    } catch (error) {
      console.error('Erreur lors de l\'upgrade:', error);
      toast.error(error.message || 'Erreur lors de la création du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDowngrade = (planId) => {
    setSelectedPlan(planId);
    setShowDowngradeDialog(true);
  };

  const confirmDowngrade = async () => {
    try {
      setIsProcessing(true);
      
      // Si on passe d'un plan payant au gratuit, annuler l'abonnement
      if (currentPlan.price > 0 && selectedPlan === 'FREE') {
        // Ici tu devrais appeler l'API pour annuler l'abonnement Stripe
        await stripeService.cancelSubscription('current_subscription_id');
      }
      
      // Mettre à jour le plan dans le store
      updateSubscription(selectedPlan);
      
      toast.success(t('subscription.downgradeSuccess'));
      setShowDowngradeDialog(false);
    } catch (error) {
      console.error('Erreur lors du downgrade:', error);
      toast.error(error.message || 'Erreur lors du changement de plan');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsProcessing(true);
      
      // Annuler l'abonnement Stripe
      await stripeService.cancelSubscription('current_subscription_id');
      
      // Passer au plan gratuit
      updateSubscription('FREE');
      
      toast.success(t('subscription.cancelSuccess'));
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error(error.message || 'Erreur lors de l\'annulation');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      maxTransactions: <Timeline />,
      unlimitedCategories: <AccountBalance />,
      maxSavingsGoals: <Savings />,
      basicAnalytics: <Analytics />,
      aiAnalysis: <Psychology />,
      maxActionPlans: <TrendingUp />,
      multipleAccounts: <CloudSync />,
      prioritySupport: <Support />,
      advancedReports: <Security />
    };
    return icons[feature] || <CheckCircle />;
  };

  const getFeatureLabel = (feature) => {
    const featureLabels = {
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
    return featureLabels[feature] || feature;
  };

  const getFeatureValue = (plan, feature) => {
    const value = plan.features[feature];
    
    // Gestion des valeurs spéciales
    if (value === -1) return t('subscription.unlimited');
    if (value === false) return t('subscription.notAvailable');
    if (value === true) return t('subscription.available');
    if (value === 0) return t('subscription.notAvailable');
    
    // Gestion spécifique pour aiAnalysis
    if (feature === 'aiAnalysis') {
      if (value === 'partial') return t('subscription.partial');
      if (value === 'full') return t('subscription.full');
      if (value === false) return t('subscription.notAvailable');
    }
    
    // Pour les valeurs numériques, afficher le nombre
    if (typeof value === 'number' && value > 0) {
      return `${value}`;
    }
    
    // Valeur par défaut
    return value || t('subscription.notAvailable');
  };

  const renderPlanCard = (planKey, plan) => {
    const isCurrentPlan = currentPlan.id === plan.id;
    const isUpgrade = plan.price > currentPlan.price;
    const isDowngrade = plan.price < currentPlan.price;
    const isFreePlan = plan.price === 0;

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
              // Plan actuel - afficher le bouton d'annulation seulement pour les plans payants
              plan.price > 0 ? (
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
                  variant="outlined"
                  disabled
                  startIcon={<CheckCircle />}
                >
                  {t('subscription.currentPlan')}
                </Button>
              )
            ) : (
              // Autres plans
              <Button
                fullWidth
                variant={isUpgrade ? "contained" : "outlined"}
                color={isUpgrade ? "primary" : "inherit"}
                onClick={() => isUpgrade ? handleUpgrade(planKey) : handleDowngrade(planKey)}
                startIcon={isUpgrade ? (isProcessing ? <CircularProgress size={20} /> : <Payment />) : <Edit />}
                disabled={isProcessing}
              >
                {isProcessing ? t('subscription.processing') : (isUpgrade ? t('subscription.upgrade') : t('subscription.downgrade'))}
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

        {/* Plans d'abonnement */}
        <Grid container spacing={3}>
          {Object.entries(subscriptionPlans).map(([key, plan]) => (
            <Grid item xs={12} md={4} key={key}>
              {renderPlanCard(key, plan)}
            </Grid>
          ))}
        </Grid>

        {/* Informations importantes */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.light' }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning />
            {t('subscription.importantInfo')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • {t('subscription.noRefund')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • {t('subscription.cancelAnytime')}
          </Typography>
          <Typography variant="body2">
            • {t('subscription.downgradeInfo')}
          </Typography>
        </Paper>
      </Box>

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

      {/* Dialog de downgrade */}
      <Dialog open={showDowngradeDialog} onClose={() => setShowDowngradeDialog(false)}>
        <DialogTitle>{t('subscription.downgradeSubscription')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('subscription.downgradeConfirmation')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDowngradeDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmDowngrade} color="warning" variant="contained">
            {t('subscription.confirmDowngrade')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Subscription; 