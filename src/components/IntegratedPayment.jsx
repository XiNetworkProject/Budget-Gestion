import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Divider
} from '@mui/material';
import { Payment, Security } from '@mui/icons-material';
import { stripeService } from '../services/stripeService';

const IntegratedPayment = ({ open, onClose, planId, plan }) => {
  const { t } = useTranslation();

  const handleExternalPayment = () => {
    stripeService.createCheckoutSession(planId);
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
        {t('subscription.paymentTitle', { plan: t(plan.name) })}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>
            {t(plan.name)} - {plan.price}€/mois
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            {t('subscription.paymentDescription', { plan: t(plan.name) })}
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
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Button
            variant="contained"
            onClick={handleExternalPayment}
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
              }
            }}
          >
            {t('subscription.pay')} {plan.price}€ avec Stripe
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default IntegratedPayment; 