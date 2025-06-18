import React from 'react';
import { useStore } from '../store';

const Debts = () => {
  const { months, budgetLimits } = useStore();
  const idx = months.length - 1;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Factures</h1>
      <ul className="space-y-2">
        {Object.entries(budgetLimits).map(([cat, limit]) => (
          <li key={cat} className="flex justify-between">
            <span>{cat}</span>
            <span>{limit || 0} €</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Debts; 