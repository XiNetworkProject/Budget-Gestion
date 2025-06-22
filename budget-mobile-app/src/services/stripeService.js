const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { useStore } from '../store';
import { toast } from 'react-hot-toast';

// Configuration des URLs Stripe directes
const STRIPE_URLS = {
  PREMIUM: 'https://buy.stripe.com/bJe28rbgpduTbbgcDBfAc00',
  PRO: 'https://buy.stripe.com/dRm5kDfwF0I7frw331fAc01'
};

export const stripeService = {
  // Créer une session de paiement Stripe (redirection directe)
  async createCheckoutSession(planId) {
    try {
      const token = useStore.getState().token;
      const user = useStore.getState().user;
      
      if (!token || !user) {
        throw new Error('Utilisateur non connecté');
      }

      // Vérifier si on a une URL directe pour ce plan
      const directUrl = STRIPE_URLS[planId];
      if (directUrl) {
        // Redirection directe vers Stripe
        window.location.href = directUrl;
        return { sessionId: `direct_${Date.now()}`, sessionUrl: directUrl };
      }

      // Fallback vers l'API si pas d'URL directe
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planId,
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

  // Créer un paiement intégré avec Stripe Elements
  async createPaymentIntent(planId) {
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

      const response = await fetch(`${API_URL}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planId,
          userId: user.id,
          userEmail: user.email
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création du paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur création payment intent:', error);
      throw error;
    }
  },

  // Confirmer un paiement avec Stripe Elements
  async confirmPayment(paymentIntentId, paymentMethod) {
    try {
      const token = useStore.getState().token;
      
      if (!token) {
        throw new Error('Utilisateur non connecté');
      }

      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/api/stripe/confirm-payment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paymentIntentId,
          paymentMethod
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la confirmation du paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur confirmation paiement:', error);
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
  async cancelSubscription(subscriptionId = 'current') {
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

      const response = await fetch(`${API_URL}/api/stripe/cancel-subscription`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subscriptionId,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'annulation de l\'abonnement');
      }

      const result = await response.json();
      
      // Afficher un message informatif
      if (result.note) {
        toast(result.note, { duration: 6000 });
      }
      
      return result;
    } catch (error) {
      console.error('Erreur annulation abonnement:', error);
      throw error;
    }
  },

  // Récupérer l'historique des paiements
  async getPaymentHistory() {
    try {
      const token = useStore.getState().token;
      
      if (!token) {
        throw new Error('Utilisateur non connecté');
      }

      const headers = { 
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/api/stripe/payment-history`, {
        method: 'GET',
        headers,
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
  },

  // Obtenir l'URL directe d'un plan
  getDirectUrl(planId) {
    return STRIPE_URLS[planId] || null;
  }
}; 