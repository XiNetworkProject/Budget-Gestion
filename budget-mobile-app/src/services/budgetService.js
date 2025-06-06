const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const budgetService = {
  async saveBudget(userId, data) {
    try {
      console.log('Sauvegarde des données pour userId:', userId);
      console.log('Données à sauvegarder:', data);
      
      const response = await fetch(`${API_URL}/api/budget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Erreur de sauvegarde:', error);
        throw new Error(error.message || 'Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      console.log('Sauvegarde réussie:', result);
      return result;
    } catch (error) {
      console.error('Erreur dans saveBudget:', error);
      throw error;
    }
  },

  async getBudget(userId) {
    try {
      console.log('Récupération des données pour userId:', userId);
      
      const response = await fetch(`${API_URL}/api/budget/${userId}`);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Erreur de récupération:', error);
        throw new Error(error.message || 'Erreur lors de la récupération');
      }

      const data = await response.json();
      console.log('Données récupérées:', data);
      return data;
    } catch (error) {
      console.error('Erreur dans getBudget:', error);
      throw error;
    }
  },

  async deleteBudget(userId) {
    try {
      const response = await fetch(`${API_URL}/api/budget/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }
}; 