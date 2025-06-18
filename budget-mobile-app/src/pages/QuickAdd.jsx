import React, { useState } from 'react';
import { useStore } from '../store';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import Card from '../components/atoms/Card';

const QuickAdd = () => {
  const { months, categories, setValue } = useStore();
  const [category, setCategory] = useState(categories[0] || '');
  const [amount, setAmount] = useState('');
  const idx = months.length - 1;

  const handleAdd = () => {
    const val = parseFloat(amount) || 0;
    setValue(category, idx, val);
    setAmount('');
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Ajout Rapide</h1>
      <Card>
        <h2 className="text-lg font-semibold mb-2">Nouvelle dépense</h2>
        <select
          className="w-full mb-2 bg-secondary text-primary border border-gray-400 rounded px-3 py-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Input
          type="number"
          placeholder="Montant (€)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full mb-4"
        />
        <Button onClick={handleAdd}>Ajouter</Button>
      </Card>
    </div>
  );
};

export default QuickAdd; 