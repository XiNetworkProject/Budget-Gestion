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
import QuickAdd from './pages/QuickAdd';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Savings from './pages/Savings';
import Debts from './pages/Debts';
import Archives from './pages/Archives';
import { useStore } from './store';

function SplashRedirect() {
  const { isAuthenticated, onboardingCompleted } = useStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!onboardingCompleted) {
      navigate('/onboarding');
    } else {
      navigate('/home');
    }
  }, [isAuthenticated, onboardingCompleted, navigate]);

  return null;
}

// Composant pour gérer la redirection vers l'onboarding
function OnboardingGuard({ children }) {
  const { isAuthenticated, onboardingCompleted } = useStore();
  
  // Si l'utilisateur n'est pas connecté, on ne fait rien (Login s'en charge)
  if (!isAuthenticated) {
    return children;
  }
  
  // Si l'onboarding n'est pas terminé, rediriger vers l'onboarding
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Sinon, afficher le contenu normal
  return children;
}

// Garde pour protéger les routes authentifiées
function ProtectedRoute({ children }) {
  const { isAuthenticated, onboardingCompleted } = useStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter
      basename={import.meta.env.BASE_URL}
    >
      <Routes>
        <Route path="/" element={<SplashRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/home" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/quickadd" element={<QuickAdd />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/income" element={<Income />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
} 