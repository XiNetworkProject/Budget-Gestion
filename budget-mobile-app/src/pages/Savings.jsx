import React from 'react';
import { useStore } from '../store';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Savings = () => {
  const { months, sideByMonth } = useStore();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Économies</h1>
      <Bar
        data={{
          labels: months,
          datasets: [{ label: 'Économies', data: sideByMonth }]
        }}
        options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
      />
    </div>
  );
};

export default Savings; 