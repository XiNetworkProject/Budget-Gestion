import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import webPush from 'web-push';
import cron from 'node-cron';
import express from 'express';
import Stripe from 'stripe';

// Charger les variables d'environnement
dotenv.config();

// Configuration Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configuration VAPID pour Push API
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
webPush.setVapidDetails(
  'mailto:votre-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Stockage temporaire des souscriptions Push
let subscriptions = [];

const app = express();
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Route pour enregistrer la souscription Push
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log('Nouvelle souscription Push enregistrée');
  res.sendStatus(201);
});

// Route pour synchroniser l'abonnement Stripe
app.post('/api/stripe/sync-subscription', async (req, res) => {
  try {
    const { userId, userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ 
        error: 'Email utilisateur requis' 
      });
    }

    console.log(`Synchronisation abonnement pour: ${userEmail}`);

    // Rechercher les abonnements Stripe par email
    const subscriptions = await stripe.subscriptions.list({
      customer_email: userEmail,
      status: 'active',
      expand: ['data.default_payment_method', 'data.items.data.price']
    });

    console.log(`Trouvé ${subscriptions.data.length} abonnements actifs`);

    if (subscriptions.data.length === 0) {
      // Aucun abonnement actif trouvé
      return res.json({
        subscription: {
          currentPlan: 'FREE',
          status: 'inactive',
          message: 'Aucun abonnement actif trouvé'
        }
      });
    }

    // Prendre le premier abonnement actif
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    console.log(`Abonnement trouvé: ${subscription.id}, Price ID: ${priceId}`);

    // Déterminer le plan basé sur le Price ID
    let currentPlan = 'FREE';
    let planName = 'Gratuit';
    
    // Mapper les Price IDs vers les plans (à adapter selon vos Price IDs Stripe)
    if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
      currentPlan = 'PREMIUM';
      planName = 'Premium';
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      currentPlan = 'PRO';
      planName = 'Pro';
    }

    // Calculer la date de fin de la période d'essai
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    const subscriptionData = {
      currentPlan,
      planName,
      status: subscription.status,
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      trialEnd: trialEnd ? trialEnd.toISOString() : null,
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      isTrialing: subscription.status === 'trialing',
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    };

    console.log(`Plan détecté: ${currentPlan} (${planName})`);

    res.json({
      subscription: subscriptionData,
      message: `Abonnement ${planName} synchronisé avec succès`
    });

  } catch (error) {
    console.error('Erreur synchronisation abonnement:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la synchronisation de l\'abonnement',
      details: error.message 
    });
  }
});

// Route pour vérifier le statut de l'abonnement
app.get('/api/stripe/subscription-status', async (req, res) => {
  try {
    const { userEmail } = req.query;
    
    if (!userEmail) {
      return res.status(400).json({ 
        error: 'Email utilisateur requis' 
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer_email: userEmail,
      status: 'active'
    });

    if (subscriptions.data.length === 0) {
      return res.json({
        hasActiveSubscription: false,
        currentPlan: 'FREE'
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    let currentPlan = 'FREE';
    if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
      currentPlan = 'PREMIUM';
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      currentPlan = 'PRO';
    }

    res.json({
      hasActiveSubscription: true,
      currentPlan,
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
    });

  } catch (error) {
    console.error('Erreur vérification statut:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la vérification du statut',
      details: error.message 
    });
  }
});

// Route pour annuler un abonnement
app.post('/api/stripe/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId, userId } = req.body;
    
    if (!subscriptionId || subscriptionId === 'current_subscription_id') {
      return res.status(400).json({ 
        error: 'ID d\'abonnement requis' 
      });
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    res.json({
      success: true,
      subscriptionId: subscription.id,
      note: 'Votre abonnement sera annulé à la fin de la période de facturation en cours.'
    });

  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'annulation de l\'abonnement',
      details: error.message 
    });
  }
});

// Route pour l'historique des paiements
app.get('/api/stripe/payment-history', async (req, res) => {
  try {
    const { userEmail } = req.query;
    
    if (!userEmail) {
      return res.status(400).json({ 
        error: 'Email utilisateur requis' 
      });
    }

    const payments = await stripe.paymentIntents.list({
      customer_email: userEmail,
      limit: 10
    });

    const history = payments.data.map(payment => ({
      id: payment.id,
      amount: payment.amount / 100, // Convertir en euros
      currency: payment.currency,
      status: payment.status,
      created: new Date(payment.created * 1000).toISOString()
    }));

    res.json({ history });

  } catch (error) {
    console.error('Erreur historique paiements:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération de l\'historique',
      details: error.message 
    });
  }
});

// Route pour créer une session de paiement (fallback)
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { planId, userId, userEmail } = req.body;
    
    if (!planId || !userEmail) {
      return res.status(400).json({ 
        error: 'Plan et email requis' 
      });
    }

    // Mapper les plans vers les Price IDs
    let priceId;
    if (planId === 'PREMIUM') {
      priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    } else if (planId === 'PRO') {
      priceId = process.env.STRIPE_PRO_PRICE_ID;
    } else {
      return res.status(400).json({ 
        error: 'Plan invalide' 
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
        planId
      }
    });

    res.json({
      sessionId: session.id,
      sessionUrl: session.url
    });

  } catch (error) {
    console.error('Erreur création session:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la session de paiement',
      details: error.message 
    });
  }
});

// Route pour vérifier le statut d'un paiement
app.get('/api/stripe/check-payment-status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      status: session.payment_status,
      subscriptionId: session.subscription
    });

  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la vérification du paiement',
      details: error.message 
    });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API Stripe fonctionnelle' });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    details: error.message 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur API démarré sur le port ${PORT}`);
  console.log(`URL de l'API: http://localhost:${PORT}`);
}); 