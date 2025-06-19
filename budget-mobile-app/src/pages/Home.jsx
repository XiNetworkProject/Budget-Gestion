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
  InputLabel,
  Alert,
  AlertTitle,
  Collapse
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
  ArrowForward,
  Lightbulb,
  Analytics,
  Logout
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
    getSelectedMonthIndex,
    serverConnected,
    logout,
    isAuthenticated
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

  // Nettoyer les dates invalides au chargement de la page
  useEffect(() => {
    const { validateAndCleanDates } = useStore.getState();
    validateAndCleanDates();
  }, []);

  // Fonction de débogage pour tester les calculs de dates
  const debugDateCalculations = () => {
    console.log('=== DÉBOGAGE DES CALCULS DE DATES ===');
    console.log('Mois sélectionné:', selectedMonth, 'Année sélectionnée:', selectedYear);
    
    console.log('=== DÉPENSES ===');
    expenses.forEach((expense, index) => {
      const isInMonth = isDateInSelectedMonth(expense.date);
      console.log(`Dépense ${index}: ${expense.category} - ${expense.amount}€ - Date: ${expense.date} -> InMonth: ${isInMonth}`);
    });
    
    console.log('=== REVENUS ===');
    incomeTransactions.forEach((income, index) => {
      const isInMonth = isDateInSelectedMonth(income.date);
      console.log(`Revenu ${index}: ${income.type} - ${income.amount}€ - Date: ${income.date} -> InMonth: ${isInMonth}`);
    });
    
    console.log('=== RÉSULTATS ===');
    console.log('Dépenses du mois:', selectedMonthExpenses);
    console.log('Revenus du mois:', selectedMonthIncomeTransactions);
    console.log('Total dépenses:', selectedMonthExpense);
    console.log('Total revenus:', selectedMonthIncome);
    
    // Vérifier les dates problématiques
    console.log('=== VÉRIFICATION DES DATES ===');
    expenses.forEach((expense, index) => {
      const date = new Date(expense.date);
      console.log(`Dépense ${index} - Date originale: ${expense.date}`);
      console.log(`  - Date parsée: ${date.toISOString()}`);
      console.log(`  - Mois: ${date.getMonth()}, Année: ${date.getFullYear()}`);
      console.log(`  - Mois attendu: ${selectedMonth}, Année attendue: ${selectedYear}`);
      console.log(`  - Correspondance: ${date.getMonth() === selectedMonth && date.getFullYear() === selectedYear}`);
    });
  };

  // Appeler le débogage en mode développement
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugDateCalculations();
    }
  }, [selectedMonth, selectedYear, expenses, incomeTransactions]);

  // Sauvegarder les données dans localStorage
  const saveData = (newData) => {
    const dataToSave = { ...localData, ...newData };
    setLocalData(dataToSave);
    localStorage.setItem('budgetAppData', JSON.stringify(dataToSave));
  };

  const currentMonthIdx = getCurrentMonthIndex();
  // Calculer l'index du mois prochain pour les prévisions
  const nextMonth = (selectedMonth + 1) % 12;
  const nextMonthYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;

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

  // Fonction pour parser et valider une date
  const parseDate = (dateString) => {
    if (!dateString) {
      console.warn('Date vide détectée, utilisation de la date actuelle');
      return new Date();
    }
    
    // Essayer de parser la date
    let date;
    try {
      date = new Date(dateString);
    } catch (error) {
      console.warn('Erreur de parsing de date:', dateString, error);
      return new Date();
    }
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.warn('Date invalide détectée:', dateString, 'remplacée par la date actuelle');
      return new Date();
    }
    
    // Normaliser la date au début du jour pour éviter les problèmes de fuseau horaire
    // Utiliser 12h00 pour éviter les problèmes de décalage horaire
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    
    // Vérifier que la date n'est pas dans le futur (plus de 1 an)
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    if (normalizedDate > oneYearFromNow) {
      console.warn('Date dans le futur détectée:', dateString, 'remplacée par la date actuelle');
      return new Date();
    }
    
    // Vérifier que la date n'est pas trop ancienne (plus de 10 ans)
    const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    if (normalizedDate < tenYearsAgo) {
      console.warn('Date trop ancienne détectée:', dateString, 'remplacée par la date actuelle');
      return new Date();
    }
    
    // Log de débogage pour les dates valides
    if (process.env.NODE_ENV === 'development') {
      console.log(`Date valide parsée: ${dateString} -> ${normalizedDate.toISOString()} -> Month: ${normalizedDate.getMonth()}, Year: ${normalizedDate.getFullYear()}`);
    }
    
    return normalizedDate;
  };

  // Fonction pour vérifier si une date correspond au mois sélectionné
  const isDateInSelectedMonth = (dateString) => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return false;
      
      const isInMonth = date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      
      // Log de débogage pour identifier les problèmes
      console.log(`isDateInSelectedMonth: ${dateString} -> ${date.toISOString()} -> Month: ${date.getMonth()}/${selectedMonth}, Year: ${date.getFullYear()}/${selectedYear} -> InMonth: ${isInMonth}`);
      
      return isInMonth;
    } catch (error) {
      console.error('Erreur dans isDateInSelectedMonth:', error);
      return false;
    }
  };

  // Calculer les revenus du mois sélectionné - UTILISER SEULEMENT LES TRANSACTIONS INDIVIDUELLES
  const selectedMonthIncomeTransactions = incomeTransactions
    .filter(t => isDateInSelectedMonth(t.date))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const selectedMonthIncome = selectedMonthIncomeTransactions;

  // Calculer les dépenses du mois sélectionné - UTILISER SEULEMENT LES TRANSACTIONS INDIVIDUELLES
  const selectedMonthExpenses = expenses
    .filter(e => isDateInSelectedMonth(e.date))
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const selectedMonthExpense = selectedMonthExpenses;

  // Calculer les économies du mois sélectionné
  const selectedMonthSaved = selectedMonthIncome - selectedMonthExpense;

  // Système de prévisions intelligentes pour le mois prochain - SIMPLIFIÉ
  const calculateIntelligentForecast = () => {
    const currentDate = new Date();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const nextMonthYear = nextMonth.getFullYear();
    const nextMonthIndex = nextMonth.getMonth();
    
    // 1. Prévisions de revenus basées sur les transactions récentes
    const calculateIncomeForecast = () => {
      // Revenus récurrents (basés sur les 3 derniers mois)
      const recentMonths = [0, 1, 2].map(i => {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        
        // Transactions individuelles pour ce mois
        const monthIncomeTransactions = incomeTransactions
          .filter(t => {
            const date = parseDate(t.date);
            return date.getMonth() === monthDate.getMonth() && 
                   date.getFullYear() === monthDate.getFullYear();
          })
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        return monthIncomeTransactions;
      });
      
      // Calculer la moyenne des revenus récents (pondérée)
      const avgRecentIncome = recentMonths.reduce((sum, val, index) => {
        const weights = [0.5, 0.3, 0.2];
        return sum + (val * weights[index]);
      }, 0);
      
      return avgRecentIncome;
    };
    
    // 2. Prévisions de dépenses basées sur les transactions récentes
    const calculateExpenseForecast = () => {
      // Dépenses récentes (basées sur les 3 derniers mois)
      const recentExpenses = [0, 1, 2].map(i => {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        
        // Transactions individuelles pour ce mois
        const monthExpenses = expenses
          .filter(e => {
            const date = parseDate(e.date);
            return date.getMonth() === monthDate.getMonth() && 
                   date.getFullYear() === monthDate.getFullYear();
          })
          .reduce((sum, e) => sum + (e.amount || 0), 0);
        
        return monthExpenses;
      });
      
      // Calculer la moyenne des dépenses récentes (pondérée)
      const avgRecentExpenses = recentExpenses.reduce((sum, val, index) => {
        const weights = [0.5, 0.3, 0.2];
        return sum + (val * weights[index]);
      }, 0);
      
      return avgRecentExpenses;
    };
    
    const forecastIncome = calculateIncomeForecast();
    const forecastExpenses = calculateExpenseForecast();
    const forecastBalance = forecastIncome - forecastExpenses;
    
    return {
      income: forecastIncome,
      expenses: forecastExpenses,
      balance: forecastBalance
    };
  };
  
  const forecast = calculateIntelligentForecast();
  const nextMonthProjected = forecast.balance;

  // Générer des recommandations intelligentes
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Analyser le taux d'épargne
    const savingsRate = forecast.income > 0 ? (forecast.balance / forecast.income) * 100 : 0;
    if (savingsRate < 10) {
      recommendations.push({
        type: 'warning',
        title: 'Taux d\'épargne faible',
        message: `Votre taux d'épargne prévu est de ${Math.round(savingsRate)}%. Il est recommandé d'épargner au moins 20% de vos revenus.`,
        action: 'Réviser vos dépenses'
      });
    } else if (savingsRate > 30) {
      recommendations.push({
        type: 'success',
        title: 'Excellent taux d\'épargne',
        message: `Félicitations ! Votre taux d'épargne prévu de ${Math.round(savingsRate)}% est excellent.`,
        action: 'Continuer vos bonnes habitudes'
      });
    }
    
    // Analyser les tendances des dépenses
    const currentMonthExpense = selectedMonthExpense;
    const expenseChange = ((forecast.expenses - currentMonthExpense) / Math.max(currentMonthExpense, 1)) * 100;
    
    if (expenseChange > 20) {
      recommendations.push({
        type: 'error',
        title: 'Augmentation des dépenses prévue',
        message: `Vos dépenses pourraient augmenter de ${Math.round(expenseChange)}% le mois prochain.`,
        action: 'Identifier les causes de cette hausse'
      });
    } else if (expenseChange < -10) {
      recommendations.push({
        type: 'info',
        title: 'Diminution des dépenses prévue',
        message: `Vos dépenses pourraient diminuer de ${Math.round(Math.abs(expenseChange))}% le mois prochain.`,
        action: 'Maintenir cette tendance positive'
      });
    }
    
    // Analyser la stabilité des revenus
    const currentMonthIncome = selectedMonthIncome;
    const incomeChange = ((forecast.income - currentMonthIncome) / Math.max(currentMonthIncome, 1)) * 100;
    
    if (incomeChange < -15) {
      recommendations.push({
        type: 'warning',
        title: 'Baisse des revenus prévue',
        message: `Vos revenus pourraient diminuer de ${Math.round(Math.abs(incomeChange))}% le mois prochain.`,
        action: 'Préparer un plan de contingence'
      });
    }
    
    // Recommandation générale si pas d'autres alertes
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'Finances en bonne santé',
        message: 'Vos prévisions montrent une situation financière stable.',
        action: 'Continuer à suivre vos dépenses'
      });
    }
    
    return recommendations;
  };
  
  const recommendations = generateRecommendations();

  // Analyser les prévisions par catégorie (désactivé car nextMonthIndex n'existe plus)
  const getCategoryForecastAnalysis = () => {
    return [];
  };
  const categoryForecastAnalysis = getCategoryForecastAnalysis();

  // Factures à venir (limites de budget)
  const upcoming = Object.values(budgetLimits).reduce((sum, val) => sum + val, 0);

  // Données pour les graphiques (6 derniers mois à partir du mois actuel)
  const getLast6Months = () => {
    const currentDate = new Date();
    const months = [];
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(monthNames[date.getMonth()]);
    }
    
    return months;
  };
  
  const last6Months = getLast6Months();
  
  // Revenus par mois pour les graphiques
  const revenuesByMonth = last6Months.map((_, i) => {
    const currentDate = new Date();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
    
    // Calculer les revenus par type pour ce mois
    const monthIncomeByType = Object.values(incomes).reduce((sum, arr) => {
      // Trouver l'index correspondant dans le tableau des revenus
      const monthIndex = months.findIndex((_, idx) => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (months.length - 1 - idx));
        return monthDate.getMonth() === targetDate.getMonth() && 
               monthDate.getFullYear() === targetDate.getFullYear();
      });
      return sum + (arr[monthIndex] || 0);
    }, 0);
    
    // Calculer les transactions individuelles pour ce mois
    const monthIncomeTransactions = incomeTransactions
      .filter(t => {
        const date = parseDate(t.date);
        return date.getMonth() === targetDate.getMonth() && 
               date.getFullYear() === targetDate.getFullYear();
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    return monthIncomeByType + monthIncomeTransactions;
  });

  // Dépenses par mois pour les graphiques
  const expensesByMonth = last6Months.map((_, i) => {
    const currentDate = new Date();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
    
    // Calculer les transactions individuelles pour ce mois
    const monthExpenses = expenses
      .filter(e => {
        const date = parseDate(e.date);
        return date.getMonth() === targetDate.getMonth() && 
               date.getFullYear() === targetDate.getFullYear();
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    // Calculer les dépenses par catégorie pour ce mois
    const monthExpensesByCategory = Object.entries(data).reduce((sum, [category, arr]) => {
      // Vérifier si cette catégorie a des transactions individuelles pour ce mois
      const hasIndividualTransactions = expenses.some(e => {
        const date = parseDate(e.date);
        return e.category === category && 
               date.getMonth() === targetDate.getMonth() && 
               date.getFullYear() === targetDate.getFullYear();
      });
      
      // Si pas de transactions individuelles, utiliser la valeur par catégorie
      if (!hasIndividualTransactions) {
        const monthIndex = months.findIndex((_, idx) => {
          const monthDate = new Date();
          monthDate.setMonth(monthDate.getMonth() - (months.length - 1 - idx));
          return monthDate.getMonth() === targetDate.getMonth() && 
                 monthDate.getFullYear() === targetDate.getFullYear();
        });
        return sum + (arr[monthIndex] || 0);
      }
      return sum;
    }, 0);
    
    return monthExpenses + monthExpensesByCategory;
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
      data: Object.entries(data).map(([category, arr]) => {
        // Pour chaque catégorie, calculer le total des transactions individuelles du mois sélectionné
        const individualTransactions = expenses
          .filter(e => e.category === category && isDateInSelectedMonth(e.date))
          .reduce((sum, e) => sum + (e.amount || 0), 0);
        
        return individualTransactions;
      }),
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

  // Transactions récentes réelles (revenus et dépenses) - FILTRÉES PAR MOIS SÉLECTIONNÉ
  const allTransactions = [
    ...incomeTransactions
      .filter(t => isDateInSelectedMonth(t.date))
      .map(t => ({
        ...t,
        type: 'income',
        icon: '💰',
        category: t.type || 'Revenu',
        date: parseDate(t.date)
      })),
    ...expenses
      .filter(e => isDateInSelectedMonth(e.date))
      .map(t => ({
        ...t,
        type: 'expense',
        icon: '💸',
        category: t.category || 'Dépense',
        date: parseDate(t.date)
      }))
  ];
  const recentTransactions = allTransactions
    .sort((a, b) => b.date - a.date)
    .slice(0, 5)
    .map(t => ({
      ...t,
      date: t.date.toLocaleDateString('fr-FR')
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
      {/* Styles CSS pour l'animation pulse */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      
      {/* Alerte de connexion */}
      {!isAuthenticated && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Non connecté</AlertTitle>
          Vous n'êtes pas connecté. Vos données sont sauvegardées localement uniquement.
          <Button 
            color="inherit" 
            size="small" 
            sx={{ ml: 1 }}
            onClick={() => window.location.href = '/login'}
          >
            Se connecter
          </Button>
        </Alert>
      )}
      
      {isAuthenticated && !serverConnected && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Mode hors ligne</AlertTitle>
          Pas de connexion au serveur. Vos données sont sauvegardées localement.
        </Alert>
      )}
      
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
              {/* Indicateur de statut de connexion */}
              <IconButton
                sx={{
                  color: serverConnected ? 'success.main' : 'warning.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                title={serverConnected ? 'Connecté au serveur' : 'Mode hors ligne - Données locales'}
              >
                {serverConnected ? (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'currentColor' }} />
                ) : (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'currentColor', animation: 'pulse 2s infinite' }} />
                )}
              </IconButton>
              {/* Bouton de déconnexion */}
              <IconButton
                onClick={() => {
                  if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
                    logout();
                  }
                }}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                title="Se déconnecter"
              >
                <Logout />
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountBalance sx={{ mr: 1, color: 'warning.main' }} />
          <Typography variant="h6">
            Prévisions intelligentes pour {getMonthName((selectedMonth + 1) % 12, selectedMonth === 11 ? selectedYear + 1 : selectedYear)}
          </Typography>
          <Chip 
            label="IA" 
            size="small" 
            color="warning" 
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Calcul intelligent</AlertTitle>
          Les prévisions sont basées sur vos données historiques des 3 derniers mois, 
          les tendances saisonnières et vos budgets planifiés.
        </Alert>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="h6" color="success.dark">
                Revenus prévus
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                {forecast.income.toLocaleString()}€
              </Typography>
              <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
                Basé sur l'historique et les budgets
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
              <Typography variant="h6" color="error.dark">
                Dépenses prévues
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.dark' }}>
                {forecast.expenses.toLocaleString()}€
              </Typography>
              <Typography variant="body2" color="error.dark" sx={{ mt: 1 }}>
                Inclut les tendances saisonnières
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="h6" color="primary.dark">
                Économies prévues
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                {forecast.balance.toLocaleString()}€
              </Typography>
              <Typography variant="body2" color="primary.dark" sx={{ mt: 1 }}>
                {forecast.balance > 0 ? 'Prévision positive' : 'Attention nécessaire'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="h6" color="warning.dark">
                Taux d'épargne
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
                {forecast.income > 0 ? Math.round((forecast.balance / forecast.income) * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="warning.dark" sx={{ mt: 1 }}>
                Objectif recommandé: 20%
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Détails du calcul */}
        <Collapse in={true}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Détails du calcul intelligent:
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  • Revenus: Moyenne pondérée des 3 derniers mois + budgets planifiés
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  • Dépenses: Analyse des tendances + ajustements saisonniers
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  • Pondération: 50% mois récent, 30% avant-dernier, 20% troisième
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  • Précision: Améliore avec plus de données historiques
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Recommandations intelligentes */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Lightbulb sx={{ mr: 1, color: 'info.main' }} />
          <Typography variant="h6">
            Recommandations intelligentes
          </Typography>
          <Chip 
            label="IA" 
            size="small" 
            color="info" 
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>
        
        {recommendations.map((rec, index) => (
          <Alert 
            key={index}
            severity={rec.type} 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small">
                {rec.action}
              </Button>
            }
          >
            <AlertTitle>{rec.title}</AlertTitle>
            {rec.message}
          </Alert>
        ))}
      </Paper>

      {/* Analyse détaillée par catégorie */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Analytics sx={{ mr: 1, color: 'secondary.main' }} />
          <Typography variant="h6">
            Analyse des prévisions par catégorie
          </Typography>
          <Chip 
            label="Détail" 
            size="small" 
            color="secondary" 
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>
        
        <Grid container spacing={2}>
          {categoryForecastAnalysis.map((cat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {cat.category}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Actuel:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {cat.current.toLocaleString()}€
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Prévision:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      {cat.forecast.toLocaleString()}€
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tendance:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={cat.trend > 0 ? 'error.main' : cat.trend < 0 ? 'success.main' : 'text.secondary'}
                    >
                      {cat.trend > 0 ? '+' : ''}{cat.trend.toLocaleString()}€
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Volatilité:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.round(cat.volatility * 100)}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((cat.forecast / Math.max(cat.current, 1)) * 100, 200)} 
                    sx={{ 
                      mt: 1,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': { 
                        bgcolor: cat.trend > 0 ? 'error.main' : cat.trend < 0 ? 'success.main' : 'warning.main',
                        borderRadius: 3
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
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