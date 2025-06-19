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
  Zoom,
  Select,
  MenuItem,
  FormControl,
  InputLabel
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
  Info,
  CalendarToday,
  ArrowBack,
  ArrowForward
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
  const { 
    user, 
    months, 
    revenus, 
    data, 
    sideByMonth, 
    budgetLimits, 
    incomeTransactions, 
    expenses,
    incomes,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    getCurrentMonthIndex,
    getSelectedMonthIndex
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

  const currentMonthIdx = getCurrentMonthIndex();
  const selectedMonthIdx = getSelectedMonthIndex();
  const nextMonthIdx = selectedMonthIdx + 1 < months.length ? selectedMonthIdx + 1 : selectedMonthIdx;

  // Fonction pour obtenir le nom du mois
  const getMonthName = (month, year) => {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${monthNames[month]} ${year}`;
  };

  // Fonction pour naviguer entre les mois
  const navigateMonth = (direction) => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;
    
    if (direction === 'next') {
      newMonth = (newMonth + 1) % 12;
      if (newMonth === 0) newYear++;
    } else {
      newMonth = (newMonth - 1 + 12) % 12;
      if (newMonth === 11) newYear--;
    }
    
    setSelectedMonth(newMonth, newYear);
  };

  // Calculer les revenus du mois sélectionné
  const selectedMonthIncomeByType = Object.values(incomes).reduce((sum, arr) => sum + (arr[selectedMonthIdx] || 0), 0);
  const selectedMonthIncomeTransactions = incomeTransactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === selectedMonth && 
             transactionDate.getFullYear() === selectedYear;
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const selectedMonthIncome = selectedMonthIncomeByType + selectedMonthIncomeTransactions;

  // Calculer les dépenses du mois sélectionné
  const selectedMonthExpensesByCategory = Object.values(data).reduce((sum, arr) => sum + (arr[selectedMonthIdx] || 0), 0);
  const selectedMonthExpenses = expenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === selectedMonth && 
             expenseDate.getFullYear() === selectedYear;
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const selectedMonthExpense = selectedMonthExpensesByCategory + selectedMonthExpenses;

  // Calculer les économies du mois sélectionné
  const selectedMonthSaved = selectedMonthIncome - selectedMonthExpense;

  // Calculer les prévisions pour le mois prochain
  const nextMonthIncomeByType = Object.values(incomes).reduce((sum, arr) => sum + (arr[nextMonthIdx] || 0), 0);
  const nextMonthExpensesByCategory = Object.values(data).reduce((sum, arr) => sum + (arr[nextMonthIdx] || 0), 0);
  const nextMonthProjected = nextMonthIncomeByType - nextMonthExpensesByCategory;

  // Factures à venir (limites de budget)
  const upcoming = Object.values(budgetLimits).reduce((sum, val) => sum + val, 0);

  // Données pour les graphiques (6 derniers mois)
  const last6Months = months.slice(-6);
  
  // Revenus par mois pour les graphiques
  const revenuesByMonth = last6Months.map((_, i) => {
    const monthIdx = months.length - 6 + i;
    const monthIncomeByType = Object.values(incomes).reduce((sum, arr) => sum + (arr[monthIdx] || 0), 0);
    const monthIncomeTransactions = incomeTransactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - i));
        return transactionDate.getMonth() === monthDate.getMonth() && 
               transactionDate.getFullYear() === monthDate.getFullYear();
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    return monthIncomeByType + monthIncomeTransactions;
  });

  // Dépenses par mois pour les graphiques
  const expensesByMonth = last6Months.map((_, i) => {
    const monthIdx = months.length - 6 + i;
    const monthExpensesByCategory = Object.values(data).reduce((sum, arr) => sum + (arr[monthIdx] || 0), 0);
    const monthExpenses = expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - i));
        return expenseDate.getMonth() === monthDate.getMonth() && 
               expenseDate.getFullYear() === monthDate.getFullYear();
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    return monthExpensesByCategory + monthExpenses;
  });

  const lineData = {
    labels: last6Months,
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
    labels: Object.keys(data),
    datasets: [{
      data: Object.values(data).map(arr => arr[selectedMonthIdx] || 0),
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
      {/* En-tête avec avatar et salutation */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.4rem' },
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px',
                  mb: 0.5
                }}
              >
                Bonjour{user?.name ? `, ${user.name}` : ''}
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <Notifications />
              </IconButton>
              <IconButton>
                <Refresh />
              </IconButton>
            </Box>
          </Box>

          {/* Sélecteur de mois */}
          <Paper sx={{ p: 2, mb: 2, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {getMonthName(selectedMonth, selectedYear)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={() => navigateMonth('prev')}
                  sx={{ color: 'white' }}
                >
                  <ArrowBack />
                </IconButton>
                <IconButton 
                  onClick={() => navigateMonth('next')}
                  sx={{ color: 'white' }}
                >
                  <ArrowForward />
                </IconButton>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 3,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${getBalanceColor(selectedMonthSaved)} 0%, ${getBalanceColor(selectedMonthSaved)}dd 100%)`,
                boxShadow: `0 8px 32px ${getBalanceColor(selectedMonthSaved)}40`,
                minWidth: { xs: 140, sm: 160, md: 180 },
                minHeight: { xs: 140, sm: 160, md: 180 },
                justifyContent: 'center',
                textAlign: 'center',
                border: `3px solid ${getBalanceColor(selectedMonthSaved)}30`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: `0 12px 40px ${getBalanceColor(selectedMonthSaved)}60`,
                }
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: {
                    xs: selectedMonthSaved >= 1000000 ? '1.5rem' : selectedMonthSaved >= 100000 ? '1.8rem' : '2.2rem',
                    sm: selectedMonthSaved >= 1000000 ? '1.8rem' : selectedMonthSaved >= 100000 ? '2.1rem' : '2.5rem',
                    md: selectedMonthSaved >= 1000000 ? '2.1rem' : selectedMonthSaved >= 100000 ? '2.4rem' : '2.8rem'
                  },
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  wordBreak: 'break-word',
                  maxWidth: '90%'
                }}
              >
                {selectedMonthSaved.toLocaleString()}€
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
                    color: getBalanceColor(selectedMonthSaved)
                  }}
                >
                  {selectedMonthSaved >= 0 ? '✓' : '!'}
                </Typography>
              </Box>
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
            Solde {getMonthName(selectedMonth, selectedYear)}
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
                  {selectedMonthIncome.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                  {getMonthName(selectedMonth, selectedYear)}
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
                  {selectedMonthExpense.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                  {getMonthName(selectedMonth, selectedYear)}
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
                  {selectedMonthSaved.toLocaleString()}€
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressValue(selectedMonthSaved, selectedMonthIncome)} 
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
                  <Typography variant="h6">Prévisions</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {nextMonthProjected.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                  {getMonthName((selectedMonth + 1) % 12, selectedMonth === 11 ? selectedYear + 1 : selectedYear)}
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

      {/* Prévisions détaillées */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Prévisions pour {getMonthName((selectedMonth + 1) % 12, selectedMonth === 11 ? selectedYear + 1 : selectedYear)}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="h6" color="success.dark">
                Revenus prévus
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                {nextMonthIncomeByType.toLocaleString()}€
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
              <Typography variant="h6" color="error.dark">
                Dépenses prévues
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.dark' }}>
                {nextMonthExpensesByCategory.toLocaleString()}€
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="h6" color="primary.dark">
                Économies prévues
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                {nextMonthProjected.toLocaleString()}€
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="h6" color="warning.dark">
                Taux d'épargne
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
                {nextMonthIncomeByType > 0 ? Math.round((nextMonthProjected / nextMonthIncomeByType) * 100) : 0}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

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