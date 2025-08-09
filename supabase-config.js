import { createClient } from '@supabase/supabase-js';

// Côté serveur (Vercel), privilégier SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase env manquantes', { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey });
  throw new Error('Variables d\'environnement Supabase manquantes (URL ou KEY)');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration des tables Supabase
export const TABLES = {
  BUDGETS: 'budgets',
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  SUBSCRIPTIONS: 'subscriptions'
};

// Fonctions utilitaires pour la base de données
export const dbUtils = {
  // Récupérer le budget d'un utilisateur
  async getBudget(userId) {
    const { data, error } = await supabase
      .from(TABLES.BUDGETS)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erreur récupération budget:', error);
      return null;
    }

    return data?.budget_data || null;
  },

  // Sauvegarder le budget d'un utilisateur
  async saveBudget(userId, budgetData) {
    // 1) S'assurer que l'utilisateur existe pour respecter la contrainte FK
    try {
      const userProfile = budgetData?.userProfile || {};
      const email = userProfile.email || `${userId}@app.local`;
      const name = userProfile.name || userProfile.firstName || null;
      const avatarUrl = userProfile.avatar || userProfile.avatar_url || null;

      const { error: userError } = await supabase
        .from(TABLES.USERS)
        .upsert({
          id: userId,
          email,
          name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (userError) {
        console.warn('Avertissement upsert user (non bloquant):', userError);
      }
    } catch (e) {
      console.warn('Impossible de garantir la présence de l\'utilisateur (non bloquant):', e?.message);
    }

    // 2) Upsert du budget
    const { data, error } = await supabase
      .from(TABLES.BUDGETS)
      .upsert({
        user_id: userId,
        budget_data: budgetData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Erreur sauvegarde budget:', error);
      throw new Error('Erreur lors de la sauvegarde');
    }

    return data;
  },

  // Créer un nouvel utilisateur
  async createUser(userData) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar_url: userData.picture,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur création utilisateur:', error);
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }

    return data;
  },

  // Récupérer un utilisateur
  async getUser(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }

    return data;
  },

  // Sauvegarder une transaction
  async saveTransaction(transactionData) {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .insert({
        user_id: transactionData.userId,
        type: transactionData.type,
        amount: transactionData.amount,
        category: transactionData.category,
        description: transactionData.description,
        date: transactionData.date,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur sauvegarde transaction:', error);
      throw new Error('Erreur lors de la sauvegarde de la transaction');
    }

    return data;
  },

  // Récupérer les transactions d'un utilisateur
  async getTransactions(userId, limit = 100) {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur récupération transactions:', error);
      return [];
    }

    return data || [];
  }
  ,

  // Gamification: journaliser un spin (best-effort)
  async logSpin({ userId, outcome }) {
    try {
      const { data, error } = await supabase
        .from('gamification_spins')
        .insert({
          user_id: userId,
          outcome,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('logSpin: impossible d\'insérer (table absente ?):', e?.message);
      return null;
    }
  }
}; 