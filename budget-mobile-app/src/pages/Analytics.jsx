import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AccountBalance, 
  Savings,
  Refresh,
  Info
} from '@mui/icons-material';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  Title
} from 'chart.js';
import { useStore } from '../store';

ChartJS.register(
  ArcElement, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  Title
);

const Analytics = () => {
  const { 
    months, 
    categories, 
    data, 
    revenus, 
    incomeTypes, 
    incomes, 
    incomeTransactions, 
    expenses, 
    savings, 
    sideByMonth,
    activeAccount 
  } = useStore();
  const [timeFilter, setTimeFilter] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Index du mois courant
  const idx = months.length - 1;

  // Filtrer les données par compte actif
  const filteredIncomeTransactions = incomeTransactions.filter(t => !activeAccount || t.accountId === activeAccount?.id);
  const filteredExpenses = expenses.filter(e => !activeAccount || e.accountId === activeAccount?.id);
  const filteredSavings = savings.filter(s => !activeAccount || s.accountId === activeAccount?.id);

  // Calculer les revenus du mois courant (transactions + revenus par type)
  const currentMonthIncomeTransactions = filteredIncomeTransactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const currentMonth = new Date();
      return transactionDate.getMonth() === currentMonth.getMonth() && 
             transactionDate.getFullYear() === currentMonth.getFullYear();
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const currentMonthIncomeByType = Object.values(incomes).reduce((sum, arr) => sum + (arr[idx] || 0), 0);
  const currentRevenue = currentMonthIncomeTransactions + currentMonthIncomeByType;

  // Calculer les dépenses du mois courant (transactions + dépenses par catégorie)
  const currentMonthExpenses = filteredExpenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      const currentMonth = new Date();
      return expenseDate.getMonth() === currentMonth.getMonth() && 
             expenseDate.getFullYear() === currentMonth.getFullYear();
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const currentMonthExpensesByCategory = Object.values(data).reduce((sum, arr) => sum + (arr[idx] || 0), 0);
  const totalExpenses = currentMonthExpenses + currentMonthExpensesByCategory;

  // Calculer les économies (revenus - dépenses)
  const currentSavings = currentRevenue - totalExpenses;

  // Calculer les taux
  const savingsRate = currentRevenue > 0 ? ((currentSavings / currentRevenue) * 100).toFixed(1) : 0;
  const expenseRate = currentRevenue > 0 ? ((totalExpenses / currentRevenue) * 100).toFixed(1) : 0;

  // Revenus par mois (6 derniers mois)
  const revenuesByMonth = months.slice(-6).map((_, i) => {
    const monthIdx = months.length - 6 + i;
    const monthIncomeTransactions = filteredIncomeTransactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - i));
        return transactionDate.getMonth() === monthDate.getMonth() && 
               transactionDate.getFullYear() === monthDate.getFullYear();
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const monthIncomeByType = Object.values(incomes).reduce((sum, arr) => sum + (arr[monthIdx] || 0), 0);
    return monthIncomeTransactions + monthIncomeByType;
  });

  // Dépenses par mois (6 derniers mois)
  const expensesByMonth = months.slice(-6).map((_, i) => {
    const monthIdx = months.length - 6 + i;
    const monthExpenses = filteredExpenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - i));
        return expenseDate.getMonth() === monthDate.getMonth() && 
               expenseDate.getFullYear() === monthDate.getFullYear();
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const monthExpensesByCategory = Object.values(data).reduce((sum, arr) => sum + (arr[monthIdx] || 0), 0);
    return monthExpenses + monthExpensesByCategory;
  });

  // Économies par mois (revenus - dépenses)
  const savingsByMonth = revenuesByMonth.map((revenue, i) => revenue - expensesByMonth[i]);

  // Catégories de dépenses pour le mois courant
  const expenseByCategory = categories.map(cat => {
    const categoryExpenses = filteredExpenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        const currentMonth = new Date();
        return e.category === cat && 
               expenseDate.getMonth() === currentMonth.getMonth() && 
               expenseDate.getFullYear() === currentMonth.getFullYear();
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const categoryData = data[cat] ? data[cat][idx] || 0 : 0;
    return {
      category: cat,
      amount: categoryExpenses + categoryData
    };
  }).filter(item => item.amount > 0);

  // Graphiques
  const pieData = {
    labels: expenseByCategory.map(item => item.category),
    datasets: [{
      data: expenseByCategory.map(item => item.amount),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#2196F3', '#F44336'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const barData = {
    labels: months.slice(-6),
    datasets: [{
      label: 'Économies',
      data: savingsByMonth,
      backgroundColor: 'rgba(75, 192, 192, 0.8)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const lineData = {
    labels: months.slice(-6),
    datasets: [
      {
        label: 'Revenus',
        data: revenuesByMonth,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4
      },
      {
        label: 'Dépenses',
        data: expensesByMonth,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}€`;
          }
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '€';
          }
        }
      }
    }
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '€';
          }
        }
      }
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Analytics
          </Typography>
          {activeAccount && (
            <Typography variant="body2" color="text.secondary" component="span">
              Compte : {activeAccount.name}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Période</InputLabel>
            <Select
              value={timeFilter}
              label="Période"
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <MenuItem value="week">Semaine</MenuItem>
              <MenuItem value="month">Mois</MenuItem>
              <MenuItem value="quarter">Trimestre</MenuItem>
              <MenuItem value="year">Année</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Actualiser les données">
            <IconButton>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Fade in timeout={500}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalance sx={{ mr: 1 }} />
                  <Typography variant="h6">Revenus</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {currentRevenue.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                  Ce mois
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Fade in timeout={700}>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown sx={{ mr: 1 }} />
                  <Typography variant="h6">Dépenses</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalExpenses.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                  {expenseRate}% du revenu
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Fade in timeout={900}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Savings sx={{ mr: 1 }} />
                  <Typography variant="h6">Économies</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {currentSavings.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                  {savingsRate}% du revenu
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Fade in timeout={1100}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6">Taux d'épargne</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {savingsRate}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={parseFloat(savingsRate)} 
                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
                />
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Zoom in timeout={600}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Répartition des dépenses
                </Typography>
                <Tooltip title="Répartition des dépenses par catégorie">
                  <IconButton size="small">
                    <Info />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <Pie data={pieData} options={chartOptions} />
              </Box>
            </Paper>
          </Zoom>
        </Grid>

        <Grid item xs={12} md={6}>
          <Zoom in timeout={800}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Évolution des économies
                </Typography>
                <Tooltip title="Évolution mensuelle des économies">
                  <IconButton size="small">
                    <Info />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <Bar data={barData} options={barOptions} />
              </Box>
            </Paper>
          </Zoom>
        </Grid>

        <Grid item xs={12}>
          <Zoom in timeout={1000}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Revenus vs Dépenses
                </Typography>
                <Tooltip title="Comparaison des revenus et dépenses dans le temps">
                  <IconButton size="small">
                    <Info />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line data={lineData} options={lineOptions} />
              </Box>
            </Paper>
          </Zoom>
        </Grid>
      </Grid>

      {/* Détails par catégorie */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Détails par catégorie
        </Typography>
        {expenseByCategory.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" component="span">
            Aucune dépense enregistrée pour ce mois
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {expenseByCategory.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={item.category}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" component="span">
                      {item.category}
                    </Typography>
                    <Typography variant="h6">
                      {item.amount.toLocaleString()}€
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${totalExpenses > 0 ? ((item.amount / totalExpenses) * 100).toFixed(1) : 0}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default Analytics; 