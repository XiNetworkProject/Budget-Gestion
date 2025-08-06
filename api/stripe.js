import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configuration CORS pour Vercel
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Appliquer les headers CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const { method } = req;

    switch (method) {
      case 'POST':
        return await handleStripeRequest(req, res);
      default:
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur Stripe API:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleStripeRequest(req, res) {
  const { action, ...data } = req.body;

  switch (action) {
    case 'create-checkout-session':
      return await createCheckoutSession(req, res);
    case 'create-portal-session':
      return await createPortalSession(req, res);
    case 'subscription-info':
      return await getSubscriptionInfo(req, res);
    default:
      return res.status(400).json({ message: 'Action Stripe non reconnue' });
  }
}

// Créer une session de paiement Stripe
async function createCheckoutSession(req, res) {
  try {
    const { planId, promoCode, userId, userEmail } = req.body;
    
    // Plans Stripe avec les vrais Price IDs
    const STRIPE_PLANS = {
      PREMIUM: {
        priceId: 'price_1RcAEjGb8GKvvz2G9mn9OlJs',
        name: 'Premium',
        price: 1.99
      },
      PRO: {
        priceId: 'price_1RcAERGb8GKvvz2GAyajrGFo',
        name: 'Pro',
        price: 5.99
      }
    };

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
          discount = {
            type: 'coupon',
            coupon: 'FREEMONTH'
          };
        }
      }
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
      success_url: `${process.env.FRONTEND_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
        planId,
        promoCode: promoCode || ''
      },
      ...(discount && { discounts: [discount] })
    });

    return res.status(200).json({ 
      success: true, 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    return res.status(500).json({ message: 'Erreur lors de la création de la session de paiement' });
  }
}

// Créer une session du portail client Stripe
async function createPortalSession(req, res) {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: 'customerId requis' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/subscription`,
    });

    return res.status(200).json({ 
      success: true, 
      url: session.url 
    });
  } catch (error) {
    console.error('Erreur création session portail:', error);
    return res.status(500).json({ message: 'Erreur lors de la création de la session portail' });
  }
}

// Récupérer les informations d'abonnement
async function getSubscriptionInfo(req, res) {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: 'customerId requis' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      expand: ['data.default_payment_method']
    });

    if (subscriptions.data.length === 0) {
      return res.status(200).json({ 
        success: true, 
        subscription: null 
      });
    }

    const subscription = subscriptions.data[0];
    const planId = subscription.items.data[0].price.id;

    // Mapper les Price IDs vers les plans
    const planMapping = {
      'price_1RcAEjGb8GKvvz2G9mn9OlJs': 'PREMIUM',
      'price_1RcAERGb8GKvvz2GAyajrGFo': 'PRO'
    };

    const subscriptionInfo = {
      planId: planMapping[planId] || 'FREE',
      status: subscription.status,
      createdAt: new Date(subscription.created * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      customerId: subscription.customer,
      subscriptionId: subscription.id,
      isTrialing: subscription.status === 'trialing',
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    };

    return res.status(200).json({ 
      success: true, 
      subscription: subscriptionInfo 
    });
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération de l\'abonnement' });
  }
} 