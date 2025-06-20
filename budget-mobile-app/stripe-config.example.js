// Configuration Stripe - Exemple
// Copiez ce fichier vers stripe-config.js et remplacez les valeurs

export const STRIPE_CONFIG = {
  // Clé publique (visible côté client)
  publishableKey: 'pk_test_your_stripe_public_key_here',
  
  // Mode de Stripe (test ou live)
  mode: 'test',
  
  // Configuration des accès spéciaux (optionnel)
  specialAccessEmails: ['dev@example.com', 'test@example.com'],
  
  // Configuration des plans (optionnel)
  plans: {
    premium: {
      priceId: 'price_premium_monthly',
      name: 'Premium',
      price: 1.99
    },
    pro: {
      priceId: 'price_pro_monthly', 
      name: 'Pro',
      price: 5.99
    }
  }
};

// Instructions :
// 1. Copiez ce fichier vers stripe-config.js
// 2. Remplacez 'pk_test_your_stripe_public_key_here' par votre vraie clé publique
// 3. Ajoutez stripe-config.js au .gitignore pour ne pas exposer vos clés
// 4. Pour la production, utilisez les clés 'live' au lieu de 'test' 