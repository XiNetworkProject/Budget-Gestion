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
import MonthSelector from '../components/MonthSelector';

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
  const { 
    user, 
    currentMonth,
    getMonthStats,
    getMonthData,
    months, 
    revenus, 
    data, 
    sideByMonth, 
    budgetLimits, 
    incomeTransactions, 
    expenses,
    incomes
  } = useStore();
  
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

  // Obtenir les statistiques du mois actuel
  const currentStats = getMonthStats(currentMonth);
  const monthData = getMonthData(currentMonth);

  // Calculer les revenus du mois courant
  const income = currentStats.totalIncomes;

  // Calculer les dépenses du mois courant
  const expense = currentStats.totalExpenses;

  // Calculer les économies (revenus - dépenses)
  const saved = currentStats.balance;

  // Factures à venir (limites de budget)
  const upcoming = Object.values(budgetLimits).reduce((sum, val) => sum + val, 0);

  // Données pour les graphiques (6 derniers mois)
  const last6Months = months.slice(-6);
  
  // Revenus par mois pour les graphiques
  const revenuesByMonth = last6Months.map(month => {
    const monthStats = getMonthStats(month);
    return monthStats.totalIncomes;
  });

  // Dépenses par mois pour les graphiques
  const expensesByMonth = last6Months.map(month => {
    const monthStats = getMonthStats(month);
    return monthStats.totalExpenses;
  });

  const lineData = {
    labels: last6Months.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      const monthNames = [
        'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
        'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
      ];
      return `${monthNames[date.getMonth()]} ${year}`;
    }),
    datasets: [
      {
        label: 'Revenus',
        data: revenuesByMonth,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
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

  const doughnutData = {
    labels: Object.keys(monthData.categories),
    datasets: [{
      data: Object.values(monthData.categories),
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

  // Transactions récentes réelles (revenus et dépenses)
  const allTransactions = [
    ...incomeTransactions.map(t => ({
      ...t,
      type: 'income',
      icon: '💰',
      category: t.type || 'Revenu',
      date: t.date ? new Date(t.date) : new Date()
    })),
    ...expenses.map(t => ({
      ...t,
      type: 'expense',
      icon: '💸',
      category: t.category || 'Dépense',
      date: t.date ? new Date(t.date) : new Date()
    }))
  ];
  const recentTransactions = allTransactions
    .sort((a, b) => b.date - a.date)
    .slice(0, 5)
    .map(t => ({
      ...t,
      date: t.date instanceof Date ? t.date.toLocaleDateString('fr-FR') : t.date
    }));

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
      {/* En-tête avec salutation */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              mb: 1
            }}
          >
            Bonjour, {user?.firstName || 'Utilisateur'} !
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Voici un aperçu de vos finances
          </Typography>
        </Box>
      </Fade>

      {/* Sélecteur de mois */}
      <MonthSelector />

      {/* Solde principal avec cercle adaptatif */}
      <Fade in timeout={600}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mb: 3,
          position: 'relative'
        }}>
          <Box
            sx={{
              width: {
                xs: saved >= 1000000 ? 120 : saved >= 100000 ? 140 : 160,
                sm: saved >= 1000000 ? 140 : saved >= 100000 ? 160 : 180,
                md: saved >= 1000000 ? 160 : saved >= 100000 ? 180 : 200
              },
              height: {
                xs: saved >= 1000000 ? 120 : saved >= 100000 ? 140 : 160,
                sm: saved >= 1000000 ? 140 : saved >= 100000 ? 160 : 180,
                md: saved >= 1000000 ? 160 : saved >= 100000 ? 180 : 200
              },
              borderRadius: '50%',
              background: saved >= 0 
                ? 'linear-gradient(135deg, #4CAF50, #66BB6A, #81C784)'
                : 'linear-gradient(135deg, #F44336, #E57373, #EF5350)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
              }
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                fontSize: {
                  xs: saved >= 1000000 ? '1.5rem' : saved >= 100000 ? '1.8rem' : '2.2rem',
                  sm: saved >= 1000000 ? '1.8rem' : saved >= 100000 ? '2.1rem' : '2.5rem',
                  md: saved >= 1000000 ? '2.1rem' : saved >= 100000 ? '2.4rem' : '2.8rem'
                },
                lineHeight: 1.2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                wordBreak: 'break-word',
                maxWidth: '90%'
              }}
            >
              {saved.toLocaleString()}€
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: getBalanceColor(saved)
                }}
              >
                {saved >= 0 ? '✓' : '!'}
              </Typography>
            </Box>
          </Box>
          <Typography 
            variant="body2" 
            textAlign="center" 
            color="text.secondary" 
            sx={{ 
              mt: 2,
              fontSize: '0.9rem',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              opacity: 0.8
            }} 
            component="span"
          >
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
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
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
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
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
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
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