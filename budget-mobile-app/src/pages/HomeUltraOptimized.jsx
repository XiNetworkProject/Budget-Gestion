import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Fade, Snackbar, Alert } from '@mui/material';

// Composants optimisés ultra-améliorés
import ErrorBoundary from '../components/optimized/ErrorBoundary';
import LoadingSpinner from '../components/optimized/LoadingSpinner';
import SmartHeader from '../components/optimized/SmartHeader';
import SmartDashboard from '../components/optimized/SmartDashboard';
import QuickActions from '../components/optimized/QuickActions';
import UltraBackground from '../components/optimized/UltraBackground';

// Hooks optimisés
import useOptimizedData from '../hooks/useOptimizedData';

// Composants
import QuickAdd from './QuickAdd';

// Configuration
import { ACTIVE_CONFIG } from '../config/environment';

// Composant principal ultra-optimisé
const HomeUltraOptimized = () => {
  const { 
    selectedMonth, 
    selectedYear, 
    setSelectedMonth, 
    setSelectedYear,
    isAuthenticated,
    user,
    logout,
    serverConnected,
    getCurrentPlan,
    isFeatureAvailable
  } = useStore();
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddType, setQuickAddType] = useState('general');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Utilisation du hook optimisé pour les données
  const { 
    selectedMonthData, 
    forecast, 
    recommendations, 
    isCalculating, 
    hasData 
  } = useOptimizedData();

  // Fonctions memoizées
  const handleMonthChange = useCallback((newMonth, newYear) => {
    setSelectedMonth(newMonth, newYear);
  }, [setSelectedMonth]);

  const handleRefresh = useCallback(() => {
    // Forcer le recalcul des données
    window.location.reload();
  }, []);

  const handleQuickAdd = useCallback((type) => {
    setQuickAddType(type);
    setShowQuickAdd(true);
    
    // Notification de feedback
    setSnackbarMessage(t('home.quickAddOpened'));
    setSnackbarSeverity('info');
    setShowSnackbar(true);
  }, [t]);

  const handleQuickAddClose = useCallback(() => {
    setShowQuickAdd(false);
  }, []);

  const handleActionClick = useCallback((actionType) => {
    switch (actionType) {
      case 'review_expenses':
      case 'analyze_expenses':
        navigate('/analytics');
        break;
      case 'create_savings_plan':
      case 'optimize_investment':
        navigate('/action-plans');
        break;
      case 'analyze_income':
        navigate('/income');
        break;
      default:
        console.log('Action non reconnue:', actionType);
    }
  }, [navigate]);

  const handleSnackbarClose = useCallback(() => {
    setShowSnackbar(false);
  }, []);

  // Effets de performance
  useEffect(() => {
    // Marquer la première visite
    const hasVisited = sessionStorage.getItem('hasVisitedHome');
    if (!hasVisited) {
      sessionStorage.setItem('hasVisitedHome', 'true');
    }
  }, []);

  // Si les données ne sont pas encore chargées
  if (!hasData && isCalculating) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <UltraBackground />
        <LoadingSpinner 
          message={t('home.loadingOptimizedData')} 
          variant="elegant" 
          fullScreen 
        />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Arrière-plan ultra-optimisé */}
        <UltraBackground />
        
        {/* En-tête intelligent */}
        <SmartHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
          onRefresh={handleRefresh}
          showNotifications={true}
        />
        
        {/* Dashboard intelligent */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <SmartDashboard onActionClick={handleActionClick} />
        </Box>
        
        {/* Actions rapides */}
        <QuickActions 
          onQuickAdd={handleQuickAdd}
          showQuickAdd={showQuickAdd}
        />
        
        {/* Popup QuickAdd */}
        <QuickAdd 
          open={showQuickAdd} 
          onClose={handleQuickAddClose}
          type={quickAddType}
        />
        
        {/* Snackbar pour les notifications */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbarSeverity}
            sx={{ 
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white'
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        
        {/* Styles CSS pour les animations */}
        <style>
          {`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes pulse {
              0% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
              100% {
                transform: scale(1);
              }
            }
            
            @keyframes shimmer {
              0% {
                background-position: -200px 0;
              }
              100% {
                background-position: calc(200px + 100%) 0;
              }
            }
            
            .ultra-optimized {
              animation: fadeInUp 0.6s ease-out;
            }
            
            .pulse-animation {
              animation: pulse 2s ease-in-out infinite;
            }
            
            .shimmer-loading {
              background: linear-gradient(90deg, 
                rgba(255,255,255,0.1) 25%, 
                rgba(255,255,255,0.2) 50%, 
                rgba(255,255,255,0.1) 75%
              );
              background-size: 200px 100%;
              animation: shimmer 1.5s infinite;
            }
          `}
        </style>
      </Box>
    </ErrorBoundary>
  );
};

export default React.memo(HomeUltraOptimized); 