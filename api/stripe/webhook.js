import Stripe from 'stripe';
import { supabase, TABLES } from '../supabase-config.js';

export const config = { api: { bodyParser: false }, runtime: 'nodejs' };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // CORS basique
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const subscriptionId = sub.id;
        const status = sub.status;
        const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
        const isTrialing = status === 'trialing';
        const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
        const cancelAtPeriodEnd = sub.cancel_at_period_end || false;

        // Déterminer le plan
        const price = sub.items?.data?.[0]?.price;
        let planId = 'FREE';
        const priceIdMapping = {
          'price_1RcAEjGb8GKvvz2G9mn9OlJs': 'PREMIUM',
          'price_1RcAERGb8GKvvz2GAyajrGFo': 'PRO'
        };
        planId = priceIdMapping[price?.id] || planId;

        // Trouver l'utilisateur par customerId dans subscriptions, sinon créer/mettre à jour
        await supabase.from(TABLES.SUBSCRIPTIONS)
          .upsert({
            user_id: null, // inconnu ici; nécessite un mapping utilisateur<->customerId en amont
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_id: planId,
            status: status,
            end_date: currentPeriodEnd,
            is_trialing: isTrialing,
            trial_end: trialEnd,
            cancel_at_period_end: cancelAtPeriodEnd,
            updated_at: new Date().toISOString()
          }, { onConflict: 'stripe_subscription_id' });
        break;
      }
      default:
        // Ignorer les autres events
        break;
    }
    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('Erreur webhook:', e);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}


