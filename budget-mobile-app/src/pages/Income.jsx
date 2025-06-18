import React from 'react';
import { useStore } from '../store';

const Income = () => {
  const { months, incomeTypes, incomes } = useStore();
  const idx = months.length - 1;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Revenus</h1>
      <ul className="space-y-2">
        {incomeTypes.map(type => (
          <li key={type} className="flex justify-between">
            <span>{type}</span>
            <span>{incomes[type]?.[idx] || 0} €</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Income; 