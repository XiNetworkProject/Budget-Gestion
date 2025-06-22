import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Payment, Lock, Security } from '@mui/icons-material';
import { stripeService } from '../services/stripeService';
import { useStore } from '../store';
import { toast } from 'react-hot-toast';

// Charger Stripe avec votre clé publique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ planId, plan, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Créer le payment intent au chargement
    createPaymentIntent();
  }, [planId]);

  const createPaymentIntent = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const { clientSecret: secret } = await stripeService.createPaymentIntent(planId);
      setClientSecret(secret);
    } catch (error) {
      console.error('Erreur création payment intent:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (submitError) {
      setError(submitError.message);
      setIsProcessing(false);
      return;
    }

    try {
      // Confirmer le paiement
      const result = await stripeService.confirmPayment(clientSecret, paymentMethod.id);
      
      if (result.success) {
        toast.success(t('subscription.paymentSuccess'));
        onSuccess(result.subscription);
      } else {
        setError(result.message || 'Erreur lors du paiement');
      }
    } catch (error) {
      console.error('Erreur confirmation paiement:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (isProcessing && !clientSecret) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
          {t('subscription.paymentDetails')}
        </Typography>
        
        <Paper sx={{ 
          p: 2, 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardElement options={cardElementOptions} />
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={onCancel}
          disabled={isProcessing}
          sx={{ color: '#666' }}
        >
          {t('common.cancel')}
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || isProcessing}
          sx={{
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
            }
          }}
        >
          {isProcessing ? (
            <CircularProgress size={20} sx={{ color: 'white' }} />
          ) : (
            `${t('subscription.pay')} ${plan.price}€`
          )}
        </Button>
      </Box>
    </form>
  );
};

const IntegratedPayment = ({ open, onClose, planId, plan }) => {
  const { t } = useTranslation();
  const { updateSubscription } = useStore();

  const handleSuccess = (subscription) => {
    // Mettre à jour l'abonnement dans le store
    updateSubscription(planId);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        color: '#333',
        fontWeight: 'bold'
      }}>
        <Payment sx={{ color: '#4caf50' }} />
        {t('subscription.paymentTitle', { plan: plan.name })}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>
            {plan.name} - {plan.price}€/mois
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            {t('subscription.paymentDescription')}
          </Typography>
          
          <Alert severity="info" sx={{ 
            mb: 2,
            background: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security sx={{ fontSize: 16 }} />
              <Typography variant="body2">
                {t('subscription.securePayment')}
              </Typography>
            </Box>
          </Alert>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Elements stripe={stripePromise}>
          <PaymentForm 
            planId={planId}
            plan={plan}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default IntegratedPayment; 