# Serveur API Budget App

Ce serveur gère l'intégration Stripe pour les abonnements de l'application de gestion budgétaire.

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env` dans le dossier `server/` avec les variables suivantes :

```env
# Configuration Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id_here
STRIPE_PRO_PRICE_ID=price_your_pro_price_id_here

# Configuration Frontend
FRONTEND_URL=http://localhost:5173

# Configuration Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here

# Configuration Serveur
PORT=3000
```

### 2. Installation des dépendances

```bash
cd server
npm install
```

### 3. Démarrage du serveur

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## Routes API

### Synchronisation d'abonnement
- `POST /api/stripe/sync-subscription` - Synchronise l'abonnement Stripe avec l'app

### Vérification de statut
- `GET /api/stripe/subscription-status` - Vérifie le statut de l'abonnement

### Gestion des abonnements
- `POST /api/stripe/cancel-subscription` - Annule un abonnement
- `GET /api/stripe/payment-history` - Récupère l'historique des paiements

### Sessions de paiement
- `POST /api/stripe/create-checkout-session` - Crée une session de paiement
- `GET /api/stripe/check-payment-status/:sessionId` - Vérifie le statut d'un paiement

## Synchronisation automatique

Le serveur recherche automatiquement les abonnements Stripe par email et les mappe vers les plans de l'application :

- **FREE** : Aucun abonnement actif
- **PREMIUM** : Abonnement avec `STRIPE_PREMIUM_PRICE_ID`
- **PRO** : Abonnement avec `STRIPE_PRO_PRICE_ID`

## Détection des périodes d'essai

Le serveur détecte automatiquement les abonnements en période d'essai (`trialing`) et inclut les informations de fin de période d'essai dans la réponse. 