import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/home', label: 'Accueil' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/quick-add', label: '+' },
  { to: '/history', label: 'Historique' },
  { to: '/bank', label: 'Banque' },
  { to: '/settings', label: 'Paramètres' },
];

const BottomTabs = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary flex justify-around items-center h-16 z-10">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={`flex-1 text-center py-2  ${
            location.pathname === tab.to ? 'text-accent font-bold' : 'text-secondary'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
};

export default BottomTabs; 