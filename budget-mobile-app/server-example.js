// Exemple de serveur backend pour Stripe
// Ce fichier montre comment utiliser la clé secrète côté serveur

import express from 'express';
import Stripe from 'stripe';
import { SERVER_CONFIG } from './server-config.js';

const app = express();
app.use(express.json());

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(SERVER_CONFIG.stripeSecretKey);

// Route pour créer une session de paiement
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { planId, userId, promoCode } = req.body;
    
    // Récupérer le plan depuis la configuration
    const plan = SERVER_CONFIG.plans[planId];
    if (!plan) {
      return res.status(400).json({ error: 'Plan invalide' });
    }
    
    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/subscription?canceled=true`,
      metadata: {
        userId,
        planId,
        promoCode: promoCode || ''
      }
    });
    
    res.json({ id: session.id });
  } catch (error) {
    console.error('Erreur création session:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la session' });
  }
});

// Route pour annuler un abonnement
app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
    
    res.json({ 
      success: true, 
      subscription: subscription 
    });
  } catch (error) {
    console.error('Erreur annulation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation' });
  }
});

// Route pour récupérer un abonnement
app.get('/api/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    res.json(subscription);
  } catch (error) {
    console.error('Erreur récupération:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// Webhook pour les événements Stripe
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      SERVER_CONFIG.webhookSecret
    );
    
    // Gérer les événements
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Paiement réussi:', session.id);
        // Mettre à jour la base de données
        break;
        
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('Abonnement mis à jour:', subscription.id);
        // Mettre à jour la base de données
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Abonnement supprimé:', deletedSubscription.id);
        // Mettre à jour la base de données
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Stripe démarré sur le port ${PORT}`);
  console.log(`🔑 Clé secrète configurée: ${SERVER_CONFIG.stripeSecretKey.substring(0, 20)}...`);
});

// Instructions d'utilisation :
// 1. Copiez server-config.example.js vers server-config.js
// 2. Installez les dépendances: npm install express stripe
// 3. Démarrez le serveur: node server-example.js
// 4. Le serveur sera disponible sur http://localhost:3001 