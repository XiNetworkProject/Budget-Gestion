#!/usr/bin/env node

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

async function testConnection() {
  console.log('🔍 Test de connexion à l\'API Budget');
  console.log('URL:', API_URL);
  console.log('---');

  try {
    // Test 1: Health check
    console.log('1️⃣ Test du health check...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Health check réussi');
      console.log('   Status:', healthData.status);
      console.log('   Database:', healthData.database);
      console.log('   Budgets count:', healthData.budgetCount);
    } else {
      console.log('❌ Health check échoué');
      console.log('   Status:', healthResponse.status);
      console.log('   Error:', healthData);
    }

    // Test 2: Test de la base de données
    console.log('\n2️⃣ Test de la base de données...');
    if (healthData.database === 'connected') {
      console.log('✅ Base de données connectée');
      console.log('   Nombre de budgets:', healthData.budgetCount);
    } else {
      console.log('❌ Base de données non connectée');
    }

    // Test 3: Variables d'environnement
    console.log('\n3️⃣ Vérification des variables d\'environnement...');
    const requiredVars = [
      'VITE_MONGODB_URI',
      'VITE_MONGODB_DB',
      'VITE_GOOGLE_CLIENT_ID'
    ];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${varName.includes('URI') ? 'Défini' : value}`);
      } else {
        console.log(`❌ ${varName}: Non défini`);
      }
    });

    // Test 4: Test d'authentification (simulation)
    console.log('\n4️⃣ Test d\'authentification...');
    console.log('   (Ce test nécessite un token valide)');
    console.log('   Pour tester l\'authentification, utilisez l\'interface web');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Le serveur ne répond pas. Vérifiez que:');
      console.log('   - Le serveur est démarré (npm run start)');
      console.log('   - Le port est correct (défaut: 3000)');
      console.log('   - Aucun firewall ne bloque la connexion');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Impossible de résoudre l\'hôte. Vérifiez que:');
      console.log('   - L\'URL est correcte');
      console.log('   - La connexion internet fonctionne');
    }
  }
}

// Fonction pour tester avec un token (si fourni)
async function testWithToken(token, userId) {
  if (!token || !userId) {
    console.log('❌ Token ou userId manquant pour le test d\'authentification');
    return;
  }

  console.log('\n🔐 Test avec authentification...');
  
  try {
    // Test de récupération des données
    const response = await fetch(`${API_URL}/api/budget/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Données récupérées avec succès');
      console.log('   Nombre de clés:', Object.keys(data).length);
      console.log('   Dépenses:', data.expenses?.length || 0);
      console.log('   Revenus:', data.incomeTransactions?.length || 0);
    } else {
      const error = await response.json();
      console.log('❌ Erreur lors de la récupération:', error);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test authentifié:', error.message);
  }
}

// Exécution du script
async function main() {
  await testConnection();
  
  // Si des arguments sont fournis (token et userId)
  const args = process.argv.slice(2);
  if (args.length >= 2) {
    const [token, userId] = args;
    await testWithToken(token, userId);
  }
  
  console.log('\n📋 Résumé des actions à effectuer:');
  console.log('1. Vérifiez que le serveur est démarré');
  console.log('2. Vérifiez les variables d\'environnement');
  console.log('3. Testez la connexion via l\'interface web (/debug)');
  console.log('4. Vérifiez les logs du serveur pour plus de détails');
}

main().catch(console.error); 