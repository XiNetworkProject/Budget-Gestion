import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Splash from './components/Splash';
import Login from './components/Login';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Bank from './pages/Bank';
import Settings from './pages/Settings';
import QuickAdd from './pages/QuickAdd';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Savings from './pages/Savings';
import Debts from './pages/Debts';
import BottomTabs from './components/BottomTabs';
import NotificationRoll from './components/NotificationRoll';

function LayoutWithTabs() {
  return (
    <>
      <NotificationRoll />
      <div className="min-h-screen bg-secondary text-primary pb-16">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/bank" element={<Bank />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/quick-add" element={<QuickAdd />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/income" element={<Income />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
      <BottomTabs />
    </>
  );
}

// Composant intercepteur pour splash avec redirection
function SplashRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    console.log('SplashRedirect monté, redirection dans 2.5s');
    const timer = setTimeout(() => {
      console.log('Redirection vers /login');
      navigate('/login', { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);
  return <Splash />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/*" element={<LayoutWithTabs />} />
      </Routes>
    </BrowserRouter>
  );
} 