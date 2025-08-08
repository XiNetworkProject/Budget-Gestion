// Base API:
// - Si VITE_API_URL est défini, on l'utilise (sans trailing slash)
// - Sinon, on utilise un chemin relatif vers les fonctions `/api` (Vercel)
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
let API_BASE = API_ORIGIN; // chaîne vide => utilisera un chemin relatif

// Si VITE_API_URL pointe vers une autre origine que la page, ignorer et utiliser des routes relatives
try {
  if (typeof window !== 'undefined' && API_BASE) {
    const configured = new URL(API_BASE, window.location.origin);
    if (configured.origin !== window.location.origin) {
      console.warn('[API] VITE_API_URL pointe vers une autre origine, utilisation des routes relatives /api');
      API_BASE = '';
    }
  }
} catch (_) {
  API_BASE = '';
}

const buildApiUrl = (path, query) => {
  const base = API_BASE ? `${API_BASE}${path}` : `${path}`;
  if (query && Object.keys(query).length > 0) {
    const qs = new URLSearchParams(query).toString();
    return `${base}?${qs}`;
  }
  return base;
};

import { useStore } from '../store';

// ======= Offline queue pour mutations (sauvegardes) =======
const QUEUE_KEY = 'bg_mutation_queue_v1';

const readQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) { return []; }
};

const writeQueue = (queue) => {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch (_) {}
};

const enqueueSave = (userId, data) => {
  const entry = { id: Date.now(), type: 'saveBudget', userId, data };
  const q = readQueue();
  q.push(entry);
  writeQueue(q);
  return entry.id;
};

let onlineListenerAttached = false;
const attachOnlineListener = () => {
  if (onlineListenerAttached || typeof window === 'undefined') return;
  window.addEventListener('online', () => {
    budgetService.flushQueue().catch(() => {});
  });
  onlineListenerAttached = true;
};

// Fonction utilitaire pour sauvegarder en local
const saveToLocalStorage = (userId, data) => {
  try {
    const key = `budget_${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
    console.log('Données sauvegardées en local:', key);
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde locale:', error);
    return false;
  }
};

// Fonction utilitaire pour récupérer depuis le local
const getFromLocalStorage = (userId) => {
  try {
    const key = `budget_${userId}`;
    const data = localStorage.getItem(key);
    if (data) {
      console.log('Données récupérées du local:', key);
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Erreur récupération locale:', error);
    return null;
  }
};

export const budgetService = {
  async saveBudget(userId, data) {
    try {
      console.log('=== TENTATIVE SAUVEGARDE SERVEUR ===');
      console.log('userId:', userId);
      console.log('API_BASE:', API_BASE || '(relative /api)');
      
      const token = useStore.getState().token;
      console.log('Token présent:', !!token);
      
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      console.log('Headers:', headers);
      
      const url = buildApiUrl('/api/budget');
      console.log('POST URL:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, ...data }),
      });

      console.log('Réponse serveur:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      // Déconnexion automatique si session expirée ou non autorisée
      if (response.status === 401 || response.status === 403) {
        console.error('Erreur d\'authentification:', response.status);
        useStore.getState().logout();
        throw new Error('Session expirée, reconnecte-toi');
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('Erreur de sauvegarde serveur:', error);
        throw new Error(error.message || 'Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      console.log('Sauvegarde serveur réussie:', result);
      
      // Sauvegarder aussi en local comme backup
      saveToLocalStorage(userId, data);
      
      return result;
    } catch (error) {
      console.error('=== ERREUR CONNEXION SERVEUR (saveBudget) ===');
      console.error('Type d\'erreur:', error.name);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      
      // En cas d'erreur de connexion, sauvegarder en local et mettre en file d'attente
      const localSuccess = saveToLocalStorage(userId, data);
      enqueueSave(userId, data);
      attachOnlineListener();
      if (localSuccess) {
        console.log('Sauvegarde locale + mise en queue pour resynchronisation');
        return { success: true, local: true, queued: true, message: 'Sauvegardé en local, resync automatique quand en ligne' };
      }
      throw new Error('Impossible de sauvegarder (ni serveur ni local)');
    }
  },

  async getBudget(userId) {
    try {
      console.log('=== TENTATIVE RÉCUPÉRATION DONNÉES ===');
      console.log('userId:', userId);
      console.log('API_BASE:', API_BASE || '(relative /api)');
      
      const token = useStore.getState().token;
      console.log('Token présent:', !!token);
      
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      console.log('Headers:', headers);
      
      const url = buildApiUrl('/api/budget', { userId, _t: Date.now() });
      console.log('GET URL:', url);
      const response = await fetch(url, { headers, method: 'GET' });
      
      console.log('Réponse serveur:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      // Déconnexion automatique si session expirée ou non autorisée
      if (response.status === 401 || response.status === 403) {
        console.error('Erreur d\'authentification:', response.status);
        useStore.getState().logout();
        throw new Error('Session expirée, reconnecte-toi');
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('Erreur de récupération serveur:', error);
        throw new Error(error.message || 'Erreur lors de la récupération');
      }

      const data = await response.json();
      console.log('Données récupérées du serveur:', data);
      
      // Sauvegarder en local comme backup
      saveToLocalStorage(userId, data);
      
      return data;
    } catch (error) {
      console.error('=== ERREUR CONNEXION SERVEUR (getBudget) ===');
      console.error('Type d\'erreur:', error.name);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      
      // En cas d'erreur de connexion, essayer de récupérer depuis le local
      const localData = getFromLocalStorage(userId);
      if (localData) {
        console.log('Données récupérées du local en fallback');
        return { ...localData, local: true, message: 'Données locales (pas de connexion serveur)' };
      } else {
        console.error('Aucune donnée disponible (ni serveur ni local)');
        throw new Error('Aucune donnée disponible');
      }
    }
  },

  async deleteBudget(userId) {
    try {
      const token = useStore.getState().token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(buildApiUrl('/api/budget', { userId }), {
        method: 'DELETE',
        headers
      });

      // Déconnexion automatique si session expirée ou non autorisée
      if (response.status === 401 || response.status === 403) {
        useStore.getState().logout();
        throw new Error('Session expirée, reconnecte-toi');
      }

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      const result = await response.json();
      
      // Supprimer aussi du local
      try {
        const key = `budget_${userId}`;
        localStorage.removeItem(key);
        console.log('Données supprimées du local:', key);
      } catch (localError) {
        console.warn('Erreur suppression locale:', localError);
      }
      
      return result;
    } catch (error) {
      console.warn('Erreur suppression serveur, suppression locale:', error.message);
      
      // En cas d'erreur de connexion, supprimer du local
      try {
        const key = `budget_${userId}`;
        localStorage.removeItem(key);
        console.log('Données supprimées du local en fallback');
        return { success: true, local: true, message: 'Supprimé en local (pas de connexion serveur)' };
      } catch (localError) {
        console.error('Erreur suppression locale:', localError);
        throw new Error('Impossible de supprimer (ni serveur ni local)');
      }
    }
  }
  ,

  // Tenter d'exécuter la file d'attente locale (sauvegardes en attente)
  async flushQueue() {
    const token = useStore.getState().token;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let q = readQueue();
    if (q.length === 0) return { flushed: 0 };

    let flushed = 0;
    const remaining = [];
    for (const entry of q) {
      if (entry.type === 'saveBudget') {
        try {
          const url = buildApiUrl('/api/budget');
          const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ userId: entry.userId, ...entry.data }) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          flushed++;
        } catch (e) {
          remaining.push(entry);
        }
      }
    }
    writeQueue(remaining);
    return { flushed, remaining: remaining.length };
  }
}; 