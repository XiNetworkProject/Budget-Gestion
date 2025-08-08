import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method } = req;
    if (method !== 'POST') {
      return res.status(405).json({ message: 'Méthode non autorisée' });
    }
    return await handleStripeRequest(req, res);
  } catch (error) {
    console.error('Erreur Stripe API:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleStripeRequest(req, res) {
  const { action } = req.body || {};
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

async function createCheckoutSession(req, res) {
  const { planId, promoCode, userId, userEmail } = req.body || {};
  if (!planId || !userEmail) return res.status(400).json({ message: 'Paramètres requis manquants' });

  const STRIPE_PLANS = {
    PREMIUM: { priceId: 'price_1RcAEjGb8GKvvz2G9mn9OlJs', name: 'Premium', price: 1.99 },
    PRO: { priceId: 'price_1RcAERGb8GKvvz2GAyajrGFo', name: 'Pro', price: 5.99 }
  };
  const plan = STRIPE_PLANS[planId];
  if (!plan) return res.status(400).json({ message: 'Plan invalide' });

  let discount = null;
  if (promoCode) {
    const promoCodes = {
      DEV2024: { discount: 100, type: 'percentage' },
      TEST50: { discount: 50, type: 'percentage' },
      FREEMONTH: { discount: 1, type: 'months' }
    };
    const promo = promoCodes[(promoCode || '').toUpperCase()];
    if (promo) {
      discount = promo.type === 'percentage'
        ? { type: 'percentage', amount_off: Math.round(plan.price * 100 * promo.discount / 100) }
        : { type: 'coupon', coupon: 'FREEMONTH' };
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription?canceled=true`,
    customer_email: userEmail,
    metadata: { userId, planId, promoCode: promoCode || '' },
    ...(discount && { discounts: [discount] })
  });
  return res.status(200).json({ success: true, sessionId: session.id, url: session.url });
}

async function createPortalSession(req, res) {
  const { customerId } = req.body || {};
  // Si pas de customerId, retourner un état par défaut sans erreur bloquante
  if (!customerId) return res.status(200).json({ success: true, subscription: null });
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/subscription`
  });
  return res.status(200).json({ success: true, url: session.url });
}

async function getSubscriptionInfo(req, res) {
  const { customerId, userEmail } = req.body || {};

  let resolvedCustomerId = customerId || null;
  if (!resolvedCustomerId && userEmail) {
    try {
      const customers = await stripe.customers.list({ email: userEmail, limit: 10 });
      if (customers.data.length > 0) {
        resolvedCustomerId = customers.data[0].id;
      }
    } catch (e) {
      console.warn('Recherche client Stripe par email échouée:', e?.message);
    }
  }

  if (!resolvedCustomerId) return res.status(200).json({ success: true, subscription: null });

  const subscriptions = await stripe.subscriptions.list({ customer: resolvedCustomerId, status: 'all', expand: ['data.default_payment_method','data.items.data.price'] });
  if (subscriptions.data.length === 0) return res.status(200).json({ success: true, subscription: null });
  const sub = subscriptions.data.find(s => s.status === 'active' || s.status === 'trialing') || subscriptions.data[0];
  const planId = sub.items.data[0].price.id;
  const planMapping = { 'price_1RcAEjGb8GKvvz2G9mn9OlJs': 'PREMIUM', 'price_1RcAERGb8GKvvz2GAyajrGFo': 'PRO' };
  const subscriptionInfo = {
    planId: planMapping[planId] || 'FREE',
    status: sub.status,
    createdAt: new Date(sub.created * 1000).toISOString(),
    currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
    customerId: resolvedCustomerId,
    subscriptionId: sub.id,
    isTrialing: sub.status === 'trialing',
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end
  };
  return res.status(200).json({ success: true, subscription: subscriptionInfo });
}

export const config = { runtime: 'nodejs' };

