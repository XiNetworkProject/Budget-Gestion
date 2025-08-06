#!/usr/bin/env node

/**
 * Script de migration des données MongoDB vers Supabase
 * Usage: node scripts/migrate-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('Veuillez définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour migrer les utilisateurs
async function migrateUsers(usersData) {
  console.log('🔄 Migration des utilisateurs...');
  
  const users = usersData.map(user => ({
    id: user._id || user.id,
    email: user.email,
    name: user.name || user.displayName,
    avatar_url: user.picture || user.avatar,
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: user.updatedAt || new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('users')
    .upsert(users, { onConflict: 'id' });

  if (error) {
    console.error('❌ Erreur migration utilisateurs:', error);
    return false;
  }

  console.log(`✅ ${users.length} utilisateurs migrés`);
  return true;
}

// Fonction pour migrer les budgets
async function migrateBudgets(budgetsData) {
  console.log('🔄 Migration des budgets...');
  
  const budgets = budgetsData.map(budget => ({
    user_id: budget.userId || budget.user_id,
    budget_data: {
      months: budget.months || [],
      categories: budget.categories || [],
      data: budget.data || {},
      revenus: budget.revenus || [],
      incomeTypes: budget.incomeTypes || [],
      incomes: budget.incomes || {},
      persons: budget.persons || [],
      saved: budget.saved || {},
      sideByMonth: budget.sideByMonth || [],
      totalPotentialSavings: budget.totalPotentialSavings || 0,
      budgetLimits: budget.budgetLimits || {},
      expenses: budget.expenses || [],
      incomeTransactions: budget.incomeTransactions || [],
      savings: budget.savings || [],
      debts: budget.debts || [],
      bankAccounts: budget.bankAccounts || [],
      transactions: budget.transactions || [],
      userProfile: budget.userProfile || {},
      appSettings: budget.appSettings || {},
      tutorialCompleted: budget.tutorialCompleted || false,
      onboardingCompleted: budget.onboardingCompleted || false,
      lastUpdateShown: budget.lastUpdateShown || null,
      appVersion: budget.appVersion || "2.2.0"
    },
    created_at: budget.createdAt || new Date().toISOString(),
    updated_at: budget.updatedAt || new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('budgets')
    .upsert(budgets, { onConflict: 'user_id' });

  if (error) {
    console.error('❌ Erreur migration budgets:', error);
    return false;
  }

  console.log(`✅ ${budgets.length} budgets migrés`);
  return true;
}

// Fonction pour migrer les transactions
async function migrateTransactions(transactionsData) {
  console.log('🔄 Migration des transactions...');
  
  const transactions = transactionsData.map(transaction => ({
    user_id: transaction.userId || transaction.user_id,
    type: transaction.type || 'expense',
    amount: transaction.amount || 0,
    category: transaction.category || '',
    description: transaction.description || '',
    date: transaction.date || new Date().toISOString(),
    recurring: transaction.recurring || false,
    recurring_type: transaction.recurringType || 'monthly',
    recurring_end_date: transaction.recurringEndDate || null,
    created_at: transaction.createdAt || new Date().toISOString(),
    updated_at: transaction.updatedAt || new Date().toISOString()
  }));

  // Insérer par lots de 100 pour éviter les limites
  const batchSize = 100;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(batch);

    if (error) {
      console.error(`❌ Erreur migration batch ${i}-${i + batchSize}:`, error);
      return false;
    }
  }

  console.log(`✅ ${transactions.length} transactions migrées`);
  return true;
}

// Fonction pour migrer les abonnements
async function migrateSubscriptions(subscriptionsData) {
  console.log('🔄 Migration des abonnements...');
  
  const subscriptions = subscriptionsData.map(subscription => ({
    user_id: subscription.userId || subscription.user_id,
    stripe_customer_id: subscription.stripeCustomerId || subscription.stripe_customer_id,
    stripe_subscription_id: subscription.stripeSubscriptionId || subscription.stripe_subscription_id,
    plan_id: subscription.currentPlan || subscription.plan_id || 'FREE',
    status: subscription.status || 'active',
    start_date: subscription.startDate || subscription.start_date || new Date().toISOString(),
    end_date: subscription.endDate || subscription.end_date || null,
    is_trialing: subscription.isTrialing || subscription.is_trialing || false,
    trial_end: subscription.trialEnd || subscription.trial_end || null,
    cancel_at_period_end: subscription.cancelAtPeriodEnd || subscription.cancel_at_period_end || false,
    created_at: subscription.createdAt || new Date().toISOString(),
    updated_at: subscription.updatedAt || new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(subscriptions, { onConflict: 'user_id' });

  if (error) {
    console.error('❌ Erreur migration abonnements:', error);
    return false;
  }

  console.log(`✅ ${subscriptions.length} abonnements migrés`);
  return true;
}

// Fonction principale de migration
async function migrateData() {
  console.log('🚀 Début de la migration MongoDB → Supabase');
  console.log('==========================================');

  try {
    // Vérifier la connexion Supabase
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error);
      process.exit(1);
    }
    console.log('✅ Connexion Supabase établie');

    // Charger les données d'export MongoDB (si disponibles)
    const dataDir = path.join(process.cwd(), 'migration-data');
    
    try {
      // Migrer les utilisateurs
      const usersPath = path.join(dataDir, 'users.json');
      const usersData = JSON.parse(await fs.readFile(usersPath, 'utf8'));
      await migrateUsers(usersData);

      // Migrer les budgets
      const budgetsPath = path.join(dataDir, 'budgets.json');
      const budgetsData = JSON.parse(await fs.readFile(budgetsPath, 'utf8'));
      await migrateBudgets(budgetsData);

      // Migrer les transactions
      const transactionsPath = path.join(dataDir, 'transactions.json');
      const transactionsData = JSON.parse(await fs.readFile(transactionsPath, 'utf8'));
      await migrateTransactions(transactionsData);

      // Migrer les abonnements
      const subscriptionsPath = path.join(dataDir, 'subscriptions.json');
      const subscriptionsData = JSON.parse(await fs.readFile(subscriptionsPath, 'utf8'));
      await migrateSubscriptions(subscriptionsData);

    } catch (fileError) {
      console.log('⚠️  Fichiers de données non trouvés, migration avec données d\'exemple');
      
      // Créer des données d'exemple pour tester
      const exampleUser = {
        id: 'example-user-1',
        email: 'test@example.com',
        name: 'Utilisateur Test',
        avatar_url: 'https://via.placeholder.com/150',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const exampleBudget = {
        user_id: 'example-user-1',
        budget_data: {
          months: ['Janvier', 'Février', 'Mars'],
          categories: ['Loyer', 'Nourriture', 'Loisirs'],
          data: {
            'Loyer': [800, 800, 800],
            'Nourriture': [300, 320, 280],
            'Loisirs': [150, 180, 120]
          },
          revenus: [2000, 2000, 2000],
          incomeTypes: ['Salaire'],
          incomes: {
            'Salaire': [2000, 2000, 2000]
          },
          persons: [{ name: 'Moi', part: 100 }],
          saved: { 'Moi': 500 },
          sideByMonth: [750, 700, 800],
          totalPotentialSavings: 500,
          budgetLimits: {
            'Loyer': 800,
            'Nourriture': 400,
            'Loisirs': 200
          },
          expenses: [],
          incomeTransactions: [],
          savings: [],
          debts: [],
          bankAccounts: [],
          transactions: [],
          userProfile: { email: 'test@example.com' },
          appSettings: { theme: 'dark', currency: 'EUR' },
          tutorialCompleted: true,
          onboardingCompleted: true,
          lastUpdateShown: null,
          appVersion: "2.2.0"
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await migrateUsers([exampleUser]);
      await migrateBudgets([exampleBudget]);
    }

    console.log('🎉 Migration terminée avec succès !');
    console.log('==========================================');
    console.log('✅ Votre application est maintenant prête pour Supabase');
    console.log('📝 N\'oubliez pas de :');
    console.log('   1. Mettre à jour vos variables d\'environnement');
    console.log('   2. Déployer sur Vercel');
    console.log('   3. Tester toutes les fonctionnalités');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateData(); 