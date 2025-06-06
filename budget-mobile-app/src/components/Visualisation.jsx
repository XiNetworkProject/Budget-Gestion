import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useStore } from '../store';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Visualisation() {
  const { data, incomes, sideByMonth, placedSavings } = useStore();

  const totalIncomes = Object.values(incomes).reduce((sum, amount) => sum + amount, 0);
  const totalExpenses = Object.values(data).reduce((sum, amount) => sum + amount, 0);
  const remainingAmount = totalIncomes - totalExpenses - sideByMonth - placedSavings;

  const pieData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  };

  const barData = {
    labels: ['Revenus', 'Dépenses', 'Économies', 'Restant'],
    datasets: [
      {
        label: 'Montants',
        data: [totalIncomes, totalExpenses, sideByMonth + placedSavings, remainingAmount],
        backgroundColor: [
          '#4CAF50',
          '#F44336',
          '#2196F3',
          '#FFC107'
        ]
      }
    ]
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-white">Répartition des Dépenses</h2>
          <div className="h-64">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-white">Vue d'Ensemble</h2>
          <div className="h-64">
            <Bar 
              data={barData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Visualisation; 