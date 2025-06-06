import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';

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

// Routes
app.post('/api/budget/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;
    const { db } = await connectToDatabase();
    
    await db.collection('budgets').updateOne(
      { userId },
      { $set: { data, updatedAt: new Date() } },
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
    res.json(result?.data || null);
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

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`API server running on port ${port}`);
}); 