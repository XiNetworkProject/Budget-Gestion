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
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  Title
} from 'chart.js';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  Title
);

const Analytics = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Données simulées pour la démo
  const mockData = {
    months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    categories: ['Alimentation', 'Transport', 'Loisirs', 'Logement', 'Santé'],
    expenses: {
      'Alimentation': [120, 150, 130, 140, 160, 145],
      'Transport': [80, 90, 85, 95, 88, 92],
      'Loisirs': [60, 70, 65, 75, 80, 70],
      'Logement': [500, 500, 500, 500, 500, 500],
      'Santé': [30, 40, 35, 45, 50, 42]
    },
    revenues: [1200, 1250, 1180, 1300, 1280, 1350],
    savings: [410, 300, 365, 445, 302, 501]
  };

  const currentData = useMemo(() => {
    const currentMonth = mockData.months.length - 1;
    const totalExpenses = Object.values(mockData.expenses).reduce((sum, cat) => sum + cat[currentMonth], 0);
    const currentRevenue = mockData.revenues[currentMonth];
    const currentSavings = mockData.savings[currentMonth];
    
    return {
      totalExpenses,
      currentRevenue,
      currentSavings,
      expenseByCategory: Object.entries(mockData.expenses).map(([cat, values]) => ({
        category: cat,
        amount: values[currentMonth]
      }))
    };
  }, []);

  const pieData = {
    labels: currentData.expenseByCategory.map(item => item.category),
    datasets: [{
      data: currentData.expenseByCategory.map(item => item.amount),
      backgroundColor: [
        '#FF6384',
        '#36A2EB', 
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const barData = {
    labels: mockData.months,
    datasets: [{
      label: 'Économies',
      data: mockData.savings,
      backgroundColor: 'rgba(75, 192, 192, 0.8)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const lineData = {
    labels: mockData.months,
    datasets: [
      {
        label: 'Revenus',
        data: mockData.revenues,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4
      },
      {
        label: 'Dépenses',
        data: mockData.months.map((_, i) => 
          Object.values(mockData.expenses).reduce((sum, cat) => sum + cat[i], 0)
        ),
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

  const savingsRate = ((currentData.currentSavings / currentData.currentRevenue) * 100).toFixed(1);
  const expenseRate = ((currentData.totalExpenses / currentData.currentRevenue) * 100).toFixed(1);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Analytics
        </Typography>
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
                  {currentData.currentRevenue.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
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
                  {currentData.totalExpenses.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
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
                  {currentData.currentSavings.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
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
        <Grid container spacing={2}>
          {currentData.expenseByCategory.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={item.category}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.category}
                  </Typography>
                  <Typography variant="h6">
                    {item.amount.toLocaleString()}€
                  </Typography>
                </Box>
                <Chip 
                  label={`${((item.amount / currentData.totalExpenses) * 100).toFixed(1)}%`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Analytics; 