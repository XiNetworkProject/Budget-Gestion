// Configuration Serveur Stripe - EXEMPLE
// ⚠️  CE FICHIER NE DOIT JAMAIS ÊTRE COMMITÉ DANS GIT
// ⚠️  UTILISER UNIQUEMENT CÔTÉ SERVEUR

export const SERVER_CONFIG = {
  // Clé secrète (UNIQUEMENT côté serveur)
  // Remplacez par votre vraie clé secrète ou utilisez une variable d'environnement
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here',
  
  // Configuration des webhooks (optionnel)
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here',
  
  // Configuration des plans avec IDs Stripe
  plans: {
    premium: {
      priceId: 'price_premium_monthly',
      name: 'Premium',
      price: 1.99,
      currency: 'eur'
    },
    pro: {
      priceId: 'price_pro_monthly',
      name: 'Pro', 
      price: 5.99,
      currency: 'eur'
    }
  },
  
  // Configuration de la base de données (optionnel)
  database: {
    url: process.env.DATABASE_URL || 'your_database_url_here'
  }
};

// Instructions de sécurité :
// 1. Copiez ce fichier vers server-config.js
// 2. Ajoutez server-config.js au .gitignore
// 3. Utilisez uniquement côté serveur
// 4. Ne partagez jamais ce fichier
// 5. Pour la production, utilisez les clés 'live'
// 6. Utilisez des variables d'environnement pour les clés sensibles 