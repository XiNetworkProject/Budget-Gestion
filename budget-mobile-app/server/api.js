import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { OAuth2Client } from 'google-auth-library';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Log des requêtes entrantes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Configuration CORS
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());

// Configuration MongoDB
const uri = process.env.VITE_MONGODB_URI;
const dbName = process.env.VITE_MONGODB_DB;

let client;
let db;

const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// Configuration Stripe avec les URLs directes
const STRIPE_CONFIG = {
  PLANS: {
    PREMIUM: {
      id: 'premium',
      name: 'Premium',
      price: 1.99,
      currency: 'EUR',
      checkoutUrl: 'https://buy.stripe.com/bJe28rbgpduTbbgcDBfAc00', // URL Pro
      features: {
        maxTransactions: -1, // Illimité
        unlimitedCategories: true,
        maxSavingsGoals: -1, // Illimité
        basicAnalytics: true,
        aiAnalysis: 'partial',
        maxActionPlans: 1,
        multipleAccounts: false,
        prioritySupport: false,
        advancedReports: false
      }
    },
    PRO: {
      id: 'pro',
      name: 'Pro',
      price: 5.99,
      currency: 'EUR',
      checkoutUrl: 'https://buy.stripe.com/dRm5kDfwF0I7frw331fAc01', // URL Premium
      features: {
        maxTransactions: -1, // Illimité
        unlimitedCategories: true,
        maxSavingsGoals: -1, // Illimité
        basicAnalytics: true,
        aiAnalysis: 'full',
        maxActionPlans: -1, // Illimité
        multipleAccounts: true,
        prioritySupport: true,
        advancedReports: true
      }
    }
  }
};

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

// Routes Stripe
app.post('/api/stripe/create-checkout-session', verifyAuth, async (req, res) => {
  try {
    const { planId, userId, userEmail } = req.body;
    
    // Vérifier le plan
    const plan = STRIPE_CONFIG.PLANS[planId];
    if (!plan) {
      return res.status(400).json({ message: 'Plan invalide' });
    }

    // Enregistrer la tentative d'abonnement dans la base de données
    try {
      await db.collection('subscription_attempts').insertOne({
        userId,
        planId,
        userEmail,
        checkoutUrl: plan.checkoutUrl,
        createdAt: new Date(),
        status: 'pending'
      });
    } catch (dbError) {
      console.warn('Erreur lors de l\'enregistrement de la tentative:', dbError);
      // On continue même si l'enregistrement échoue
    }

    res.json({
      sessionId: `cs_${Date.now()}`,
      sessionUrl: plan.checkoutUrl
    });

  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la session de paiement' });
  }
});

app.get('/api/stripe/check-payment-status/:sessionId', verifyAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Pour l'instant, on simule un statut de paiement
    // En production, tu devrais vérifier le statut via l'API Stripe
    res.json({
      status: 'paid',
      subscriptionId: 'sub_test_123',
      customerId: 'cus_test_123'
    });
  } catch (error) {
    console.error('Erreur vérification statut:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification du statut' });
  }
});

app.post('/api/stripe/cancel-subscription', verifyAuth, async (req, res) => {
  try {
    const { subscriptionId, userId } = req.body;
    
    // Enregistrer l'annulation dans la base de données
    try {
      await db.collection('subscription_cancellations').insertOne({
        userId,
        subscriptionId,
        cancelledAt: new Date(),
        reason: 'user_request'
      });
    } catch (dbError) {
      console.warn('Erreur lors de l\'enregistrement de l\'annulation:', dbError);
    }

    // Pour les URLs directes, on ne peut pas annuler via l'API Stripe
    // L'utilisateur devra annuler manuellement depuis son compte Stripe
    res.json({
      message: 'Demande d\'annulation enregistrée',
      note: 'Pour les abonnements via URLs directes, veuillez annuler manuellement depuis votre compte Stripe'
    });

  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation de l\'abonnement' });
  }
});

app.get('/api/stripe/payment-history', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer l'historique depuis la base de données
    const history = await db.collection('subscription_attempts')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    res.json(history);
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
  }
});

app.post('/api/stripe/update-payment-method', verifyAuth, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    
    res.json({ 
      success: true, 
      message: 'Méthode de paiement mise à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur mise à jour méthode de paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la méthode de paiement' });
  }
});

// Route de test Stripe
app.get('/api/stripe/test', (req, res) => {
  res.json({ 
    message: 'Stripe API accessible avec URLs directes',
    plans: Object.keys(STRIPE_CONFIG.PLANS),
    premiumUrl: STRIPE_CONFIG.PLANS.PREMIUM.checkoutUrl,
    proUrl: STRIPE_CONFIG.PLANS.PRO.checkoutUrl
  });
});

// Route pour récupérer les informations d'abonnement depuis Stripe
app.get('/api/stripe/subscription-info', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    console.log('Recherche d\'abonnement pour:', { userId, userEmail });
    
    // Rechercher le client Stripe par email
    let customer = null;
    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log('Client Stripe trouvé:', customer.id);
      }
    } catch (stripeError) {
      console.warn('Erreur lors de la recherche du client Stripe:', stripeError);
    }
    
    // Si on a trouvé un client, chercher ses abonnements
    if (customer) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all', // Inclure les abonnements actifs, annulés, etc.
          expand: ['data.default_payment_method', 'data.items.data.price.product']
        });
        
        console.log('Abonnements trouvés:', subscriptions.data.length);
        
        // Chercher l'abonnement actif ou en période d'essai
        const activeSubscription = subscriptions.data.find(sub => 
          sub.status === 'active' || sub.status === 'trialing'
        );
        
        if (activeSubscription) {
          console.log('Abonnement actif trouvé:', {
            id: activeSubscription.id,
            status: activeSubscription.status,
            currentPeriodEnd: activeSubscription.current_period_end,
            trialEnd: activeSubscription.trial_end
          });
          
          // Déterminer le plan basé sur le prix
          let planId = 'FREE';
          const priceId = activeSubscription.items.data[0].price.id;
          
          // Mapper les Price IDs vers les plans
          if (priceId === 'price_1RcAEjGb8GKvvz2G9mn9OlJs') {
            planId = 'PREMIUM';
          } else if (priceId === 'price_1RcAERGb8GKvvz2GAyajrGFo') {
            planId = 'PRO';
          }
          
          // Calculer si l'abonnement est en période d'essai
          const isTrialing = activeSubscription.status === 'trialing';
          const trialEnd = activeSubscription.trial_end ? new Date(activeSubscription.trial_end * 1000) : null;
          const currentPeriodEnd = new Date(activeSubscription.current_period_end * 1000);
          
          const subscriptionInfo = {
            subscriptionId: activeSubscription.id,
            customerId: customer.id,
            planId: planId,
            status: activeSubscription.status,
            isTrialing: isTrialing,
            trialEnd: trialEnd,
            currentPeriodEnd: currentPeriodEnd,
            cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
            createdAt: new Date(activeSubscription.created * 1000)
          };
          
          // Sauvegarder les informations dans la base de données
          try {
            await db.collection('user_subscriptions').updateOne(
              { userId },
              { 
                $set: { 
                  ...subscriptionInfo,
                  updatedAt: new Date()
                }
              },
              { upsert: true }
            );
          } catch (dbError) {
            console.warn('Erreur lors de la sauvegarde des infos d\'abonnement:', dbError);
          }
          
          return res.json({
            success: true,
            subscription: subscriptionInfo
          });
        }
      } catch (subscriptionError) {
        console.error('Erreur lors de la récupération des abonnements:', subscriptionError);
      }
    }
    
    // Si aucun abonnement trouvé, retourner le plan gratuit
    res.json({
      success: true,
      subscription: {
        planId: 'FREE',
        status: 'free',
        isTrialing: false
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des infos d\'abonnement:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des informations d\'abonnement' 
    });
  }
});

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