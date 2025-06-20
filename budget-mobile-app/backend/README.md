# Backend Stripe pour Budget App

Ce backend gère les paiements Stripe pour l'application de gestion budgétaire.

## 🚀 Installation

1. **Installer les dépendances :**
```bash
npm install
```

2. **Configurer les variables d'environnement :**
```bash
cp env.example .env
```

3. **Modifier le fichier `.env` avec vos vraies clés :**
```env
# Vos clés Stripe LIVE (pas de test !)
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_ici
STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique_ici

# URL de votre frontend
FRONTEND_URL=https://votre-domaine.com

# Votre base MongoDB existante
MONGODB_URI=mongodb://localhost:27017/budget-app
```

## 🔧 Configuration Stripe

### 1. Créer les produits et prix dans votre dashboard Stripe

Allez sur [dashboard.stripe.com](https://dashboard.stripe.com) et créez :

**Produit Premium :**
- Nom : "Premium"
- Prix : 1.99€/mois
- Récupérez le `price_id` (ex: `price_1ABC123...`)

**Produit Pro :**
- Nom : "Pro" 
- Prix : 5.99€/mois
- Récupérez le `price_id` (ex: `price_1DEF456...`)

### 2. Mettre à jour les price IDs dans le code

Dans `stripe-routes.js`, remplacez :
```javascript
const STRIPE_PLANS = {
  PREMIUM: {
    priceId: 'price_premium_monthly', // ← Remplacez par votre vrai price ID
    name: 'Premium',
    price: 1.99
  },
  PRO: {
    priceId: 'price_pro_monthly', // ← Remplacez par votre vrai price ID
    name: 'Pro',
    price: 5.99
  }
};
```

### 3. Configurer le webhook Stripe

1. Dans votre dashboard Stripe, allez dans **Developers > Webhooks**
2. Cliquez **"Add endpoint"**
3. URL : `https://votre-domaine.com/api/stripe/webhook`
4. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Récupérez le **Webhook Secret** et ajoutez-le dans `.env` :
```env
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici
```

## 🏃‍♂️ Démarrage

```bash
# Développement
npm run dev

# Production
npm start
```

## 📡 Endpoints disponibles

### POST `/api/stripe/create-checkout-session`
Crée une session de paiement Stripe

**Body :**
```json
{
  "planId": "PREMIUM",
  "promoCode": "DEV2024",
  "userId": "user_id",
  "userEmail": "user@example.com"
}
```

### POST `/api/stripe/webhook`
Webhook Stripe (géré automatiquement)

### GET `/api/stripe/check-payment-status/:sessionId`
Vérifie le statut d'un paiement

### POST `/api/stripe/cancel-subscription`
Annule un abonnement

### GET `/api/stripe/payment-history/:userId`
Récupère l'historique des paiements

## 🔒 Sécurité

- ✅ Clés secrètes Stripe côté serveur uniquement
- ✅ Authentification JWT requise
- ✅ Rate limiting (100 req/15min par IP)
- ✅ Validation des webhooks Stripe
- ✅ Helmet pour la sécurité HTTP

## 🗄️ Intégration MongoDB

Le backend s'intègre avec votre base MongoDB existante. Assurez-vous que votre modèle User a un champ `subscription` :

```javascript
// Exemple de schéma User
{
  _id: ObjectId,
  email: String,
  subscription: {
    currentPlan: String, // 'FREE', 'PREMIUM', 'PRO'
    status: String, // 'active', 'cancelled', 'expired'
    startDate: Date,
    endDate: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  }
}
```

## 🚨 Important

- **NE JAMAIS** commiter les clés secrètes dans Git
- Utilisez `.env` pour les variables sensibles
- Ajoutez `.env` à votre `.gitignore`
- Testez d'abord en mode développement

## 🐛 Debug

Pour vérifier que tout fonctionne :

```bash
# Test de santé
curl http://localhost:3000/health

# Test Stripe
curl http://localhost:3000/api/stripe/test
``` 