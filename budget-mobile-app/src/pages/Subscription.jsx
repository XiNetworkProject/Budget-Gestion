import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { stripeService } from '../services/stripeService';
import { useLocation, useNavigate } from 'react-router-dom';
import IntegratedPayment from '../components/IntegratedPayment';
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
  const location = useLocation();
  const navigate = useNavigate();
  const {
    subscription,
    subscriptionPlans,
    specialAccessEmails,
    user,
    updateSubscription,
    hasSpecialAccess,
    getCurrentPlan
  } = useStore();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState(null);

  const currentPlan = getCurrentPlan() || subscriptionPlans.FREE;
  const isSpecialAccess = hasSpecialAccess();

  // Gérer le retour de paiement Stripe
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      // Paiement réussi
      handlePaymentSuccess(sessionId);
    } else if (canceled === 'true') {
      // Paiement annulé
      toast.error(t('subscription.paymentCanceled'));
      // Nettoyer l'URL
      navigate('/subscription', { replace: true });
    }
  }, [location.search, navigate, t]);

  const handlePaymentSuccess = async (sessionId) => {
    try {
      setIsProcessing(true);
      
      // Vérifier le statut du paiement
      const paymentStatus = await stripeService.checkPaymentStatus(sessionId);
      
      if (paymentStatus.status === 'paid') {
        // Mettre à jour l'abonnement dans le store
        // Le plan sera déterminé par le webhook Stripe
        toast.success(t('subscription.paymentSuccess'));
        
        // Rediriger vers la page d'accueil
        navigate('/', { replace: true });
      } else {
        toast.error(t('subscription.paymentFailed'));
      }
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      toast.error(t('subscription.paymentVerificationError'));
    } finally {
      setIsProcessing(false);
      // Nettoyer l'URL
      navigate('/subscription', { replace: true });
    }
  };

  // Calculer l'utilisation actuelle
  const currentUsage = {
    transactions: 0, // À calculer depuis les vraies données
    savingsGoals: 0, // À calculer depuis les vraies données
    actionPlans: 0 // À calculer depuis les vraies données
  };

  const handleUpgrade = async (planId) => {
    try {
      setIsProcessing(true);
      
      // Option 1: Paiement intégré (recommandé)
      setPaymentPlan({ id: planId, ...subscriptionPlans[planId] });
      setShowPaymentDialog(true);
      
      // Option 2: Redirection vers Stripe Checkout (fallback)
      // await stripeService.createCheckoutSession(planId);
      
    } catch (error) {
      console.error('Erreur lors de l\'upgrade:', error);
      toast.error(error.message || 'Erreur lors de la création du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIntegratedPaymentSuccess = (subscription) => {
    // L'abonnement est déjà mis à jour dans le composant IntegratedPayment
    toast.success(t('subscription.upgradeSuccess'));
    setShowPaymentDialog(false);
    setPaymentPlan(null);
  };

  const handleIntegratedPaymentCancel = () => {
    setShowPaymentDialog(false);
    setPaymentPlan(null);
  };

  const handleDowngrade = (planId) => {
    setSelectedPlan(planId);
    setShowDowngradeDialog(true);
  };

  const confirmDowngrade = async () => {
    try {
      setIsProcessing(true);
      
      // Si on passe d'un plan payant au gratuit, annuler l'abonnement
      if (currentPlan && currentPlan.price > 0 && selectedPlan === 'FREE') {
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
    const isCurrentPlan = currentPlan && currentPlan.id === plan.id;
    const isUpgrade = currentPlan && plan.price > currentPlan.price;
    const isDowngrade = currentPlan && plan.price < currentPlan.price;
    const isFreePlan = plan.price === 0;

    return (
      <Zoom in timeout={600}>
        <Card 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: isCurrentPlan ? '2px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isCurrentPlan ? '0 12px 40px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
            transform: isCurrentPlan ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}
        >
          {isCurrentPlan && (
            <Chip
              label={t('subscription.currentPlan')}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 1,
                background: 'rgba(76, 175, 80, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#4caf50',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}
            />
          )}

          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {t(plan.name)}
              </Typography>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                color: '#4caf50', 
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {plan.price === 0 ? t('subscription.free') : `${plan.price}€`}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {plan.price === 0 ? t('subscription.forever') : t('subscription.perMonth')}
              </Typography>
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            <List sx={{ py: 0 }}>
              {Object.entries(plan.features).map(([feature, value]) => (
                <ListItem key={feature} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {value !== false && value !== 0 ? (
                      <CheckCircle sx={{ color: '#4caf50' }} />
                    ) : (
                      <Close sx={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={getFeatureLabel(feature)}
                    secondary={getFeatureValue(plan, feature)}
                    primaryTypographyProps={{ 
                      fontWeight: 500,
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                    secondaryTypographyProps={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
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
                  onClick={() => setShowCancelDialog(true)}
                  startIcon={<Cancel />}
                  sx={{
                    borderColor: 'rgba(244, 67, 54, 0.3)',
                    color: '#f44336',
                    '&:hover': {
                      borderColor: 'rgba(244, 67, 54, 0.5)',
                      background: 'rgba(244, 67, 54, 0.1)'
                    }
                  }}
                >
                  {t('subscription.cancel')}
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  disabled
                  startIcon={<CheckCircle />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.3)'
                  }}
                >
                  {t('subscription.currentPlan')}
                </Button>
              )
            ) : (
              // Autres plans
              <Button
                fullWidth
                variant={isUpgrade ? "contained" : "outlined"}
                onClick={() => isUpgrade ? handleUpgrade(planKey) : handleDowngrade(planKey)}
                startIcon={isUpgrade ? (isProcessing ? <CircularProgress size={20} /> : <Payment />) : <Edit />}
                disabled={isProcessing}
                sx={isUpgrade ? {
                  background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)'
                  }
                } : {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {isProcessing ? t('subscription.processing') : (isUpgrade ? t('subscription.upgrade', { plan: t(plan.name) }) : t('subscription.downgrade', { plan: t(plan.name) }))}
              </Button>
            )}
          </CardActions>
        </Card>
      </Zoom>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      padding: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules animées */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '@keyframes float': {
                '0%': {
                  transform: 'translateY(0px) rotate(0deg)',
                  opacity: 0
                },
                '10%': {
                  opacity: 1
                },
                '90%': {
                  opacity: 1
                },
                '100%': {
                  transform: 'translateY(-100vh) rotate(360deg)',
                  opacity: 0
                }
              }
            }}
          />
        ))}
      </Box>

      <Box sx={{ p: 2, pb: 10, position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {t('subscription.title')}
        </Typography>
        <Typography variant="h6" sx={{ 
          mb: 3,
          color: 'rgba(255, 255, 255, 0.8)',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          {t('subscription.subtitle')}
        </Typography>

        {isSpecialAccess && (
          <Alert severity="info" sx={{ 
            mb: 3,
            background: 'rgba(3, 169, 244, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(3, 169, 244, 0.3)',
            color: '#03a9f4'
          }}>
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

        {/* Informations importantes glassmorphism */}
        <Paper sx={{ 
          p: 3, 
          mt: 4, 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" sx={{ 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            <Warning sx={{ color: '#ff9800' }} />
            {t('subscription.importantInfo')}
          </Typography>
          <Typography variant="body2" sx={{ 
            mb: 1,
            color: 'rgba(255, 255, 255, 0.8)',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            • {t('subscription.noRefund')}
          </Typography>
          <Typography variant="body2" sx={{ 
            mb: 1,
            color: 'rgba(255, 255, 255, 0.8)',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            • {t('subscription.cancelAnytime')}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            • {t('subscription.downgradeInfo')}
          </Typography>
        </Paper>

        {/* Dialog d'annulation glassmorphism */}
        <Dialog 
          open={showCancelDialog} 
          onClose={() => setShowCancelDialog(false)}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#333', fontWeight: 'bold' }}>
            {t('subscription.cancelSubscription')}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#333' }}>
              {t('subscription.cancelConfirmation')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowCancelDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleCancelSubscription} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
                }
              }}
            >
              {t('subscription.confirmCancel')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de downgrade glassmorphism */}
        <Dialog 
          open={showDowngradeDialog} 
          onClose={() => setShowDowngradeDialog(false)}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#333', fontWeight: 'bold' }}>
            {t('subscription.downgradeSubscription')}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#333' }}>
              {t('subscription.downgradeConfirmation')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowDowngradeDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={confirmDowngrade} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)'
                }
              }}
            >
              {t('subscription.confirmDowngrade', { plan: selectedPlan })}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Modal de paiement intégré */}
      {paymentPlan && (
        <IntegratedPayment
          open={showPaymentDialog}
          onClose={handleIntegratedPaymentCancel}
          planId={paymentPlan.id}
          plan={paymentPlan}
          onSuccess={handleIntegratedPaymentSuccess}
        />
      )}
    </Box>
  );
};

export default Subscription; 