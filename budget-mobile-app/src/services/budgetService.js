const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export const budgetService = {
  async saveBudget(userId, data) {
    try {
      const response = await fetch(`${API_URL}/api/budget/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save budget');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving budget:', error);
      throw error;
    }
  },

  async getBudget(userId) {
    try {
      const response = await fetch(`${API_URL}/api/budget/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get budget');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting budget:', error);
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