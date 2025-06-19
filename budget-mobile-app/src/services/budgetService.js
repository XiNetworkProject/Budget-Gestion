const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { useStore } from '../store';

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
      console.log('Tentative de sauvegarde des données pour userId:', userId);
      
      const token = useStore.getState().token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`${API_URL}/api/budget`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, ...data }),
      });

      // Déconnexion automatique si session expirée ou non autorisée
      if (response.status === 401 || response.status === 403) {
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
      console.warn('Erreur de connexion serveur, sauvegarde en local:', error.message);
      
      // En cas d'erreur de connexion, sauvegarder en local
      const localSuccess = saveToLocalStorage(userId, data);
      if (localSuccess) {
        console.log('Sauvegarde locale réussie en fallback');
        return { success: true, local: true, message: 'Sauvegardé en local (pas de connexion serveur)' };
      } else {
        throw new Error('Impossible de sauvegarder (ni serveur ni local)');
      }
    }
  },

  async getBudget(userId) {
    try {
      console.log('Tentative de récupération des données pour userId:', userId);
      
      const token = useStore.getState().token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API_URL}/api/budget/${userId}`, { headers });
      
      // Déconnexion automatique si session expirée ou non autorisée
      if (response.status === 401 || response.status === 403) {
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
      console.warn('Erreur de connexion serveur, tentative de récupération locale:', error.message);
      
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
      const response = await fetch(`${API_URL}/api/budget/${userId}`, {
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
}; 