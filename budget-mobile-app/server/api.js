import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { OAuth2Client } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
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