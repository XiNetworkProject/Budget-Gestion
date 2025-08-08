import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useStore } from '../store';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import CurrencyFormatter from '../components/CurrencyFormatter';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  IconButton, 
  Chip,
  Alert,
  AlertTitle,
  Collapse,
  Fab,
  Fade,
  Zoom
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Add,
  ArrowBack,
  ArrowForward,
  AccountBalance,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
  CheckCircle,
  Warning,
  Psychology,
  AttachMoney,
  MoneyOff,
  Lightbulb,
  Analytics,
  Logout,
  Star,
  Diamond,
  CardMembership,
  Notifications,
  Refresh,
  MoreVert,
  Info,
  BarChart,
  History,
  Settings,
  Savings
} from '@mui/icons-material';

// Composants optimisés
import ErrorBoundary from '../components/optimized/ErrorBoundary';
import LoadingSpinner from '../components/optimized/LoadingSpinner';
import KPICard from '../components/optimized/KPICard';
import { VirtualizedTransactions, VirtualizedRecommendations } from '../components/optimized/VirtualizedList';
import { FinancialCharts } from '../components/optimized/OptimizedCharts';

// Nouveaux composants modulaires
import HeaderSection from '../components/optimized/HeaderSection';
import BalanceCard from '../components/optimized/BalanceCard';

import { RecommendationsSection } from '../components/optimized/RecommendationCard';
import UpcomingPayments from '../components/optimized/UpcomingPayments';
import BankAccountsManager from '../components/optimized/BankAccountsManager';

// Hooks optimisés
import useOptimizedData from '../hooks/useOptimizedData';

// Composants
import QuickAdd from './QuickAdd';

// Configuration
import { ACTIVE_CONFIG } from '../config/environment';
import { PerformanceUtils } from '../config/performance';

// Composant de particules d'arrière-plan optimisé
const BackgroundParticles = React.memo(() => (
  <Box sx={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden'
  }}>
    {[...Array(20)].map((_, index) => (
      <Box
        key={index}
        sx={{
          position: 'absolute',
          width: Math.random() * 4 + 2,
          height: Math.random() * 4 + 2,
          background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, ${Math.random() * 0.3 + 0.1})`,
          borderRadius: '50%',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `floatParticle ${Math.random() * 10 + 10}s linear infinite`,
          animationDelay: `${Math.random() * 5}s`,
          filter: 'blur(0.5px)',
          boxShadow: '0 0 10px rgba(255,255,255,0.3)'
        }}
      />
    ))}
    
    {[...Array(8)].map((_, index) => (
      <Box
        key={`large-${index}`}
        sx={{
          position: 'absolute',
          width: Math.random() * 8 + 4,
          height: Math.random() * 8 + 4,
          background: `rgba(255, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 0.2 + 0.05})`,
          borderRadius: '50%',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `floatParticleLarge ${Math.random() * 15 + 20}s linear infinite`,
          animationDelay: `${Math.random() * 10}s`,
          filter: 'blur(1px)',
          boxShadow: '0 0 20px rgba(255,255,255,0.2)'
        }}
      />
    ))}
  </Box>
));

// Composant principal optimisé
const HomeOptimized = () => {
  const { 
    data, 
    months, 
    selectedMonth, 
    selectedYear, 
    setSelectedMonth, 
    setSelectedYear,
    categories,
    revenus, 
    incomes,
    persons,
    saved,
    sideByMonth, 
    totalPotentialSavings,
    budgetLimits, 
    expenses,
    incomeTransactions,
    savings,
    debts,
    bankAccounts,
    transactions,
    userProfile,
    appSettings,
    updateUserProfile,
    updateAppSettings,
    isLoading,
    isSaving,
    error,
    serverConnected,
    tutorialCompleted,
    onboardingCompleted,
    forceTutorial,
    setTutorialCompleted,
    clearForceTutorial,
    validateAndCleanDates,
    syncExpensesWithCategories,
    showUpdateDialog,
    closeUpdateDialog,
    checkForUpdates,
    checkAndFixOnboardingState,
    activeAccount, 
    accounts, 
    setActiveAccount,
    showTutorial: storeShowTutorial,
    setShowTutorial: setStoreShowTutorial,
    showOnboarding,
    setShowOnboarding,
    subscription,
    subscriptionPlans,
    getCurrentPlan,
    isFeatureAvailable,
    hasFullAI,
    hasPartialAI,
    getAILevel,
    isAuthenticated,
    user,
    logout,
    reloadBudgetData,
    processRecurringTransactions
  } = useStore();
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
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
    validateAndCleanDates();
  }, [validateAndCleanDates]);

  // Traiter les transactions récurrentes au chargement
  useEffect(() => {
    processRecurringTransactions();
  }, [processRecurringTransactions]);

  // Fonction de débogage pour tester les calculs de dates
  const debugDateCalculations = useCallback(() => {
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
  }, [selectedMonth, selectedYear, expenses, incomeTransactions]);

  // Fonction pour sauvegarder les données
  const saveData = useCallback((newData) => {
    try {
      localStorage.setItem('budgetAppData', JSON.stringify(newData));
      setLocalData(newData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, []);

  // Fonctions memoizées
  const getMonthName = useCallback((month, year) => {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${monthNames[month]} ${year}`;
  }, []);

  const navigateMonth = useCallback((direction) => {
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
  }, [selectedMonth, selectedYear, setSelectedMonth]);

  // Fonction pour parser les dates
  const parseDate = useCallback((dateString) => {
    if (!dateString) return new Date();
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Date invalide détectée:', dateString);
        return new Date();
      }
      return date;
    } catch (error) {
      console.error('Erreur lors du parsing de la date:', dateString, error);
      return new Date();
    }
  }, []);

  // Fonction pour vérifier si une date correspond au mois sélectionné
  const isDateInSelectedMonth = useCallback((dateString) => {
    if (!dateString) return false;
    
    try {
      const date = parseDate(dateString);
      const isInMonth = date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      
      return isInMonth;
    } catch (error) {
      console.error('Erreur dans isDateInSelectedMonth:', error);
      return false;
    }
  }, [selectedMonth, selectedYear, parseDate]);

  // Calculer les données du mois sélectionné
  const selectedMonthData = useMemo(() => {
    // Calculer les revenus du mois sélectionné
    const selectedMonthIncomeTransactions = incomeTransactions
      .filter(t => isDateInSelectedMonth(t.date))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Calculer les dépenses du mois sélectionné
    const selectedMonthExpenses = expenses
      .filter(e => isDateInSelectedMonth(e.date))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    // Calculer les économies du mois sélectionné
    const selectedMonthSaved = selectedMonthIncomeTransactions - selectedMonthExpenses;

    return {
      income: selectedMonthIncomeTransactions,
      expenses: selectedMonthExpenses,
      saved: selectedMonthSaved,
      transactions: transactions.filter(t => isDateInSelectedMonth(t.date))
    };
  }, [incomeTransactions, expenses, transactions, isDateInSelectedMonth]);

  // Système de prévisions intelligentes
  const calculateIntelligentForecast = useCallback(() => {
    const currentDate = new Date(selectedYear, selectedMonth, 1);
    const nextMonth = new Date(selectedYear, selectedMonth + 1, 1);
    const nextMonthYear = nextMonth.getFullYear();
    const nextMonthIndex = nextMonth.getMonth();
    
    // Prévisions de revenus basées sur les transactions récentes
    const calculateIncomeForecast = () => {
      const recentMonths = [0, 1, 2].map(i => {
        const monthDate = new Date(selectedYear, selectedMonth - i, 1);
        
        const monthIncomeTransactions = incomeTransactions
          .filter(t => {
            const date = parseDate(t.date);
            return date.getMonth() === monthDate.getMonth() && 
                   date.getFullYear() === monthDate.getFullYear();
          })
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        return monthIncomeTransactions;
      });
      
      const avgRecentIncome = recentMonths.reduce((sum, val, index) => {
        const weights = [0.5, 0.3, 0.2];
        return sum + (val * weights[index]);
      }, 0);
      
      const trend = recentMonths[0] - recentMonths[2];
      const trendPercentage = Math.abs(trend) / Math.max(avgRecentIncome, 1);
      
      let adjustedForecast = avgRecentIncome;
      if (trendPercentage > 0.1) {
        adjustedForecast = avgRecentIncome * (1 + (trend / avgRecentIncome) * 0.3);
      }
      
      const variance = recentMonths.reduce((sum, val) => sum + Math.pow(val - avgRecentIncome, 2), 0) / recentMonths.length;
      const volatility = Math.sqrt(variance) / Math.max(avgRecentIncome, 1);
      
      return {
        forecast: Math.max(adjustedForecast, 0),
        trend: trend,
        volatility: volatility,
        confidence: Math.max(0.5, 1 - volatility)
      };
    };
    
    // Prévisions de dépenses basées sur les transactions récentes
    const calculateExpenseForecast = () => {
      const recentExpenses = [0, 1, 2].map(i => {
        const monthDate = new Date(selectedYear, selectedMonth - i, 1);
        
        const monthExpenses = expenses
          .filter(e => {
            const date = parseDate(e.date);
            return date.getMonth() === monthDate.getMonth() && 
                   date.getFullYear() === monthDate.getFullYear();
          })
          .reduce((sum, e) => sum + (e.amount || 0), 0);
        
        return monthExpenses;
      });
      
      const avgRecentExpenses = recentExpenses.reduce((sum, val, index) => {
        const weights = [0.5, 0.3, 0.2];
        return sum + (val * weights[index]);
      }, 0);
      
      const trend = recentExpenses[0] - recentExpenses[2];
      const trendPercentage = Math.abs(trend) / Math.max(avgRecentExpenses, 1);
      
      let adjustedForecast = avgRecentExpenses;
      if (trendPercentage > 0.1) {
        adjustedForecast = avgRecentExpenses * (1 + (trend / avgRecentExpenses) * 0.3);
      }
      
      const variance = recentExpenses.reduce((sum, val) => sum + Math.pow(val - avgRecentExpenses, 2), 0) / recentExpenses.length;
      const volatility = Math.sqrt(variance) / Math.max(avgRecentExpenses, 1);
      
      const categoryAnalysis = Object.entries(data).map(([category, arr]) => {
        const categoryExpenses = expenses
          .filter(e => e.category === category && isDateInSelectedMonth(e.date))
          .reduce((sum, e) => sum + (e.amount || 0), 0);
        
        return { category, amount: categoryExpenses };
      });
      
      return {
        forecast: Math.max(adjustedForecast, 0),
        trend: trend,
        volatility: volatility,
        confidence: Math.max(0.5, 1 - volatility),
        categoryBreakdown: categoryAnalysis
      };
    };
    
    const incomeForecast = calculateIncomeForecast();
    const expenseForecast = calculateExpenseForecast();
    const balanceForecast = incomeForecast.forecast - expenseForecast.forecast;
    
    return {
      income: incomeForecast.forecast,
      expenses: expenseForecast.forecast,
      balance: balanceForecast,
      incomeTrend: incomeForecast.trend,
      expenseTrend: expenseForecast.trend,
      incomeVolatility: incomeForecast.volatility,
      expenseVolatility: expenseForecast.volatility,
      incomeConfidence: incomeForecast.confidence,
      expenseConfidence: expenseForecast.confidence,
      categoryBreakdown: expenseForecast.categoryBreakdown
    };
  }, [selectedYear, selectedMonth, incomeTransactions, expenses, data, parseDate, isDateInSelectedMonth]);

  const forecast = calculateIntelligentForecast();

  // Générer des recommandations intelligentes
  const generateRecommendations = useCallback(() => {
    const recommendations = [];
    
    // Analyser le taux d'épargne
    const savingsRate = forecast.income > 0 ? (forecast.balance / forecast.income) * 100 : 0;
    if (savingsRate < 10) {
      recommendations.push({
        id: 'low_savings_rate',
        title: t('ai.lowSavingsRate'),
        description: t('ai.lowSavingsRateMessage', { savingsRate: Math.round(savingsRate) }),
        actionType: 'create_savings_plan',
        priority: 'high',
        type: 'warning',
        metrics: {
          savings_rate: `${Math.round(savingsRate)}%`,
          target: '20%'
        },
        tags: ['Épargne', 'Urgent'],
        suggestedPlan: {
          title: t('ai.emergencySavingsPlan'),
          description: t('ai.emergencySavingsPlanDescription'),
          category: 'Épargne',
          targetAmount: Math.round(selectedMonthData.expenses * 3),
          priority: 'high'
        }
      });
    } else if (savingsRate > 30) {
      recommendations.push({
        id: 'excellent_savings_rate',
        title: t('ai.excellentSavingsRate'),
        description: t('ai.excellentSavingsRateMessage', { savingsRate: Math.round(savingsRate) }),
        actionType: 'optimize_investment',
        priority: 'low',
        type: 'success',
        metrics: {
          savings_rate: `${Math.round(savingsRate)}%`,
          performance: 'Excellent'
        },
        tags: ['Investissement', 'Opportunité'],
        suggestedPlan: {
          title: t('ai.investmentPlan'),
          description: t('ai.diversifyInvestments'),
          category: 'Investissement',
          targetAmount: Math.round(forecast.balance * 0.5),
          priority: 'medium'
        }
      });
    }
    
    // Analyser les tendances des dépenses
    const currentMonthExpense = selectedMonthData.expenses;
    const expenseChange = ((forecast.expenses - currentMonthExpense) / Math.max(currentMonthExpense, 1)) * 100;
    
    if (expenseChange > 20) {
      recommendations.push({
        id: 'expense_increase',
        title: t('expectedExpenseIncrease'),
        description: t('expectedExpenseIncreaseMessage', { increase: Math.round(expenseChange) }),
        actionType: 'create_reduction_plan',
        priority: 'high',
        type: 'error',
        metrics: {
          increase: `+${Math.round(expenseChange)}%`,
          forecast: `${Math.round(forecast.expenses)}€`
        },
        tags: ['Dépenses', 'Réduction'],
        suggestedPlan: {
          title: t('reduceExpenses'),
          description: t('reduceExpensesMessage', { increase: Math.round(expenseChange) }),
          category: 'Réduction des dépenses',
          targetAmount: Math.round(currentMonthExpense * (expenseChange / 100)),
          priority: 'high'
        }
      });
    }
    
    // Analyser la stabilité des revenus
    const currentMonthIncome = selectedMonthData.income;
    const incomeChange = ((forecast.income - currentMonthIncome) / Math.max(currentMonthIncome, 1)) * 100;
    
    if (incomeChange < -15) {
      recommendations.push({
        id: 'income_decrease',
        title: t('ai.expectedIncomeDecrease'),
        description: t('ai.expectedIncomeDecreaseMessage', { decrease: Math.round(Math.abs(incomeChange)) }),
        actionType: 'prepare_contingency_plan',
        priority: 'high',
        type: 'warning',
        metrics: {
          decrease: `${Math.round(Math.abs(incomeChange))}%`,
          impact: 'Significatif'
        },
        tags: ['Revenus', 'Contingence'],
        suggestedPlan: {
          title: t('ai.financialContingencyPlan'),
          description: t('ai.financialContingencyPlanDescription'),
          category: 'Budget',
          targetAmount: Math.round(currentMonthIncome * (Math.abs(incomeChange) / 100)),
          priority: 'high'
        }
      });
    }
    
    // Recommandation générale si pas d'autres alertes
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'financial_health',
        title: t('financialHealth'),
        description: t('financialHealthMessage'),
        actionType: 'continue_monitoring',
        priority: 'low',
        type: 'success',
        metrics: {
          status: 'Sain',
          score: 'A+'
        },
        tags: ['Santé financière', 'Maintenance']
      });
    }
    
    // Trier par priorité
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }, [forecast, selectedMonthData, t]);

  const recommendations = generateRecommendations();

  // Gestion des actions des recommandations
  const handleRecommendationAction = useCallback((recommendation) => {
    switch (recommendation.actionType) {
      case 'review_expenses':
      case 'analyze_expenses':
        navigate('/analytics');
        break;
      case 'create_savings_plan':
      case 'optimize_investment':
      case 'create_reduction_plan':
      case 'prepare_contingency_plan':
        if (recommendation.suggestedPlan) {
          createSuggestedPlan(recommendation.suggestedPlan);
        }
        navigate('/action-plans');
        break;
      case 'continue_monitoring':
        alert('Vos finances sont en bonne santé. Continuez à surveiller régulièrement.');
        break;
      default:
        console.log('Action non reconnue:', recommendation.actionType);
    }
  }, [navigate]);

  // Fonction pour créer automatiquement un plan suggéré
  const createSuggestedPlan = useCallback((suggestedPlan) => {
    const newPlan = {
      id: Date.now(),
      title: suggestedPlan.title,
      description: suggestedPlan.description,
      category: suggestedPlan.category,
      targetAmount: suggestedPlan.targetAmount,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: suggestedPlan.priority,
      status: 'active',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    // Ici vous pouvez ajouter la logique pour sauvegarder le plan
    console.log('Plan suggéré créé:', newPlan);
  }, []);

  const getSubscriptionIcon = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return <CardMembership sx={{ color: '#9E9E9E' }} />;
    
    if (currentPlan.id === 'premium') return <Star sx={{ color: '#FFD700' }} />;
    if (currentPlan.id === 'pro') return <Diamond sx={{ color: '#00D4FF' }} />;
    return <CardMembership sx={{ color: '#9E9E9E' }} />;
  }, [getCurrentPlan]);

  const getSubscriptionText = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return t('subscription.free');
    
    if (currentPlan.id === 'premium') return t('subscription.premium');
    if (currentPlan.id === 'pro') return t('subscription.pro');
    return t('subscription.free');
  }, [getCurrentPlan, t]);

  const getSubscriptionColor = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return '#9E9E9E';
    
    if (currentPlan.id === 'premium') return '#FFD700';
    if (currentPlan.id === 'pro') return '#00D4FF';
    return '#9E9E9E';
  }, [getCurrentPlan]);



  // Données pour les graphiques memoizées
  const chartData = useMemo(() => {
    // Données pour le graphique en ligne (6 derniers mois)
    const last6Months = [];
    const revenuesByMonth = [];
    const expensesByMonth = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - i, 1);
      last6Months.push(getMonthName(date.getMonth(), date.getFullYear()));
      
      // Calculer les revenus pour ce mois
      const monthIncome = incomeTransactions
        .filter(t => {
          const transactionDate = parseDate(t.date);
          return transactionDate.getMonth() === date.getMonth() && 
                 transactionDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      // Calculer les dépenses pour ce mois
      const monthExpenses = expenses
        .filter(e => {
          const expenseDate = parseDate(e.date);
          return expenseDate.getMonth() === date.getMonth() && 
                 expenseDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      
      revenuesByMonth.push(monthIncome);
      expensesByMonth.push(monthExpenses);
    }

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

    // Données pour le graphique en anneau (répartition des dépenses par catégorie)
    const categoryExpenses = Object.entries(data).map(([category, arr]) => {
      const categoryAmount = expenses
        .filter(e => e.category === category && isDateInSelectedMonth(e.date))
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      return { category, amount: categoryAmount };
    }).filter(item => item.amount > 0);

    const doughnutData = {
      labels: categoryExpenses.map(item => item.category),
      datasets: [{
        data: categoryExpenses.map(item => item.amount),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    return { lineData, doughnutData };
  }, [selectedYear, selectedMonth, incomeTransactions, expenses, data, getMonthName, parseDate, isDateInSelectedMonth]);

  // Calcul des métriques de performance
  const performanceMetrics = useMemo(() => {
    const income = selectedMonthData?.income || 0;
    const expenses = selectedMonthData?.expenses || 0;
    const saved = selectedMonthData?.saved || 0;
    
    const savingsRate = income > 0 ? (saved / income) * 100 : 0;
    const budgetRespect = expenses > 0 ? Math.min((income - expenses) / income * 100, 100) : 100;
    const balanceTrend = saved > 0 ? 5 : saved < 0 ? -3 : 0;
    
    return {
      savingsRate,
      budgetRespect,
      balanceTrend
    };
  }, [selectedMonthData]);

  // Si les données ne sont pas encore chargées
  // Affichage skeleton pendant chargement
  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <LoadingSpinner message="Chargement des données optimisées..." variant="elegant" fullScreen />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <BackgroundParticles />
        
        <style>
          {`
            @keyframes floatParticle {
              0% { 
                transform: translateY(100vh) translateX(0px) rotate(0deg);
                opacity: 0;
              }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { 
                transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
                opacity: 0;
              }
            }
            @keyframes floatParticleLarge {
              0% { 
                transform: translateY(100vh) translateX(0px) rotate(0deg);
                opacity: 0;
              }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { 
                transform: translateY(-100px) translateX(${Math.random() * 300 - 150}px) rotate(720deg);
                opacity: 0;
              }
            }
            @keyframes pulse {
              0% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.05); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}
        </style>

        <Box sx={{ p: 0, position: 'relative', zIndex: 1 }}>
          {/* Alerte de connexion */}
          {!isAuthenticated && (
            <Fade in timeout={800}>
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3,
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <AlertTitle>{t('home.notConnected')}</AlertTitle>
                {t('home.notConnectedMessage')}
                <Button 
                  color="inherit" 
                  size="small" 
                  sx={{ ml: 1, borderRadius: 2 }}
                  onClick={() => window.location.href = '/login'}
                >
                  {t('home.connect')}
                </Button>
              </Alert>
            </Fade>
          )}
          
          {isAuthenticated && !serverConnected && (
            <Fade in timeout={800}>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <AlertTitle>{t('home.offlineMode')}</AlertTitle>
                {t('home.offlineModeMessage')}
              </Alert>
            </Fade>
          )}
          
          {/* En-tête amélioré */}
          <HeaderSection 
            user={user}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            navigateMonth={navigateMonth}
            getMonthName={getMonthName}
            getSubscriptionIcon={getSubscriptionIcon}
            getSubscriptionText={getSubscriptionText}
            getSubscriptionColor={getSubscriptionColor}
            serverConnected={serverConnected}
            logout={logout}
            balanceTrend={performanceMetrics.balanceTrend}
            onRefresh={reloadBudgetData}
            t={t}
          />

          {/* Solde principal amélioré */}
          <BalanceCard 
            selectedMonthSaved={selectedMonthData?.saved || 0}
            getMonthName={getMonthName}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            income={selectedMonthData?.income || 0}
            expenses={selectedMonthData?.expenses || 0}
            savingsRate={performanceMetrics.savingsRate}
            budgetRespect={performanceMetrics.budgetRespect}
            t={t}
          />

          {/* KPIs optimisés */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={6} md={3}>
              <KPICard
                title={t('home.revenues')}
                value={selectedMonthData?.income || 0}
                icon={TrendingUp}
                color="#4caf50"
                subtitle={getMonthName(selectedMonth, selectedYear)}
                variant="elegant"
                loading={isLoading}
                onClick={() => navigate('/income')}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <KPICard
                title={t('home.expenses')}
                value={selectedMonthData?.expenses || 0}
                icon={TrendingDown}
                color="#f44336"
                subtitle={getMonthName(selectedMonth, selectedYear)}
                variant="elegant"
                loading={isLoading}
                onClick={() => navigate('/expenses')}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <KPICard
                title={t('home.savings')}
                value={selectedMonthData?.saved || 0}
                icon={Savings}
                color="#2196f3"
                subtitle={t('home.thisMonth')}
                progress={performanceMetrics.savingsRate}
                variant="elegant"
                loading={isLoading}
                onClick={() => navigate('/savings')}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <KPICard
                title={t('home.forecasts')}
                value={forecast?.balance || 0}
                icon={AccountBalance}
                color="#ff9800"
                subtitle={getMonthName((selectedMonth + 1) % 12, selectedMonth === 11 ? selectedYear + 1 : selectedYear)}
                variant="elegant"
                loading={isLoading}
                onClick={() => navigate('/analytics')}
              />
            </Grid>
          </Grid>



          {/* Comptes bancaires et prochains paiements */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <BankAccountsManager />
            </Grid>
            <Grid item xs={12} md={6}>
              <UpcomingPayments maxItems={3} />
            </Grid>
          </Grid>

          {/* Graphiques optimisés */}
          <Suspense fallback={<LoadingSpinner message="Chargement des graphiques..." variant="contrast" />}>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  textAlign: 'center'
                }}
              >
                Évolution financière
              </Typography>
              <FinancialCharts
                lineData={chartData.lineData}
                doughnutData={chartData.doughnutData}
                loading={isLoading}
              />
            </Box>
          </Suspense>

          {/* Recommandations optimisées */}
          {isFeatureAvailable('aiAnalysis') && recommendations && recommendations.length > 0 && (
            <RecommendationsSection
              recommendations={recommendations}
              loading={isLoading}
              onActionClick={handleRecommendationAction}
              t={t}
            />
          )}

          {/* Transactions récentes optimisées */}
          {selectedMonthData?.transactions && selectedMonthData.transactions.length > 0 && (
            <Paper sx={{ 
              p: 3, 
              mb: 4,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              }
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 700, 
                mb: 3,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Transactions récentes
              </Typography>
              
              <VirtualizedTransactions
                transactions={selectedMonthData.transactions}
                loading={isLoading}
              />
            </Paper>
          )}

          {/* Bouton d'ajout rapide */}
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => setShowQuickAdd(true)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                transform: 'scale(1.1)',
                boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)',
              }
            }}
          >
            <Add />
          </Fab>

          {/* Popup QuickAdd */}
          <QuickAdd open={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default React.memo(HomeOptimized); 