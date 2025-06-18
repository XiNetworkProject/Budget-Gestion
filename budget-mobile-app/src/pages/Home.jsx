import React from 'react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, months, revenus, data, sideByMonth, budgetLimits } = useStore();
  const idx = months.length - 1;
  const income = revenus[idx] || 0;
  const expense = Object.values(data).reduce((sum, arr) => sum + (arr[idx] || 0), 0);
  const saved = sideByMonth[idx] || 0;
  const upcoming = Object.values(budgetLimits).reduce((sum, val) => sum + val, 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bonjour{user?.name ? `, ${user.name}` : ''}</h1>
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-primary h-48 w-48 rounded-full flex items-center justify-center">
          <span className="text-secondary text-xl font-bold">{saved}€</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/income" className="bg-primary rounded p-4 flex flex-col items-center">
          <span>Revenus</span>
          <span className="font-bold mt-2">{income}€</span>
        </Link>
        <Link to="/expenses" className="bg-primary rounded p-4 flex flex-col items-center">
          <span>Dépenses</span>
          <span className="font-bold mt-2">{expense}€</span>
        </Link>
        <Link to="/savings" className="bg-primary rounded p-4 flex flex-col items-center">
          <span>Économies</span>
          <span className="font-bold mt-2">{saved}€</span>
        </Link>
        <Link to="/debts" className="bg-primary rounded p-4 flex flex-col items-center">
          <span>Factures</span>
          <span className="font-bold mt-2">{upcoming}€</span>
        </Link>
      </div>
    </div>
  );
};

export default Home; 