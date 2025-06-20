import { loadStripe } from '@stripe/stripe-js';

// Import de la configuration Stripe
let STRIPE_CONFIG = null;
try {
  // Essayer d'importer la configuration personnalisée
  const configModule = await import('../../stripe-config.js');
  STRIPE_CONFIG = configModule.STRIPE_CONFIG;
} catch (error) {
  // Fallback vers les variables d'environnement
  STRIPE_CONFIG = {
    publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Rc9J9GbDf2YOexvx07YTx57IEdGpQptOkeP6AO7UCPqJHQ3tjaqd06yEcQW8SQcgeiH4HvbhDbuX7yGpnR431ju00a23O01zp',
    mode: process.env.REACT_APP_STRIPE_MODE || 'test'
  };
  console.warn('Configuration Stripe non trouvée. Utilisation des variables d\'environnement.');
}

// Clé publique Stripe
const STRIPE_PUBLISHABLE_KEY = STRIPE_CONFIG.publishableKey;

let stripePromise = null;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Service pour gérer les paiements Stripe
export const stripeService = {
  // Initialiser Stripe
  initialize: async () => {
    try {
      const stripe = await getStripe();
      return stripe;
    } catch (error) {
      console.error('Erreur d\'initialisation Stripe:', error);
      throw error;
    }
  },

  // Créer une session de paiement
  createCheckoutSession: async (planId, userId, promoCode = null) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          promoCode,
          successUrl: `${window.location.origin}/subscription?success=true`,
          cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      const session = await response.json();
      return session;
    } catch (error) {
      console.error('Erreur création session Stripe:', error);
      throw error;
    }
  },

  // Rediriger vers le checkout Stripe
  redirectToCheckout: async (sessionId) => {
    try {
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erreur redirection Stripe:', error);
      throw error;
    }
  },

  // Créer un abonnement
  createSubscription: async (planId, userId, promoCode = null) => {
    try {
      // Créer la session de paiement
      const session = await stripeService.createCheckoutSession(planId, userId, promoCode);
      
      // Rediriger vers le checkout
      await stripeService.redirectToCheckout(session.id);
      
      return session;
    } catch (error) {
      console.error('Erreur création abonnement:', error);
      throw error;
    }
  },

  // Annuler un abonnement
  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur annulation abonnement:', error);
      throw error;
    }
  },

  // Récupérer les informations d'un abonnement
  getSubscription: async (subscriptionId) => {
    try {
      const response = await fetch(`/api/subscription/${subscriptionId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }

      const subscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('Erreur récupération abonnement:', error);
      throw error;
    }
  },

  // Simuler un paiement (pour les tests)
  simulatePayment: async (planId, userId, promoCode = null) => {
    // Simulation pour les tests - à remplacer par l'intégration réelle
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `sub_${Date.now()}`,
          status: 'active',
          planId,
          userId,
          promoCode,
          createdAt: new Date().toISOString(),
        });
      }, 2000);
    });
  },
};

export default stripeService; 