import React from 'react';
import { useStore } from '../store';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { PlusIcon, CrossIcon, TableIcon, ChartIcon } from '../icons';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Budget() {
  const { months, categories, data, setValue, addCategory, removeCategory, addMonth, removeMonth, incomeTypes, incomes, setIncome, addIncomeType, removeIncomeType, renameIncomeType, renameCategory, sideByMonth, setSideByMonth } = useStore();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Budget</h2>
      {/* Le contenu du budget sera ajouté ici */}
    </div>
  );
}

export default Budget; 