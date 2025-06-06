import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration MongoDB
const MONGODB_URI = process.env.VITE_MONGODB_URI;
const MONGODB_DB = process.env.VITE_MONGODB_DB || 'budget_app';

let client;
let db;

async function connectToDatabase() {
  if (client) return { client, db };
  
  client = await MongoClient.connect(MONGODB_URI);
  db = client.db(MONGODB_DB);
  return { client, db };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes API
app.post('/api/budget/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;
    const { db } = await connectToDatabase();
    
    await db.collection('budgets').updateOne(
      { userId },
      { 
        $set: { 
          userId,
          ...data,
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving budget:', error);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

app.get('/api/budget/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { db } = await connectToDatabase();
    
    const result = await db.collection('budgets').findOne({ userId });
    if (!result) {
      return res.json(null);
    }
    
    // Supprimer les champs techniques de la réponse
    const { _id, userId: _, updatedAt, ...data } = result;
    res.json(data);
  } catch (error) {
    console.error('Error getting budget:', error);
    res.status(500).json({ error: 'Failed to get budget' });
  }
});

app.delete('/api/budget/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { db } = await connectToDatabase();
    
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