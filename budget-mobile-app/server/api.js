import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { OAuth2Client } from 'google-auth-library';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import helmet from 'helmet';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Configuration Stripe avec les vrais Price IDs
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

// Configuration Helmet sans CSP restrictive pour tester Google Auth
app.use(helmet({
  contentSecurityPolicy: false
}));

// Log des requêtes entrantes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Configuration CORS
app.use(cors());

// Middleware pour parser le JSON (sauf pour les webhooks Stripe)
app.use((req, res, next) => {
  if (req.path === '/api/stripe/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// Configuration MongoDB
const uri = process.env.VITE_MONGODB_URI;
const dbName = process.env.VITE_MONGODB_DB;

let client;
let db;

const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

async function connectToMongo() {
  try {
    console.log('URI MongoDB:', uri);
    console.log('Base de données:', dbName);
    
    client = new MongoClient(uri, {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      retryWrites: true,
      w: 'majority'
    });
    
    await client.connect();
    console.log('Connexion à MongoDB réussie !');
    
    db = client.db(dbName);
    
    // Vérification de la connexion
    const collections = await db.listCollections().toArray();
    console.log('Collections disponibles:', collections.map(c => c.name));
    
    return { client, db };
  } catch (error) {
    console.error('Erreur détaillée de connexion à MongoDB:', error);
    throw error;
  }
}

// Initialisation de la connexion au démarrage
connectToMongo().catch(console.error);

// Middleware pour vérifier le token Google
async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Health check endpoint simple (pour Render)
app.get('/health-simple', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Application is running',
    timestamp: new Date().toISOString()
  });
});

// Endpoint racine pour health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Budget Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint complet
app.get('/health', async (req, res) => {
  try {
    // Vérifier la connexion MongoDB
    if (!db) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Database not connected',
        timestamp: new Date().toISOString()
      });
    }
    
    // Test de connexion MongoDB
    await db.admin().ping();
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'Application is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'error', 
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Routes API
app.post('/api/budget', verifyAuth, async (req, res) => {
  try {
    const { userId: _ignored, ...data } = req.body;
    const userId = req.user.id;
    console.log('=== Sauvegarde du budget ===');
    console.log('userId:', userId);

    const result = await db.collection('budgets').updateOne(
      { userId },
      { $set: { userId, ...data, updatedAt: new Date() } },
      { upsert: true }
    );

    console.log('Résultat de la sauvegarde:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId
    });

    const savedData = await db.collection('budgets').findOne({ userId });
    console.log('Données sauvegardées:', savedData ? 'Oui' : 'Non');

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/budget/:userId', verifyAuth, async (req, res) => {
  try {
    const paramUserId = req.params.userId;
    if (req.user.id !== paramUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const userId = paramUserId;
    console.log('=== Récupération du budget ===');
    console.log('userId:', userId);

    const data = await db.collection('budgets').findOne({ userId });
    console.log('Données trouvées:', data ? 'Oui' : 'Non');
    if (data) {
      console.log('Structure des données:', Object.keys(data));
    }

    res.json(data || {});
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/budget/:userId', verifyAuth, async (req, res) => {
  try {
    const paramUserId = req.params.userId;
    if (req.user.id !== paramUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const userId = paramUserId;
    const { db } = await connectToMongo();

    await db.collection('budgets').deleteOne({ userId });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

// ===== ROUTES STRIPE =====

// Créer une session de paiement
app.post('/api/stripe/create-checkout-session', verifyAuth, async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!STRIPE_PLANS[planType]) {
      return res.status(400).json({ error: 'Plan invalide' });
    }

    const plan = STRIPE_PLANS[planType];
    const successUrl = `${req.protocol}://${req.get('host')}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${req.protocol}://${req.get('host')}/subscription?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        planType: planType
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook Stripe
app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Erreur webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleSubscriptionCreated(session);
        break;
      
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer l'historique des paiements
app.get('/api/stripe/payment-history', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les paiements depuis MongoDB
    const payments = await db.collection('payments').find({ 
      userId: userId 
    }).sort({ created: -1 }).toArray();

    res.json(payments);
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ error: error.message });
  }
});

// Annuler un abonnement
app.post('/api/stripe/cancel-subscription', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer l'abonnement actuel
    const subscription = await db.collection('subscriptions').findOne({ 
      userId: userId,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Aucun abonnement actif trouvé' });
    }

    // Annuler l'abonnement dans Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Mettre à jour en base
    await db.collection('subscriptions').updateOne(
      { _id: subscription._id },
      { 
        $set: { 
          status: 'canceled',
          canceledAt: new Date(),
          cancelAtPeriodEnd: true
        }
      }
    );

    res.json({ success: true, message: 'Abonnement annulé avec succès' });
  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fonctions de gestion des webhooks
async function handleSubscriptionCreated(session) {
  const userId = session.metadata.userId;
  const planType = session.metadata.planType;
  
  await db.collection('subscriptions').updateOne(
    { userId: userId },
    {
      $set: {
        userId: userId,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        planType: planType,
        status: 'active',
        createdAt: new Date(),
        currentPeriodStart: new Date(session.subscription_data.subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(session.subscription_data.subscription.current_period_end * 1000)
      }
    },
    { upsert: true }
  );

  // Enregistrer le paiement
  await db.collection('payments').insertOne({
    userId: userId,
    stripePaymentIntentId: session.payment_intent,
    amount: session.amount_total / 100,
    currency: session.currency,
    status: 'succeeded',
    created: new Date(),
    planType: planType
  });
}

async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db.collection('subscriptions').updateOne(
    { userId: userId },
    {
      $set: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date()
      }
    }
  );
}

async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db.collection('subscriptions').updateOne(
    { userId: userId },
    {
      $set: {
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date()
      }
    }
  );
}

async function handlePaymentSucceeded(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db.collection('payments').insertOne({
    userId: userId,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    status: 'succeeded',
    created: new Date(),
    planType: subscription.metadata?.planType
  });
}

async function handlePaymentFailed(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db.collection('payments').insertOne({
    userId: userId,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    status: 'failed',
    created: new Date(),
    planType: subscription.metadata?.planType
  });
}

// Servir les fichiers statiques
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Route par défaut pour l'application React
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Dist path: ${distPath}`);
}); 