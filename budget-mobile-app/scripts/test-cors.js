#!/usr/bin/env node

import fetch from 'node-fetch';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

async function testCORS() {
  console.log('=== TEST CONFIGURATION CORS ===');
  console.log('API URL:', API_URL);
  
  try {
    // Test 1: Test CORS endpoint
    console.log('\n1. Test Endpoint CORS...');
    const corsResponse = await fetch(`${API_URL}/api/cors-test`);
    const corsData = await corsResponse.json();
    console.log('CORS test:', corsData);
    
    // Test 2: Test avec headers CORS
    console.log('\n2. Test avec Headers CORS...');
    const headersResponse = await fetch(`${API_URL}/api/cors-test`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', headersResponse.status);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', headersResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('- Cross-Origin-Opener-Policy:', headersResponse.headers.get('Cross-Origin-Opener-Policy'));
    console.log('- Cross-Origin-Embedder-Policy:', headersResponse.headers.get('Cross-Origin-Embedder-Policy'));
    console.log('- Cross-Origin-Resource-Policy:', headersResponse.headers.get('Cross-Origin-Resource-Policy'));
    
    // Test 3: Test OPTIONS (preflight)
    console.log('\n3. Test OPTIONS (Preflight)...');
    const optionsResponse = await fetch(`${API_URL}/api/cors-test`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('OPTIONS Status:', optionsResponse.status);
    console.log('OPTIONS Headers:');
    console.log('- Access-Control-Allow-Methods:', optionsResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('- Access-Control-Allow-Headers:', optionsResponse.headers.get('Access-Control-Allow-Headers'));
    
  } catch (error) {
    console.error('Erreur test CORS:', error.message);
  }
}

testCORS(); 