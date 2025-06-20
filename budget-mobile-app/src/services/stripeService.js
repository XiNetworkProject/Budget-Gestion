const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { useStore } from '../store';

export const stripeService = {
  // Créer une session de paiement Stripe
  async createCheckoutSession(planId, promoCode = null) {
    try {
      const token = useStore.getState().token;
      const user = useStore.getState().user;
      
      if (!token || !user) {
        throw new Error('Utilisateur non connecté');
      }

      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planId,
          promoCode,
          userId: user.id,
          userEmail: user.email
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création de la session de paiement');
      }

      const { sessionId, sessionUrl } = await response.json();
      
      // Rediriger vers Stripe Checkout
      window.location.href = sessionUrl;
      
      return { sessionId, sessionUrl };
    } catch (error) {
      console.error('Erreur création session Stripe:', error);
      throw error;
    }
  },

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(sessionId) {
    try {
      const token = useStore.getState().token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_URL}/api/stripe/check-payment-status/${sessionId}`, {
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la vérification du paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      throw error;
    }
  },

  // Annuler un abonnement
  async cancelSubscription(subscriptionId) {
    try {
      const token = useStore.getState().token;
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/api/stripe/cancel-subscription`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'annulation de l\'abonnement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur annulation abonnement:', error);
      throw error;
    }
  },

  // Récupérer l'historique des paiements
  async getPaymentHistory() {
    try {
      const token = useStore.getState().token;
      const user = useStore.getState().user;
      
      if (!token || !user) {
        throw new Error('Utilisateur non connecté');
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await fetch(`${API_URL}/api/stripe/payment-history/${user.id}`, {
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la récupération de l\'historique');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      throw error;
    }
  },

  // Mettre à jour la méthode de paiement
  async updatePaymentMethod(paymentMethodId) {
    try {
      const token = useStore.getState().token;
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/api/stripe/update-payment-method`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour de la méthode de paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour méthode de paiement:', error);
      throw error;
    }
  }
}; 