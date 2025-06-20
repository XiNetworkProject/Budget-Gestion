const express = require('express');
const stripe = require('stripe');
const router = express.Router();

// Configuration Stripe avec vos clés live
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Plans d'abonnement Stripe (à créer dans votre dashboard Stripe)
const STRIPE_PLANS = {
  PREMIUM: {
    priceId: 'price_premium_monthly', // À remplacer par votre vrai price ID
    name: 'Premium',
    price: 1.99
  },
  PRO: {
    priceId: 'price_pro_monthly', // À remplacer par votre vrai price ID
    name: 'Pro',
    price: 5.99
  }
};

// Créer une session de paiement Stripe
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { planId, promoCode, userId, userEmail } = req.body;

    // Vérifier que l'utilisateur est connecté
    if (!req.user || req.user.id !== userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Vérifier le plan
    const plan = STRIPE_PLANS[planId];
    if (!plan) {
      return res.status(400).json({ message: 'Plan invalide' });
    }

    // Appliquer le code promo si fourni
    let discount = null;
    if (promoCode) {
      const promoCodes = {
        'DEV2024': { discount: 100, type: 'percentage' },
        'TEST50': { discount: 50, type: 'percentage' },
        'FREEMONTH': { discount: 1, type: 'months' }
      };
      
      const promo = promoCodes[promoCode.toUpperCase()];
      if (promo) {
        if (promo.type === 'percentage') {
          discount = {
            type: 'percentage',
            amount_off: Math.round(plan.price * 100 * promo.discount / 100)
          };
        } else if (promo.type === 'months') {
          // Pour les mois gratuits, on utilise un coupon Stripe
          discount = {
            type: 'coupon',
            coupon: 'FREEMONTH' // À créer dans votre dashboard Stripe
          };
        }
      }
    }

    // Créer la session Stripe Checkout
    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        planId: planId,
        promoCode: promoCode || ''
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId
        }
      }
    };

    // Ajouter la réduction si applicable
    if (discount) {
      if (discount.type === 'percentage') {
        sessionParams.line_items[0].price_data = {
          currency: 'eur',
          product_data: {
            name: plan.name,
          },
          unit_amount: Math.round(plan.price * 100 * (100 - discount.amount_off) / 100),
        };
        delete sessionParams.line_items[0].price;
      } else if (discount.type === 'coupon') {
        sessionParams.discounts = [
          {
            coupon: discount.coupon,
          },
        ];
      }
    }

    const session = await stripeInstance.checkout.sessions.create(sessionParams);

    res.json({
      sessionId: session.id,
      sessionUrl: session.url
    });

  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la session de paiement' });
  }
});

// Webhook Stripe pour gérer les événements
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Erreur webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    res.status(500).json({ message: 'Erreur lors du traitement du webhook' });
  }
});

// Vérifier le statut d'un paiement
router.get('/check-payment-status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    
    res.json({
      status: session.payment_status,
      subscriptionId: session.subscription,
      customerId: session.customer
    });
  } catch (error) {
    console.error('Erreur vérification statut:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification du statut' });
  }
});

// Annuler un abonnement
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const subscription = await stripeInstance.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Mettre à jour la base de données
    await updateUserSubscription(req.user.id, {
      status: 'cancelled',
      endDate: new Date(subscription.current_period_end * 1000)
    });

    res.json({ 
      success: true, 
      message: 'Abonnement annulé avec succès',
      subscription 
    });
  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation de l\'abonnement' });
  }
});

// Récupérer l'historique des paiements
router.get('/payment-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!req.user || req.user.id !== userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Récupérer les paiements depuis Stripe
    const payments = await stripeInstance.paymentIntents.list({
      limit: 50
    });

    // Récupérer les abonnements
    const subscriptions = await stripeInstance.subscriptions.list({
      limit: 50
    });

    res.json({
      payments: payments.data,
      subscriptions: subscriptions.data
    });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
  }
});

// Mettre à jour la méthode de paiement
router.post('/update-payment-method', async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Récupérer l'abonnement actuel de l'utilisateur
    const userSubscription = await getUserSubscription(req.user.id);
    
    if (!userSubscription || !userSubscription.stripeSubscriptionId) {
      return res.status(400).json({ message: 'Aucun abonnement actif trouvé' });
    }

    // Mettre à jour la méthode de paiement
    await stripeInstance.subscriptions.update(userSubscription.stripeSubscriptionId, {
      default_payment_method: paymentMethodId,
    });

    res.json({ 
      success: true, 
      message: 'Méthode de paiement mise à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur mise à jour méthode de paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la méthode de paiement' });
  }
});

// Fonctions utilitaires pour la base de données
async function handleCheckoutSessionCompleted(session) {
  const { userId, planId } = session.metadata;
  
  // Mettre à jour l'abonnement de l'utilisateur
  await updateUserSubscription(userId, {
    currentPlan: planId,
    status: 'active',
    startDate: new Date(),
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription
  });
}

async function handleSubscriptionCreated(subscription) {
  const { userId, planId } = subscription.metadata;
  
  await updateUserSubscription(userId, {
    currentPlan: planId,
    status: 'active',
    stripeSubscriptionId: subscription.id
  });
}

async function handleSubscriptionUpdated(subscription) {
  const { userId } = subscription.metadata;
  
  await updateUserSubscription(userId, {
    status: subscription.status,
    endDate: subscription.cancel_at_period_end ? new Date(subscription.current_period_end * 1000) : null
  });
}

async function handleSubscriptionDeleted(subscription) {
  const { userId } = subscription.metadata;
  
  await updateUserSubscription(userId, {
    status: 'cancelled',
    endDate: new Date()
  });
}

async function handlePaymentSucceeded(invoice) {
  // Logique pour gérer un paiement réussi
  console.log('Paiement réussi:', invoice.id);
}

async function handlePaymentFailed(invoice) {
  // Logique pour gérer un échec de paiement
  console.log('Échec de paiement:', invoice.id);
}

// Fonctions pour interagir avec votre base de données existante
async function updateUserSubscription(userId, subscriptionData) {
  // Intégrer avec votre système de base de données existant
  // Cette fonction doit être adaptée à votre schéma MongoDB
  try {
    // Exemple d'intégration avec votre modèle existant
    const db = require('./database'); // Votre connexion MongoDB
    const User = require('./models/User'); // Votre modèle User
    
    await User.findByIdAndUpdate(userId, {
      $set: {
        subscription: subscriptionData
      }
    });
    
    console.log(`Abonnement mis à jour pour l'utilisateur ${userId}:`, subscriptionData);
  } catch (error) {
    console.error('Erreur mise à jour abonnement en base:', error);
  }
}

async function getUserSubscription(userId) {
  try {
    const db = require('./database');
    const User = require('./models/User');
    
    const user = await User.findById(userId);
    return user?.subscription || null;
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    return null;
  }
}

module.exports = router; 