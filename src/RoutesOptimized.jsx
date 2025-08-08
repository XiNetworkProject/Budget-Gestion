import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Composants optimisés
import ErrorBoundary from './components/optimized/ErrorBoundary';
import LoadingSpinner from './components/optimized/LoadingSpinner';
import Layout from './components/Layout';

// Lazy loading des pages avec Suspense
const HomeOptimized = lazy(() => import('./pages/HomeOptimized'));
const ExpensesOptimized = lazy(() => import('./pages/ExpensesOptimized'));
const IncomeOptimized = lazy(() => import('./pages/IncomeOptimized'));
const AnalyticsEnhanced = lazy(() => import('./pages/AnalyticsEnhanced'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Income = lazy(() => import('./pages/Income'));
const Savings = lazy(() => import('./pages/Savings'));
const Debts = lazy(() => import('./pages/Debts'));

const Analytics = lazy(() => import('./pages/Analytics'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));
const ActionPlans = lazy(() => import('./pages/ActionPlans'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Login = lazy(() => import('./components/Login'));
const GoogleAuth = lazy(() => import('./pages/GoogleAuth'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const DebugConnection = lazy(() => import('./components/DebugConnection'));
const SplashScreen = lazy(() => import('./components/SplashScreen'));


// Composant de fallback optimisé
const PageLoader = ({ message = "Chargement de la page..." }) => (
  <Box sx={{ 
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <LoadingSpinner 
      message={message} 
      variant="elegant" 
      fullScreen 
    />
  </Box>
);

// Wrapper pour les pages avec Suspense
const LazyPage = ({ component: Component, fallbackMessage }) => (
  <Suspense fallback={<PageLoader message={fallbackMessage} />}>
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  </Suspense>
);

// Routes optimisées avec lazy loading
const AppRoutesOptimized = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Route racine - redirection vers Splash */}
        <Route path="/" element={<Navigate to="/splash" replace />} />
        
        {/* Pages principales avec Layout */}
        <Route path="/" element={<Layout />}>
          <Route 
            path="home" 
            element={
              <LazyPage 
                component={HomeOptimized} 
                fallbackMessage="Chargement du tableau de bord..." 
              />
            } 
          />
          <Route 
            path="expenses" 
            element={
              <LazyPage 
                component={ExpensesOptimized} 
                fallbackMessage="Chargement des dépenses..." 
              />
            } 
          />
          <Route 
            path="income" 
            element={
              <LazyPage 
                component={IncomeOptimized} 
                fallbackMessage="Chargement des revenus..." 
              />
            } 
          />
          <Route 
            path="savings" 
            element={
              <LazyPage 
                component={Savings} 
                fallbackMessage="Chargement de l'épargne..." 
              />
            } 
          />
          <Route 
            path="debts" 
            element={
              <LazyPage 
                component={Debts} 
                fallbackMessage="Chargement des dettes..." 
              />
            } 
          />

          <Route 
            path="analytics" 
            element={
              <LazyPage 
                component={AnalyticsEnhanced} 
                fallbackMessage="Chargement des analyses avancées..." 
              />
            } 
          />
          <Route 
            path="history" 
            element={
              <LazyPage 
                component={History} 
                fallbackMessage="Chargement de l'historique..." 
              />
            } 
          />
          <Route 
            path="settings" 
            element={
              <LazyPage 
                component={Settings} 
                fallbackMessage="Chargement des paramètres..." 
              />
            } 
          />
          <Route 
            path="action-plans" 
            element={
              <LazyPage 
                component={ActionPlans} 
                fallbackMessage="Chargement des plans d'action..." 
              />
            } 
          />
          <Route 
            path="subscription" 
            element={
              <LazyPage 
                component={Subscription} 
                fallbackMessage="Chargement de l'abonnement..." 
              />
            } 
          />

        </Route>
        
        {/* Pages sans Layout */}
        <Route 
          path="splash" 
          element={
            <LazyPage 
              component={SplashScreen} 
              fallbackMessage="Préparation de l'application..." 
            />
          } 
        />
        <Route 
          path="login" 
          element={
            <LazyPage 
              component={Login} 
              fallbackMessage="Chargement de la connexion..." 
            />
          } 
        />
        <Route 
          path="auth/google" 
          element={
            <LazyPage 
              component={GoogleAuth} 
              fallbackMessage="Chargement de l'authentification Google..." 
            />
          } 
        />
        <Route 
          path="onboarding" 
          element={
            <LazyPage 
              component={Onboarding} 
              fallbackMessage="Chargement de l'onboarding..." 
            />
          } 
        />
        
        {/* Route de debug temporaire */}
        <Route 
          path="debug" 
          element={
            <LazyPage 
              component={DebugConnection} 
              fallbackMessage="Chargement du debug..." 
            />
          } 
        />
        
        {/* Route 404 - redirection vers Home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutesOptimized; 