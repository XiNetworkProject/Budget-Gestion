import React, { useState } from 'react';
import { useStore } from '../store';
import { budgetService } from '../services/budgetService';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';

const DebugConnection = () => {
  const { user, token, isAuthenticated } = useStore();
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('=== TEST CONNEXION DEBUG ===');
      
      // Test 1: Vérifier l'état de l'utilisateur
      const userInfo = {
        isAuthenticated,
        userId: user?.id,
        userEmail: user?.email,
        hasToken: !!token
      };
      
      console.log('Informations utilisateur:', userInfo);
      
      // Test 2: Tester l'API de debug MongoDB
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('API URL:', apiUrl);
      
      const debugResponse = await fetch(`${apiUrl}/api/debug/budgets`);
      const debugData = await debugResponse.json();
      
      console.log('Données debug MongoDB:', debugData);
      
      // Test 3: Tester la récupération du budget
      let budgetData = null;
      let budgetError = null;
      
      if (user?.id) {
        try {
          budgetData = await budgetService.getBudget(user.id);
          console.log('Données budget récupérées:', budgetData);
        } catch (err) {
          budgetError = err.message;
          console.error('Erreur récupération budget:', err);
        }
      }
      
      // Test 4: Vérifier le localStorage
      const localData = localStorage.getItem(`budget_${user?.id}`);
      const hasLocalData = !!localData;
      
      setDebugInfo({
        userInfo,
        mongoDebug: debugData,
        budgetData: budgetData ? {
          hasData: true,
          expensesCount: budgetData.expenses?.length || 0,
          incomeCount: budgetData.incomeTransactions?.length || 0,
          transactionsCount: budgetData.transactions?.length || 0,
          categoriesCount: budgetData.categories?.length || 0,
          structure: Object.keys(budgetData)
        } : null,
        budgetError,
        hasLocalData,
        localDataSize: localData ? localData.length : 0
      });
      
    } catch (err) {
      console.error('Erreur test connexion:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearLocalData = () => {
    if (user?.id) {
      localStorage.removeItem(`budget_${user.id}`);
      alert('Données locales supprimées');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Debug Connexion
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          État Actuel
        </Typography>
        <Typography>Authentifié: {isAuthenticated ? 'Oui' : 'Non'}</Typography>
        <Typography>User ID: {user?.id || 'Aucun'}</Typography>
        <Typography>Email: {user?.email || 'Aucun'}</Typography>
        <Typography>Token: {token ? 'Présent' : 'Manquant'}</Typography>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={testConnection}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Tester Connexion'}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={clearLocalData}
          disabled={!user?.id}
        >
          Effacer Données Locales
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {debugInfo && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Résultats du Test
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            MongoDB Debug
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
            {JSON.stringify(debugInfo.mongoDebug, null, 2)}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Données Budget
          </Typography>
          {debugInfo.budgetError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erreur: {debugInfo.budgetError}
            </Alert>
          ) : debugInfo.budgetData ? (
            <Box>
              <Typography>Dépenses: {debugInfo.budgetData.expensesCount}</Typography>
              <Typography>Revenus: {debugInfo.budgetData.incomeCount}</Typography>
              <Typography>Transactions: {debugInfo.budgetData.transactionsCount}</Typography>
              <Typography>Catégories: {debugInfo.budgetData.categoriesCount}</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                Structure: {debugInfo.budgetData.structure.join(', ')}
              </Typography>
            </Box>
          ) : (
            <Typography>Aucune donnée budget</Typography>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Données Locales
          </Typography>
          <Typography>Présentes: {debugInfo.hasLocalData ? 'Oui' : 'Non'}</Typography>
          <Typography>Taille: {debugInfo.localDataSize} caractères</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DebugConnection; 