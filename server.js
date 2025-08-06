import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'vite';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Middleware de sécurité
app.use(helmet());
app.use(compression());

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});
app.use('/api/', limiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));

// Middleware d'authentification basique (à adapter selon votre système)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  // Pour l'instant, on accepte tous les tokens (à adapter selon votre système JWT)
  try {
    req.user = { id: 'user-id', email: 'user@example.com' }; // Placeholder
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide' });
  }
};

// Routes Stripe (avec les vrais Price IDs)
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

app.post('/api/stripe/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { planId, promoCode, userId, userEmail } = req.body;
    
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
          discount = {
            type: 'coupon',
            coupon: 'FREEMONTH'
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
      success_url: `${process.env.FRONTEND_URL || 'https://budget-mobile-app-pa2n.onrender.com'}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://budget-mobile-app-pa2n.onrender.com'}/subscription?canceled=true`,
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

    // Simulation de la session (à remplacer par la vraie intégration Stripe)
    const sessionId = `cs_test_${Date.now()}`;
    const sessionUrl = `https://checkout.stripe.com/pay/${sessionId}`;
    
    res.json({
      sessionId,
      sessionUrl
    });

  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la session de paiement' });
  }
});

app.get('/api/stripe/check-payment-status/:sessionId', authenticateToken, (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Simulation du statut de paiement
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

app.post('/api/stripe/cancel-subscription', authenticateToken, (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    // Simulation de l'annulation
    res.json({ 
      success: true, 
      message: 'Abonnement annulé avec succès'
    });
  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation de l\'abonnement' });
  }
});

app.get('/api/stripe/payment-history/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    
    // Simulation de l'historique
    res.json({
      payments: [],
      subscriptions: []
    });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
  }
});

app.post('/api/stripe/update-payment-method', authenticateToken, (req, res) => {
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

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Route de test Stripe
app.get('/api/stripe/test', (req, res) => {
  res.json({ 
    message: 'Stripe API accessible (simulation)',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ? 'Configuré' : 'Non configuré'
  });
});

// Servir les fichiers statiques du dossier dist
app.use(express.static(join(__dirname, 'dist')));

// Route pour toutes les autres requêtes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${port}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configuré' : 'Non configuré (simulation)'}`);
}); 