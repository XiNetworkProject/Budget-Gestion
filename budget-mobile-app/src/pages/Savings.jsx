import React from 'react';
import { useStore } from '../store';
import { Box, Typography, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Savings = () => {
  const { months, sideByMonth } = useStore();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Économies
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Bar
          data={{
            labels: months,
            datasets: [{ label: 'Économies', data: sideByMonth }]
          }}
          options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
        />
      </Paper>
    </Box>
  );
};

export default Savings; 