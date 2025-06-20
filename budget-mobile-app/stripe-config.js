// Configuration Stripe avec les vrais Price IDs
export const STRIPE_CONFIG = {
  // Price IDs Stripe (PRODUCTION)
  PRICE_IDS: {
    PREMIUM: 'price_1RcAEjGb8GKvvz2G9mn9OlJs',
    PRO: 'price_1RcAERGb8GKvvz2GAyajrGFo'
  },
  
  // Plans d'abonnement
  PLANS: {
    PREMIUM: {
      id: 'premium',
      name: 'Premium',
      price: 1.99,
      currency: 'EUR',
      priceId: 'price_1RcAEjGb8GKvvz2G9mn9OlJs',
      features: {
        maxTransactions: -1, // Illimité
        unlimitedCategories: true,
        maxSavingsGoals: -1, // Illimité
        basicAnalytics: true,
        aiAnalysis: 'partial',
        maxActionPlans: 1,
        multipleAccounts: false,
        prioritySupport: false,
        advancedReports: false
      }
    },
    PRO: {
      id: 'pro',
      name: 'Pro',
      price: 5.99,
      currency: 'EUR',
      priceId: 'price_1RcAERGb8GKvvz2GAyajrGFo',
      features: {
        maxTransactions: -1, // Illimité
        unlimitedCategories: true,
        maxSavingsGoals: -1, // Illimité
        basicAnalytics: true,
        aiAnalysis: 'full',
        maxActionPlans: -1, // Illimité
        multipleAccounts: true,
        prioritySupport: true,
        advancedReports: true
      }
    }
  },
  
  // Codes promo
  PROMO_CODES: {
    'DEV2024': { discount: 100, type: 'percentage', validUntil: '2025-12-31' },
    'TEST50': { discount: 50, type: 'percentage', validUntil: '2025-12-31' },
    'FREEMONTH': { discount: 1, type: 'months', validUntil: '2025-12-31' }
  },
  
  // URLs de redirection
  SUCCESS_URL: 'https://budget-mobile-app-pa2n.onrender.com/subscription?success=true&session_id={CHECKOUT_SESSION_ID}',
  CANCEL_URL: 'https://budget-mobile-app-pa2n.onrender.com/subscription?canceled=true'
};

// Fonction utilitaire pour obtenir un plan par ID
export const getPlanById = (planId) => {
  return STRIPE_CONFIG.PLANS[planId.toUpperCase()];
};

// Fonction utilitaire pour obtenir un Price ID par plan
export const getPriceId = (planId) => {
  return STRIPE_CONFIG.PRICE_IDS[planId.toUpperCase()];
};

// Fonction utilitaire pour valider un code promo
export const validatePromoCode = (code) => {
  const promoCode = STRIPE_CONFIG.PROMO_CODES[code.toUpperCase()];
  if (!promoCode) return null;
  
  const now = new Date();
  const validUntil = new Date(promoCode.validUntil);
  
  if (now > validUntil) return null;
  
  return promoCode;
}; 