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
      checkoutUrl: 'https://buy.stripe.com/dRm5kDfwF0I7frw331fAc01', // URL Premium
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
      checkoutUrl: 'https://buy.stripe.com/bJe28rbgpduTbbgcDBfAc00', // URL Pro
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
    
    // Compter les documents dans la collection budgets
    const budgetCount = await db.collection('budgets').countDocuments();
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'Application is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      budgetCount: budgetCount
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

// Route de debug pour vérifier les données d'un utilisateur
app.get('/api/debug/user/:userId', verifyAuth, async (req, res) => {
  try {
    const paramUserId = req.params.userId;
    if (req.user.id !== paramUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    console.log('=== DEBUG UTILISATEUR ===');
    console.log('userId:', paramUserId);
    console.log('user.email:', req.user.email);
    
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const data = await db.collection('budgets').findOne({ userId: paramUserId });
    
    if (data) {
      res.json({
        success: true,
        user: {
          id: req.user.id,
          email: req.user.email
        },
        data: {
          hasData: true,
          keys: Object.keys(data),
          expensesCount: data.expenses?.length || 0,
          incomeCount: data.incomeTransactions?.length || 0,
          onboardingCompleted: data.onboardingCompleted,
          lastUpdate: data.updatedAt
        }
      });
    } else {
      res.json({
        success: true,
        user: {
          id: req.user.id,
          email: req.user.email
        },
        data: {
          hasData: false,
          message: 'Aucune donnée trouvée pour cet utilisateur'
        }
      });
    }
  } catch (error) {
    console.error('Erreur debug utilisateur:', error);
    res.status(500).json({ error: error.message });
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
      console.error('Tentative d\'accès non autorisé:', { 
        requestedUserId: paramUserId, 
        authenticatedUserId: req.user.id 
      });
      return res.status(403).json({ error: 'Forbidden' });
    }
    const userId = paramUserId;
    console.log('=== RÉCUPÉRATION DU BUDGET ===');
    console.log('userId:', userId);
    console.log('user.email:', req.user.email);

    // Vérifier que la base de données est connectée
    if (!db) {
      console.error('Base de données non connectée');
      return res.status(503).json({ error: 'Database not connected' });
    }

    const data = await db.collection('budgets').findOne({ userId });
    console.log('Données trouvées:', data ? 'Oui' : 'Non');
    if (data) {
      console.log('Structure des données:', Object.keys(data));
      console.log('Nombre de dépenses:', data.expenses?.length || 0);
      console.log('Nombre de revenus:', data.incomeTransactions?.length || 0);
      console.log('Onboarding terminé:', data.onboardingCompleted);
    } else {
      console.log('Aucune donnée trouvée pour cet utilisateur');
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

// Route de test pour vérifier la configuration Stripe
app.get('/api/stripe/debug', async (req, res) => {
  try {
    console.log('=== TEST CONFIGURATION STRIPE ===');
    
    // Vérifier si Stripe est configuré
    if (!stripe) {
      console.error('Stripe n\'est pas configuré !');
      return res.json({
        success: false,
        error: 'Stripe n\'est pas configuré',
        hasStripe: false
      });
    }
    
    console.log('Stripe est configuré');
    
    // Tester la connexion Stripe
    try {
      const account = await stripe.accounts.retrieve();
      console.log('Connexion Stripe réussie');
      
      // Lister quelques clients pour tester
      const customers = await stripe.customers.list({ limit: 5 });
      console.log('Clients trouvés:', customers.data.length);
      
      // Lister quelques abonnements pour tester
      const subscriptions = await stripe.subscriptions.list({ limit: 5 });
      console.log('Abonnements trouvés:', subscriptions.data.length);
      
      // Lister quelques prix pour tester
      const prices = await stripe.prices.list({ limit: 10 });
      console.log('Prix trouvés:', prices.data.length);
      
      res.json({
        success: true,
        hasStripe: true,
        account: {
          id: account.id,
          business_type: account.business_type,
          country: account.country
        },
        stats: {
          customers: customers.data.length,
          subscriptions: subscriptions.data.length,
          prices: prices.data.length
        },
        prices: prices.data.map(price => ({
          id: price.id,
          nickname: price.nickname,
          unit_amount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring
        }))
      });
      
    } catch (stripeError) {
      console.error('Erreur de connexion Stripe:', stripeError);
      res.json({
        success: false,
        hasStripe: true,
        error: stripeError.message,
        type: stripeError.type,
        code: stripeError.code
      });
    }
    
  } catch (error) {
    console.error('Erreur lors du test Stripe:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route pour récupérer les informations d'abonnement depuis Stripe
app.get('/api/stripe/subscription-info', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    console.log('=== DÉBUT RECHERCHE ABONNEMENT ===');
    console.log('Recherche d\'abonnement pour:', { userId, userEmail });
    
    // Vérifier si Stripe est configuré
    if (!stripe) {
      console.error('Stripe n\'est pas configuré !');
      return res.status(500).json({ 
        success: false,
        error: 'Stripe n\'est pas configuré' 
      });
    }
    
    // Rechercher le client Stripe par email
    let customer = null;
    try {
      console.log('Recherche du client Stripe avec email:', userEmail);
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 10 // Augmenter la limite pour voir tous les clients
      });
      
      console.log('Clients Stripe trouvés:', customers.data.length);
      customers.data.forEach((cust, index) => {
        console.log(`Client ${index + 1}:`, {
          id: cust.id,
          email: cust.email,
          name: cust.name,
          created: new Date(cust.created * 1000)
        });
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log('Client Stripe sélectionné:', customer.id);
      } else {
        console.log('Aucun client Stripe trouvé avec cet email');
      }
    } catch (stripeError) {
      console.error('Erreur lors de la recherche du client Stripe:', stripeError);
      console.error('Détails de l\'erreur:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code
      });
    }
    
    // Si on a trouvé un client, chercher ses abonnements
    if (customer) {
      try {
        console.log('Recherche des abonnements pour le client:', customer.id);
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all', // Inclure les abonnements actifs, annulés, etc.
          expand: ['data.default_payment_method', 'data.items.data.price']
        });
        
        console.log('Abonnements trouvés:', subscriptions.data.length);
        subscriptions.data.forEach((sub, index) => {
          console.log(`Abonnement ${index + 1}:`, {
            id: sub.id,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            priceId: sub.items.data[0]?.price?.id,
            priceAmount: sub.items.data[0]?.price?.unit_amount,
            priceCurrency: sub.items.data[0]?.price?.currency
          });
        });
        
        // Chercher l'abonnement actif ou en période d'essai
        const activeSubscription = subscriptions.data.find(sub => 
          sub.status === 'active' || sub.status === 'trialing'
        );
        
        if (activeSubscription) {
          console.log('Abonnement actif trouvé:', {
            id: activeSubscription.id,
            status: activeSubscription.status,
            currentPeriodEnd: activeSubscription.current_period_end,
            trialEnd: activeSubscription.trial_end,
            priceId: activeSubscription.items.data[0]?.price?.id
          });
          
          // Déterminer le plan basé sur le prix
          let planId = 'FREE';
          const priceId = activeSubscription.items.data[0].price.id;
          console.log('Price ID de l\'abonnement:', priceId);
          
          // Mapper les Price IDs vers les plans
          if (priceId === 'price_1RcAEjGb8GKvvz2G9mn9OlJs') {
            planId = 'PRO';
            console.log('Plan détecté: PRO');
          } else if (priceId === 'price_1RcAERGb8GKvvz2GAyajrGFo') {
            planId = 'PREMIUM';
            console.log('Plan détecté: PREMIUM');
          } else {
            console.log('Price ID non reconnu, plan par défaut: FREE');
            console.log('Price IDs attendus:');
            console.log('- Pro: price_1RcAEjGb8GKvvz2G9mn9OlJs');
            console.log('- Premium: price_1RcAERGb8GKvvz2GAyajrGFo');
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
          
          console.log('Informations d\'abonnement finales:', subscriptionInfo);
          
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
            console.log('Informations d\'abonnement sauvegardées dans MongoDB');
          } catch (dbError) {
            console.warn('Erreur lors de la sauvegarde des infos d\'abonnement:', dbError);
          }
          
          console.log('=== FIN RECHERCHE ABONNEMENT - SUCCÈS ===');
          return res.json({
            success: true,
            subscription: subscriptionInfo
          });
        } else {
          console.log('Aucun abonnement actif ou en période d\'essai trouvé');
        }
      } catch (subscriptionError) {
        console.error('Erreur lors de la récupération des abonnements:', subscriptionError);
        console.error('Détails de l\'erreur:', {
          message: subscriptionError.message,
          type: subscriptionError.type,
          code: subscriptionError.code
        });
      }
    } else {
      console.log('Aucun client Stripe trouvé, impossible de récupérer les abonnements');
    }
    
    // Si aucun abonnement trouvé, retourner le plan gratuit
    console.log('=== FIN RECHERCHE ABONNEMENT - PLAN GRATUIT ===');
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