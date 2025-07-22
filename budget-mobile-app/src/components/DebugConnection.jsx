import React, { useState } from 'react';
import { useStore } from '../store';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { Refresh, BugReport, CheckCircle, Error } from '@mui/icons-material';

const DebugConnection = () => {
  const { user, token, isAuthenticated, serverConnected, reloadBudgetData } = useStore();
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('=== TEST DE CONNEXION ===');
      
      // Test 1: Health check
      console.log('Test 1: Health check');
      const healthResponse = await fetch(`${API_URL}/health`);
      const healthData = await healthResponse.json();
      console.log('Health check:', healthData);

      // Test 2: Debug utilisateur (si connecté)
      let userDebugData = null;
      if (user && token) {
        console.log('Test 2: Debug utilisateur');
        const userResponse = await fetch(`${API_URL}/api/debug/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        userDebugData = await userResponse.json();
        console.log('Debug utilisateur:', userDebugData);
      }

      // Test 3: Récupération des données
      let budgetData = null;
      if (user && token) {
        console.log('Test 3: Récupération des données');
        const budgetResponse = await fetch(`${API_URL}/api/budget/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        budgetData = await budgetResponse.json();
        console.log('Données budget:', budgetData);
      }

      setDebugInfo({
        health: healthData,
        userDebug: userDebugData,
        budgetData: budgetData,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error('Erreur lors du test de connexion:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const forceReload = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await reloadBudgetData();
      setDebugInfo(prev => ({
        ...prev,
        reloadSuccess: true,
        reloadTimestamp: new Date().toISOString()
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BugReport sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Debug de Connexion</Typography>
        </Box>

        {/* État actuel */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            État Actuel:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isAuthenticated ? <CheckCircle color="success" /> : <Error color="error" />}
              <Typography>Authentifié: {isAuthenticated ? 'Oui' : 'Non'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {token ? <CheckCircle color="success" /> : <Error color="error" />}
              <Typography>Token: {token ? 'Présent' : 'Manquant'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {serverConnected ? <CheckCircle color="success" /> : <Error color="error" />}
              <Typography>Serveur: {serverConnected ? 'Connecté' : 'Déconnecté'}</Typography>
            </Box>
            {user && (
              <Typography variant="body2" color="text.secondary">
                Utilisateur: {user.email} (ID: {user.id})
              </Typography>
            )}
          </Box>
        </Box>

        {/* Boutons d'action */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={testConnection}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <BugReport />}
          >
            Tester la Connexion
          </Button>
          <Button
            variant="outlined"
            onClick={forceReload}
            disabled={loading || !isAuthenticated}
            startIcon={<Refresh />}
          >
            Recharger les Données
          </Button>
        </Box>

        {/* Erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Informations de debug */}
        {debugInfo && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Résultats du Test:
            </Typography>
            
            {/* Health check */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Health Check:
              </Typography>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(debugInfo.health, null, 2)}
              </pre>
            </Paper>

            {/* Debug utilisateur */}
            {debugInfo.userDebug && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Debug Utilisateur:
                </Typography>
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(debugInfo.userDebug, null, 2)}
                </pre>
              </Paper>
            )}

            {/* Données budget */}
            {debugInfo.budgetData && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Données Budget:
                </Typography>
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(debugInfo.budgetData, null, 2)}
                </pre>
              </Paper>
            )}

            {/* Timestamp */}
            <Typography variant="caption" color="text.secondary">
              Test effectué le: {debugInfo.timestamp}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DebugConnection; 