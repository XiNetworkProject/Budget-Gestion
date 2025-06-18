import React from 'react';
import { useStore } from '../store';

const Expenses = () => {
  const { months, categories, data } = useStore();
  const idx = months.length - 1;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dépenses</h1>
      <ul className="space-y-2">
        {categories.map(cat => (
          <li key={cat} className="flex justify-between">
            <span>{cat}</span>
            <span>{data[cat]?.[idx] || 0} €</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Expenses; 