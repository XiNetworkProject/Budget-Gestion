#!/usr/bin/env node

import fetch from 'node-fetch';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

async function debugConnection() {
  console.log('=== DIAGNOSTIC CONNEXION ===');
  console.log('API URL:', API_URL);
  
  try {
    // Test 1: Health check
    console.log('\n1. Test Health Check...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test 2: Debug budgets MongoDB
    console.log('\n2. Test Debug Budgets...');
    const debugResponse = await fetch(`${API_URL}/api/debug/budgets`);
    const debugData = await debugResponse.json();
    console.log('Debug budgets:', debugData);
    
    // Test 3: Test avec un userId spécifique (remplacez par un vrai userId)
    console.log('\n3. Test Récupération Budget...');
    const testUserId = process.argv[2] || 'test_user_id';
    console.log('Test avec userId:', testUserId);
    
    try {
      const budgetResponse = await fetch(`${API_URL}/api/budget/${testUserId}`);
      console.log('Status:', budgetResponse.status);
      
      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json();
        console.log('Données budget:', budgetData);
      } else {
        const errorData = await budgetResponse.json();
        console.log('Erreur:', errorData);
      }
    } catch (budgetError) {
      console.log('Erreur récupération budget:', budgetError.message);
    }
    
  } catch (error) {
    console.error('Erreur générale:', error.message);
  }
}

debugConnection(); 