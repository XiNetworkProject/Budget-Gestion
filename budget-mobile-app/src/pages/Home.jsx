import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Avatar, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Button, 
  IconButton, 
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Fade,
  Zoom
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Savings,
  AccountBalance,
  Add,
  MoreVert,
  Notifications,
  Refresh,
  Info
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Legend,
  ArcElement
);

const Home = () => {
  const { user, months, revenus, data, sideByMonth, budgetLimits } = useStore();
  const [localData, setLocalData] = useState({
    income: [],
    expenses: [],
    savings: [],
    recentTransactions: []
  });

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const savedData = localStorage.getItem('budgetAppData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setLocalData(parsed);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    }
  }, []);

  // Sauvegarder les données dans localStorage
  const saveData = (newData) => {
    const dataToSave = { ...localData, ...newData };
    setLocalData(dataToSave);
    localStorage.setItem('budgetAppData', JSON.stringify(dataToSave));
  };

  const idx = months.length - 1;
  const income = revenus[idx] || 0;
  const expense = Object.values(data).reduce((sum, arr) => sum + (arr[idx] || 0), 0);
  const saved = sideByMonth[idx] || 0;
  const upcoming = Object.values(budgetLimits).reduce((sum, val) => sum + val, 0);

  // Données pour les graphiques
  const lineData = {
    labels: months.slice(-6), // 6 derniers mois
    datasets: [
      {
        label: 'Revenus',
        data: revenus.slice(-6),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4
      },
      {
        label: 'Dépenses',
        data: months.slice(-6).map((_, i) => 
          Object.values(data).reduce((sum, arr) => sum + (arr[arr.length - 6 + i] || 0), 0)
        ),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4
      }
    ]
  };

  const doughnutData = {
    labels: Object.keys(data),
    datasets: [{
      data: Object.values(data).map(arr => arr[idx] || 0),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
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

  // Transactions récentes simulées
  const recentTransactions = [
    { id: 1, type: 'expense', amount: 45, category: 'Alimentation', date: 'Aujourd\'hui', icon: '🍔' },
    { id: 2, type: 'income', amount: 2500, category: 'Salaire', date: 'Hier', icon: '💰' },
    { id: 3, type: 'expense', amount: 120, category: 'Transport', date: 'Il y a 2 jours', icon: '🚗' },
    { id: 4, type: 'expense', amount: 80, category: 'Loisirs', date: 'Il y a 3 jours', icon: '🎬' }
  ];

  const getBalanceColor = (amount) => {
    if (amount > 0) return 'success.main';
    if (amount < 0) return 'error.main';
    return 'text.secondary';
  };

  const getProgressValue = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* En-tête avec avatar et salutation */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Bonjour{user?.name ? `, ${user.name}` : ''}
            </Typography>
            <Box>
              <IconButton>
                <Notifications />
              </IconButton>
              <IconButton>
                <Refresh />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: getBalanceColor(saved), 
                width: 100, 
                height: 100, 
                fontSize: '1.8rem',
                fontWeight: 'bold'
              }}
            >
              {saved.toLocaleString()}€
            </Avatar>
          </Box>
          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 1 }}>
            Solde actuel
          </Typography>
        </Box>
      </Fade>

      {/* KPIs principaux */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={600}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6">Revenus</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {income.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Ce mois
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={700}>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown sx={{ mr: 1 }} />
                  <Typography variant="h6">Dépenses</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {expense.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Ce mois
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={800}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Savings sx={{ mr: 1 }} />
                  <Typography variant="h6">Économies</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {saved.toLocaleString()}€
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressValue(saved, income)} 
                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
                />
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={900}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalance sx={{ mr: 1 }} />
                  <Typography variant="h6">Factures</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {upcoming.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  À venir
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Actions rapides */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Actions rapides
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Button
              component={RouterLink}
              to="/quick-add"
              variant="contained"
              startIcon={<Add />}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Ajouter
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              component={RouterLink}
              to="/expenses"
              variant="outlined"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Dépenses
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              component={RouterLink}
              to="/income"
              variant="outlined"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Revenus
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              component={RouterLink}
              to="/analytics"
              variant="outlined"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Analytics
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Graphiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Évolution des finances
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={lineData} options={lineOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Répartition des dépenses
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut data={doughnutData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Transactions récentes */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Transactions récentes
          </Typography>
          <Button
            component={RouterLink}
            to="/history"
            size="small"
            endIcon={<MoreVert />}
          >
            Voir tout
          </Button>
        </Box>
        
        <List>
          {recentTransactions.map((transaction, index) => (
            <React.Fragment key={transaction.id}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: transaction.type === 'income' ? 'success.main' : 'error.main' }}>
                    {transaction.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={transaction.category}
                  secondary={transaction.date}
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="h6" 
                    color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount}€
                  </Typography>
                  <Chip 
                    label={transaction.type === 'income' ? 'Revenu' : 'Dépense'} 
                    size="small" 
                    color={transaction.type === 'income' ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
              </ListItem>
              {index < recentTransactions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Home; 