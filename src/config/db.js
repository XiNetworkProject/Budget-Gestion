import { MongoClient } from 'mongodb';

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI;
const MONGODB_DB = import.meta.env.VITE_MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error('Veuillez définir l\'URI MongoDB dans les variables d\'environnement');
}

if (!MONGODB_DB) {
  throw new Error('Veuillez définir le nom de la base de données MongoDB dans les variables d\'environnement');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
} 