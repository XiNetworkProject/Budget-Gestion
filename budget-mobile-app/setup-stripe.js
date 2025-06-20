#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 Configuration Stripe - Assistant de setup\n');

// Vérifier si le fichier existe déjà
const configPath = path.join(__dirname, 'stripe-config.js');
if (fs.existsSync(configPath)) {
  console.log('⚠️  Le fichier stripe-config.js existe déjà.');
  rl.question('Voulez-vous le remplacer ? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      createConfig();
    } else {
      console.log('Configuration annulée.');
      rl.close();
    }
  });
} else {
  createConfig();
}

function createConfig() {
  console.log('\n📝 Veuillez fournir vos informations Stripe :\n');
  
  rl.question('🔑 Clé publique Stripe (pk_test_... ou pk_live_...): ', (publishableKey) => {
    if (!publishableKey.startsWith('pk_')) {
      console.log('❌ Erreur: La clé publique doit commencer par "pk_"');
      rl.close();
      return;
    }
    
    rl.question('🌍 Mode (test/live) [test]: ', (mode) => {
      mode = mode || 'test';
      
      rl.question('📧 Emails d\'accès spécial (séparés par des virgules, optionnel): ', (specialEmails) => {
        const emails = specialEmails ? specialEmails.split(',').map(e => e.trim()) : [];
        
        // Générer le contenu du fichier
        const configContent = `// Configuration Stripe - Généré automatiquement
// ⚠️  NE PAS COMMITER CE FICHIER DANS GIT

export const STRIPE_CONFIG = {
  // Clé publique (visible côté client)
  publishableKey: '${publishableKey}',
  
  // Mode de Stripe (test ou live)
  mode: '${mode}',
  
  // Configuration des accès spéciaux (optionnel)
  specialAccessEmails: ${JSON.stringify(emails, null, 2)},
  
  // Configuration des plans (optionnel)
  plans: {
    premium: {
      priceId: 'price_premium_monthly',
      name: 'Premium',
      price: 1.99
    },
    pro: {
      priceId: 'price_pro_monthly', 
      name: 'Pro',
      price: 5.99
    }
  }
};

// Informations de sécurité :
// - Ce fichier contient des clés sensibles
// - Il est automatiquement ignoré par Git (.gitignore)
// - Ne partagez jamais ce fichier publiquement
// - Pour la production, utilisez les clés 'live'
`;

        // Écrire le fichier
        try {
          fs.writeFileSync(configPath, configContent);
          console.log('\n✅ Configuration Stripe créée avec succès !');
          console.log(`📁 Fichier: ${configPath}`);
          console.log('\n🔒 Sécurité:');
          console.log('- Le fichier est automatiquement ignoré par Git');
          console.log('- Ne partagez jamais ce fichier publiquement');
          console.log('- Pour la production, utilisez les clés "live"');
          
          console.log('\n🧪 Test rapide:');
          console.log('1. Démarrez votre application: npm start');
          console.log('2. Ouvrez la console du navigateur');
          console.log('3. Testez: await import("@stripe/stripe-js").then(s => s.loadStripe("${publishableKey}"))');
          
        } catch (error) {
          console.error('❌ Erreur lors de la création du fichier:', error.message);
        }
        
        rl.close();
      });
    });
  });
}

rl.on('close', () => {
  console.log('\n🎉 Configuration terminée !');
  process.exit(0);
}); 