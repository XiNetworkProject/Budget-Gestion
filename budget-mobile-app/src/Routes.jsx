import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Splash from './components/Splash';
import Login from './components/Login';
import Onboarding from './pages/Onboarding';
import Layout from './components/Layout';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Savings from './pages/Savings';
import Debts from './pages/Debts';
import ActionPlans from './pages/ActionPlans';
import { useStore } from './store';

function SplashRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => navigate('/login', { replace: true }), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);
  return <Splash />;
}

// Composant pour gérer la redirection vers l'onboarding
function OnboardingGuard({ children }) {
  const { isAuthenticated, onboardingCompleted } = useStore();
  
  console.log('OnboardingGuard:', { isAuthenticated, onboardingCompleted });
  
  // Si l'utilisateur n'est pas connecté, on ne fait rien (Login s'en charge)
  if (!isAuthenticated) {
    console.log('OnboardingGuard: Utilisateur non connecté');
    return children;
  }
  
  // Si l'onboarding n'est pas terminé, rediriger vers l'onboarding
  if (!onboardingCompleted) {
    console.log('OnboardingGuard: Onboarding non terminé, redirection vers /onboarding');
    return <Navigate to="/onboarding" replace />;
  }
  
  // Sinon, afficher le contenu normal
  console.log('OnboardingGuard: Onboarding terminé, affichage du contenu normal');
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/" element={<SplashRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={
          <OnboardingGuard>
            <Layout />
          </OnboardingGuard>
        }>
          <Route path="/home" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/income" element={<Income />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/action-plans" element={<ActionPlans />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
} 