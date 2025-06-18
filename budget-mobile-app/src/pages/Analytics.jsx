import React from 'react';
import { useStore } from '../store';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import Card from '../components/atoms/Card';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analytics = () => {
  const { months, categories, data, revenus } = useStore();
  const idx = months.length - 1;
  // Dépenses par catégorie pour le dernier mois
  const expenseValues = categories.map(cat => data[cat]?.[idx] || 0);
  // Économies par mois = revenus - dépenses
  const economy = months.map((_, i) => {
    const totalExp = categories.reduce((sum, cat) => sum + (data[cat]?.[i] || 0), 0);
    return (revenus[i] || 0) - totalExp;
  });
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <Card>
        <h2 className="text-lg font-semibold mb-4">Répartition des dépenses</h2>
        <Pie
          data={{ labels: categories, datasets: [{ data: expenseValues }] }}
          options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
        />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Évolution des économies</h2>
        <Bar
          data={{ labels: months, datasets: [{ label: 'Économies', data: economy }] }}
          options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
        />
      </Card>
    </div>
  );
};

export default Analytics; 