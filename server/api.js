import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import webPush from 'web-push';
import cron from 'node-cron';
import express from 'express';

// Charger les variables d'environnement
dotenv.config();

// Configuration VAPID pour Push API
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
webPush.setVapidDetails(
  'mailto:votre-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Stockage temporaire des souscriptions Push
let subscriptions = [];

const app = express();
app.use(express.json());

// Route pour enregistrer la souscription Push
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log('Nouvelle souscription Push enregistrée');
  res.sendStatus(201);
});

// ... existing code ... 