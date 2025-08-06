import React from 'react';
import { useStore } from '../store';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { PlusIcon, CrossIcon, TableIcon, ChartIcon } from '../icons';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Budget() {
  const { months, categories, data, setValue, addCategory, removeCategory, addMonth, removeMonth, incomeTypes, incomes, setIncome, addIncomeType, removeIncomeType, renameIncomeType, renameCategory, sideByMonth, setSideByMonth } = useStore();

  const resetMonths = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('fr-FR', { month: 'long' });
    
    // Ajouter le mois en cours
    addMonth(currentMonth);
    
    // Ajouter les 5 mois précédents
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('fr-FR', { month: 'long' });
      addMonth(monthName);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Budget</h2>
        {months.length === 0 && (
          <button
            onClick={resetMonths}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réinitialiser les mois
          </button>
        )}
      </div>
      {/* Le contenu du budget sera ajouté ici */}
    </div>
  );
}

export default Budget; 