import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import CurrencyFormatter from '../components/CurrencyFormatter';
import { useTranslation } from 'react-i18next';
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
  Logout,
  Assignment,
  Star,
  Diamond,
  CardMembership
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
    logout
  } = useStore();
  const navigate = useNavigate();
  const [localData, setLocalData] = useState({
    income: [],
    expenses: [],
    savings: [],
    recentTransactions: []
  });
  const { t } = useTranslation();

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

  const currentMonthIdx = new Date().getMonth();
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

  // Système de prévisions intelligentes pour le mois prochain - CORRIGÉ
  const calculateIntelligentForecast = () => {
    // Utiliser le mois sélectionné comme référence au lieu de la date actuelle
    const currentDate = new Date(selectedYear, selectedMonth, 1);
    const nextMonth = new Date(selectedYear, selectedMonth + 1, 1);
    const nextMonthYear = nextMonth.getFullYear();
    const nextMonthIndex = nextMonth.getMonth();
    
    // 1. Prévisions de revenus basées sur les transactions récentes - CORRIGÉ
    const calculateIncomeForecast = () => {
      // Revenus récurrents (basés sur les 3 derniers mois par rapport au mois sélectionné)
      const recentMonths = [0, 1, 2].map(i => {
        const monthDate = new Date(selectedYear, selectedMonth - i, 1);
        
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
      
      // Analyser la tendance
      const trend = recentMonths[0] - recentMonths[2];
      const trendPercentage = Math.abs(trend) / Math.max(avgRecentIncome, 1);
      
      // Ajuster la prévision selon la tendance
      let adjustedForecast = avgRecentIncome;
      if (trendPercentage > 0.1) { // Si la tendance est significative (>10%)
        adjustedForecast = avgRecentIncome * (1 + (trend / avgRecentIncome) * 0.3);
      }
      
      // Analyser la stabilité (écart-type)
      const variance = recentMonths.reduce((sum, val) => sum + Math.pow(val - avgRecentIncome, 2), 0) / recentMonths.length;
      const volatility = Math.sqrt(variance) / Math.max(avgRecentIncome, 1);
      
      return {
        forecast: Math.max(adjustedForecast, 0),
        trend: trend,
        volatility: volatility,
        confidence: Math.max(0.5, 1 - volatility) // Confiance basée sur la stabilité
      };
    };
    
    // 2. Prévisions de dépenses basées sur les transactions récentes - CORRIGÉ
    const calculateExpenseForecast = () => {
      // Dépenses récentes (basées sur les 3 derniers mois par rapport au mois sélectionné)
      const recentExpenses = [0, 1, 2].map(i => {
        const monthDate = new Date(selectedYear, selectedMonth - i, 1);
        
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
      
      // Analyser la tendance
      const trend = recentExpenses[0] - recentExpenses[2];
      const trendPercentage = Math.abs(trend) / Math.max(avgRecentExpenses, 1);
      
      // Ajuster la prévision selon la tendance
      let adjustedForecast = avgRecentExpenses;
      if (trendPercentage > 0.1) { // Si la tendance est significative (>10%)
        adjustedForecast = avgRecentExpenses * (1 + (trend / avgRecentExpenses) * 0.3);
      }
      
      // Analyser la stabilité (écart-type)
      const variance = recentExpenses.reduce((sum, val) => sum + Math.pow(val - avgRecentExpenses, 2), 0) / recentExpenses.length;
      const volatility = Math.sqrt(variance) / Math.max(avgRecentExpenses, 1);
      
      // Analyser les dépenses par catégorie
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
  };
  
  const forecast = calculateIntelligentForecast();
  const nextMonthProjected = forecast.balance;

  // Générer des recommandations intelligentes - AMÉLIORÉ
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Analyser le taux d'épargne
    const savingsRate = forecast.income > 0 ? (forecast.balance / forecast.income) * 100 : 0;
    if (savingsRate < 10) {
      recommendations.push({
        type: 'warning',
        title: t('ai.lowSavingsRate'),
        message: t('ai.lowSavingsRateMessage', { savingsRate: Math.round(savingsRate) }),
        action: t('createSavingsPlan'),
        actionType: 'create_savings_plan',
        priority: 'high',
        suggestedPlan: {
          title: t('ai.emergencySavingsPlan'),
          description: t('ai.emergencySavingsPlanDescription'),
          category: 'Épargne',
          targetAmount: Math.round(selectedMonthExpense * 3),
          priority: 'high'
        }
      });
    } else if (savingsRate > 30) {
      recommendations.push({
        type: 'success',
        title: t('ai.excellentSavingsRate'),
        message: t('ai.excellentSavingsRateMessage', { savingsRate: Math.round(savingsRate) }),
        action: t('optimizeInvestment'),
        actionType: 'optimize_investment',
        priority: 'low',
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
    const currentMonthExpense = selectedMonthExpense;
    const expenseChange = ((forecast.expenses - currentMonthExpense) / Math.max(currentMonthExpense, 1)) * 100;
    
    if (expenseChange > 20) {
      recommendations.push({
        type: 'error',
        title: t('expectedExpenseIncrease'),
        message: t('expectedExpenseIncreaseMessage', { increase: Math.round(expenseChange) }),
        action: t('createReductionPlan'),
        actionType: 'create_reduction_plan',
        priority: 'high',
        suggestedPlan: {
          title: t('reduceExpenses'),
          description: t('reduceExpensesMessage', { increase: Math.round(expenseChange) }),
          category: 'Réduction des dépenses',
          targetAmount: Math.round(currentMonthExpense * (expenseChange / 100)),
          priority: 'high'
        }
      });
    } else if (expenseChange < -10) {
      recommendations.push({
        type: 'info',
        title: t('expectedExpenseDecrease'),
        message: t('expectedExpenseDecreaseMessage', { decrease: Math.round(Math.abs(expenseChange)) }),
        action: t('maintainTrend'),
        actionType: 'maintain_trend',
        priority: 'medium'
      });
    }
    
    // Analyser la stabilité des revenus
    const currentMonthIncome = selectedMonthIncome;
    const incomeChange = ((forecast.income - currentMonthIncome) / Math.max(currentMonthIncome, 1)) * 100;
    
    if (incomeChange < -15) {
      recommendations.push({
        type: 'warning',
        title: t('ai.expectedIncomeDecrease'),
        message: t('ai.expectedIncomeDecreaseMessage', { decrease: Math.round(Math.abs(incomeChange)) }),
        action: t('prepareContingencyPlan'),
        actionType: 'prepare_contingency_plan',
        priority: 'high',
        suggestedPlan: {
          title: t('ai.financialContingencyPlan'),
          description: t('ai.financialContingencyPlanDescription'),
          category: 'Budget',
          targetAmount: Math.round(currentMonthIncome * (Math.abs(incomeChange) / 100)),
          priority: 'high'
        }
      });
    }
    
    // Analyser les catégories de dépenses
    const categoryAnalysis = Object.entries(data).map(([category, arr]) => {
      const categoryExpenses = expenses
        .filter(e => e.category === category && isDateInSelectedMonth(e.date))
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      
      return { category, amount: categoryExpenses };
    }).sort((a, b) => b.amount - a.amount);
    
    // Recommandation pour la catégorie la plus dépensière
    if (categoryAnalysis.length > 0 && categoryAnalysis[0].amount > 0) {
      const topCategory = categoryAnalysis[0];
      const topCategoryPercentage = (topCategory.amount / selectedMonthExpense) * 100;
      
      if (topCategoryPercentage > 40) {
        recommendations.push({
          type: 'warning',
          title: t('concentrationExpenses'),
          message: t('concentrationExpensesMessage', { category: topCategory.category, percentage: Math.round(topCategoryPercentage) }),
          action: t('diversifyExpenses'),
          actionType: 'diversify_expenses',
          priority: 'medium',
          suggestedPlan: {
            title: t('reduceExpensesCategory', { category: topCategory.category }),
            description: t('reduceExpensesCategoryDescription', { category: topCategory.category }),
            category: 'Réduction des dépenses',
            targetAmount: Math.round(topCategory.amount * 0.2),
            priority: 'medium'
          }
        });
      }
    }
    
    // Analyser la fréquence des transactions
    const recentTransactions = expenses
      .filter(e => isDateInSelectedMonth(e.date))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    if (recentTransactions.length > 0) {
      const avgAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length;
      const smallTransactions = recentTransactions.filter(t => t.amount < 10).length;
      
      if (smallTransactions > recentTransactions.length * 0.6) {
        recommendations.push({
          type: 'info',
          title: t('frequentSmallExpenses'),
          message: t('frequentSmallExpensesMessage', { smallTransactions: smallTransactions, totalTransactions: recentTransactions.length }),
          action: t('consolidateExpenses'),
          actionType: 'consolidate_expenses',
          priority: 'medium',
          suggestedPlan: {
            title: t('consolidateExpenses'),
            description: t('consolidateExpensesDescription'),
            category: 'Budget',
            targetAmount: Math.round(avgAmount * smallTransactions * 0.3),
            priority: 'medium'
          }
        });
      }
    }
    
    // Recommandation générale si pas d'autres alertes
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: t('financialHealth'),
        message: t('financialHealthMessage'),
        action: t('continueMonitoring'),
        actionType: 'continue_monitoring',
        priority: 'low'
      });
    }
    
    // Trier par priorité
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  };
  
  const recommendations = generateRecommendations();

  // Fonctions pour gérer les actions des recommandations - AMÉLIORÉ
  const handleRecommendationAction = (actionType, recommendation) => {
    switch (actionType) {
      case 'review_expenses':
        // Ouvrir la page Analytics avec focus sur les dépenses
        navigate('/analytics');
        break;
      case 'analyze_expenses':
        // Ouvrir la page Analytics
        navigate('/analytics');
        break;
      case 'maintain_trend':
        // Afficher un message de confirmation
        alert('Continuez vos bonnes habitudes ! Votre tendance est positive.');
        break;
      case 'prepare_plan':
        // Ouvrir la page des plans d'actions
        navigate('/action-plans');
        break;
      case 'diversify_expenses':
        // Ouvrir la page Analytics pour voir la répartition
        navigate('/analytics');
        break;
      case 'consolidate_expenses':
        // Afficher des conseils pour consolider
        alert('Conseil : Regroupez vos petites dépenses en une seule transaction mensuelle pour mieux les contrôler.');
        break;
      case 'continue_good_habits':
        // Message d'encouragement
        alert('Excellent travail ! Continuez sur cette voie.');
        break;
      case 'continue_monitoring':
        // Message de confirmation
        alert('Vos finances sont en bonne santé. Continuez à surveiller régulièrement.');
        break;
      case 'create_savings_plan':
      case 'optimize_investment':
      case 'create_reduction_plan':
      case 'prepare_contingency_plan':
        // Créer automatiquement un plan suggéré et naviguer vers la page des plans
        if (recommendation.suggestedPlan) {
          createSuggestedPlan(recommendation.suggestedPlan);
        }
        navigate('/action-plans');
        break;
      default:
        console.log('Action non reconnue:', actionType);
    }
  };

  // Fonction pour créer automatiquement un plan suggéré
  const createSuggestedPlan = (suggestedPlan) => {
    // Créer un plan d'action basé sur la recommandation
    const newPlan = {
      id: Date.now(),
      title: suggestedPlan.title,
      description: suggestedPlan.description,
      category: suggestedPlan.category,
      targetAmount: suggestedPlan.targetAmount,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
      priority: suggestedPlan.priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      isSuggested: true
    };
    
    const updatedPlans = [...existingPlans, newPlan];
    localStorage.setItem('actionPlans', JSON.stringify(updatedPlans));
    
    alert(t('home.planCreatedAutomatically', { title: suggestedPlan.title }));
  };

  // Fonction pour gérer les actions des catégories
  const handleCategoryAction = (actionType, category) => {
    switch (actionType) {
      case 'reduce_expenses':
        // Créer un plan de réduction pour cette catégorie
        const reductionPlan = {
          title: t('home.reduceExpensesCategory', { category: category.category }),
          description: t('home.reduceExpensesCategoryDescription', { 
            category: category.category, 
            percentage: Math.round(category.trendPercentage) 
          }),
          category: t('home.reduceExpenses'),
          targetAmount: Math.round(category.current * (category.trendPercentage / 100)),
          priority: 'high'
        };
        createSuggestedPlan(reductionPlan);
        break;
      case 'maintain_trend':
        // Message d'encouragement
        alert(t('home.maintainTrend', { category: category.category }));
        break;
      case 'monitor':
        // Naviguer vers Analytics pour surveiller
        navigate('/analytics');
        break;
      default:
        console.log('Action de catégorie non reconnue:', actionType);
    }
  };

  // Fonction pour obtenir l'icône de tendance
  const getTrendIcon = (trendDirection) => {
    switch (trendDirection) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  // Fonction pour obtenir la couleur de confiance
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success.main';
    if (confidence >= 0.6) return 'warning.main';
    return 'error.main';
  };

  // Analyser les prévisions par catégorie - AMÉLIORÉ ET FONCTIONNEL
  const getCategoryForecastAnalysis = () => {
    const categoryAnalysis = [];
    
    // Utiliser les données de prévisions améliorées
    const forecast = calculateIntelligentForecast();
    
    Object.entries(data).forEach(([category, arr]) => {
      // Dépenses actuelles du mois sélectionné
      const currentExpenses = expenses
        .filter(e => e.category === category && isDateInSelectedMonth(e.date))
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      
      // Calculer la prévision pour cette catégorie
      // Basé sur la tendance des 3 derniers mois
      const recentMonths = [0, 1, 2].map(i => {
        const monthDate = new Date(selectedYear, selectedMonth - i, 1);
        return expenses
          .filter(e => {
            const date = parseDate(e.date);
            return e.category === category && 
                   date.getMonth() === monthDate.getMonth() && 
                   date.getFullYear() === monthDate.getFullYear();
          })
          .reduce((sum, e) => sum + (e.amount || 0), 0);
      });
      
      // Moyenne pondérée des 3 derniers mois
      const avgRecent = recentMonths.reduce((sum, val, index) => {
        const weights = [0.5, 0.3, 0.2];
        return sum + (val * weights[index]);
      }, 0);
      
      // Calculer la tendance
      const trend = recentMonths[0] - recentMonths[2];
      const trendPercentage = Math.abs(trend) / Math.max(avgRecent, 1);
      
      // Prévision ajustée selon la tendance
      let forecastAmount = avgRecent;
      if (trendPercentage > 0.1) {
        forecastAmount = avgRecent * (1 + (trend / avgRecent) * 0.3);
      }
      
      // Calculer la volatilité
      const variance = recentMonths.reduce((sum, val) => sum + Math.pow(val - avgRecent, 2), 0) / recentMonths.length;
      const volatility = Math.sqrt(variance) / Math.max(avgRecent, 1);
      
      // Calculer le changement prévu
      const change = forecastAmount - currentExpenses;
      const changePercentage = currentExpenses > 0 ? (change / currentExpenses) * 100 : 0;
      
      // Déterminer le statut et les recommandations
      let status = 'stable';
      let statusColor = 'default';
      let recommendation = '';
      let actionType = '';
      
      if (changePercentage > 20) {
        status = 'augmentation';
        statusColor = 'error';
        recommendation = `Prévision d'augmentation de ${Math.round(changePercentage)}%`;
        actionType = 'reduce_expenses';
      } else if (changePercentage < -10) {
        status = 'diminution';
        statusColor = 'success';
        recommendation = `Prévision de diminution de ${Math.round(Math.abs(changePercentage))}%`;
        actionType = 'maintain_trend';
      } else {
        status = 'stable';
        statusColor = 'info';
        recommendation = 'Tendance stable';
        actionType = 'monitor';
      }
      
      // Calculer le pourcentage du budget total
      const budgetPercentage = selectedMonthExpense > 0 ? (currentExpenses / selectedMonthExpense) * 100 : 0;
      
      // Déterminer si c'est une catégorie importante
      const isImportant = budgetPercentage > 20 || Math.abs(changePercentage) > 15;
      
      categoryAnalysis.push({
        category: category,
        current: currentExpenses,
        forecast: Math.max(forecastAmount, 0),
        trend: change,
        trendPercentage: changePercentage,
        volatility: Math.min(volatility, 1),
        confidence: Math.max(0.3, 1 - volatility),
        status: status,
        statusColor: statusColor,
        recommendation: recommendation,
        actionType: actionType,
        budgetPercentage: budgetPercentage,
        isImportant: isImportant,
        recentMonths: recentMonths
      });
    });
    
    // Trier par importance (pourcentage du budget + changement significatif)
    return categoryAnalysis.sort((a, b) => {
      const aScore = (a.budgetPercentage * 0.7) + (Math.abs(a.trendPercentage) * 0.3);
      const bScore = (b.budgetPercentage * 0.7) + (Math.abs(b.trendPercentage) * 0.3);
      return bScore - aScore;
    });
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
      .map(e => ({
      ...e,
      type: 'expense',
      icon: '💸',
      category: e.category || 'Dépense',
        date: parseDate(e.date)
    }))
  ];
  const recentTransactions = allTransactions
    .sort((a, b) => b.date - a.date)
    .slice(0, 5)
    .map(t => ({
      ...t,
      date: t.date ? t.date.toLocaleDateString('fr-FR') : 'Date inconnue'
    }));

  const getBalanceColor = (amount) => {
    if (amount > 0) return 'success.main';
    if (amount < 0) return 'error.main';
    return 'text.secondary';
  };

  const getProgressValue = (current, target) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  // Fonction pour obtenir l'icône d'abonnement
  const getSubscriptionIcon = () => {
    const currentPlan = getCurrentPlan();
    
    if (currentPlan.id === 'premium') {
      return <Star sx={{ color: '#FFD700' }} />;
    } else if (currentPlan.id === 'pro') {
      return <Diamond sx={{ color: '#00D4FF' }} />;
    }
    return <CardMembership sx={{ color: '#9E9E9E' }} />;
  };

  // Fonction pour obtenir le texte de l'abonnement
  const getSubscriptionText = () => {
    const currentPlan = getCurrentPlan();
    
    if (currentPlan.id === 'premium') {
      return t('subscription.premium');
    } else if (currentPlan.id === 'pro') {
      return t('subscription.pro');
    }
    return t('subscription.free');
  };

  // Fonction pour obtenir la couleur de l'abonnement
  const getSubscriptionColor = () => {
    const currentPlan = getCurrentPlan();
    
    if (currentPlan.id === 'premium') {
      return '#FFD700';
    } else if (currentPlan.id === 'pro') {
      return '#00D4FF';
    }
    return '#9E9E9E';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules d'arrière-plan animées (sombre) */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.18,
        zIndex: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(0, 180, 255, 0.18) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(0, 255, 180, 0.13) 0%, transparent 60%),
          radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 70% 60%, rgba(80, 80, 255, 0.10) 0%, transparent 60%)
        `,
        animation: 'float 20s ease-in-out infinite'
      }} />
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(1deg); }
            66% { transform: translateY(10px) rotate(-1deg); }
          }
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes slideInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>

      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
        {/* Alerte de connexion */}
        {!isAuthenticated && (
          <Fade in timeout={800}>
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                background: 'rgba(255, 255, 255, 0.95)',
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
                background: 'rgba(255, 255, 255, 0.95)',
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
        
        {/* En-tête moderne avec salutation */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    color: 'white',
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2,
                    mb: 1
                  }}
                >
                  {t('home.hello')}{user?.name ? `, ${user.name}` : ''}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 400,
                    letterSpacing: '0.5px'
                  }}
                >
                  {getMonthName(selectedMonth, selectedYear)}
                </Typography>
              </Box>
              
              {/* Actions rapides en haut */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                flexWrap: 'wrap'
              }}>
                <IconButton
                  sx={{
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.1)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  <Notifications />
                </IconButton>
                <IconButton
                  sx={{
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.1)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  <Refresh />
                </IconButton>
                <IconButton
                  onClick={() => navigate('/subscription')}
                  sx={{
                    color: getSubscriptionColor(),
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.1)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                  title={`${t('subscription.currentPlan')}: ${getSubscriptionText()}`}
                >
                  {getSubscriptionIcon()}
                </IconButton>
                <IconButton
                  sx={{
                    color: serverConnected ? '#4caf50' : '#ff9800',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.1)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                  title={serverConnected ? t('home.connectedToServer') : t('home.offlineModeData')}
                >
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'currentColor',
                    animation: serverConnected ? 'none' : 'pulse 2s infinite'
                  }} />
                </IconButton>
                <IconButton
                  onClick={() => {
                    if (window.confirm(t('home.confirmLogout'))) {
                      logout();
                    }
                  }}
                  sx={{
                    color: '#f44336',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.1)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                  title={t('logout')}
                >
                  <Logout />
                </IconButton>
              </Box>
            </Box>

            {/* Navigation des mois moderne */}
            <Paper sx={{ 
              p: 2, 
              mb: 3, 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {getMonthName(selectedMonth, selectedYear)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    onClick={() => navigateMonth('prev')}
                    sx={{ 
                      color: 'white',
                      background: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.2)',
                        transform: 'scale(1.1)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                  <IconButton 
                    onClick={() => navigateMonth('next')}
                    sx={{ 
                      color: 'white',
                      background: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.2)',
                        transform: 'scale(1.1)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </Box>
              </Box>
            </Paper>

            {/* Solde principal avec design moderne */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box
                sx={{ 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 4,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${getBalanceColor(selectedMonthSaved)} 0%, ${getBalanceColor(selectedMonthSaved)}dd 100%)`,
                  boxShadow: `0 20px 60px ${getBalanceColor(selectedMonthSaved)}40`,
                  minWidth: { xs: 160, sm: 200, md: 240 },
                  minHeight: { xs: 160, sm: 200, md: 240 },
                  justifyContent: 'center',
                  textAlign: 'center',
                  border: `4px solid ${getBalanceColor(selectedMonthSaved)}30`,
                  transition: 'all 0.4s ease',
                  animation: 'pulse 3s ease-in-out infinite',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 30px 80px ${getBalanceColor(selectedMonthSaved)}60`,
                  }
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 900,
                    color: 'white',
                    fontSize: {
                      xs: selectedMonthSaved >= 1000000 ? '1.8rem' : selectedMonthSaved >= 100000 ? '2.2rem' : '2.6rem',
                      sm: selectedMonthSaved >= 1000000 ? '2.2rem' : selectedMonthSaved >= 100000 ? '2.6rem' : '3rem',
                      md: selectedMonthSaved >= 1000000 ? '2.6rem' : selectedMonthSaved >= 100000 ? '3rem' : '3.5rem'
                    },
                    lineHeight: 1.1,
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    wordBreak: 'break-word',
                    maxWidth: '90%'
                  }}
                >
                  <CurrencyFormatter amount={selectedMonthSaved} />
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: -12,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '2px solid white'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      color: getBalanceColor(selectedMonthSaved)
                    }}
                  >
                    {selectedMonthSaved >= 0 ? '✓' : '!'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Typography 
              variant="h6" 
              textAlign="center" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }} 
              component="span"
            >
              {t('home.balance')} {getMonthName(selectedMonth, selectedYear)}
            </Typography>
          </Box>
        </Fade>

        {/* KPIs principaux avec design moderne */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={600}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                color: 'white',
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(76, 175, 80, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(76, 175, 80, 0.4)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      background: 'rgba(255,255,255,0.2)',
                      mr: 2
                    }}>
                      <TrendingUp sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('home.revenues')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                    <CurrencyFormatter amount={selectedMonthIncome} />
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {getMonthName(selectedMonth, selectedYear)}
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={700}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: 'white',
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(244, 67, 54, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(244, 67, 54, 0.4)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      background: 'rgba(255,255,255,0.2)',
                      mr: 2
                    }}>
                      <TrendingDown sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('home.expenses')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                    <CurrencyFormatter amount={selectedMonthExpense} />
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {getMonthName(selectedMonth, selectedYear)}
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={800}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white',
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(33, 150, 243, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(33, 150, 243, 0.4)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      background: 'rgba(255,255,255,0.2)',
                      mr: 2
                    }}>
                      <Savings sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('home.savings')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                    <CurrencyFormatter amount={selectedMonthSaved} />
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getProgressValue(selectedMonthSaved, selectedMonthIncome)} 
                    sx={{ 
                      mt: 1, 
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.3)', 
                      '& .MuiLinearProgress-bar': { 
                        bgcolor: 'white',
                        borderRadius: 4
                      } 
                    }}
                  />
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={900}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                color: 'white',
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(255, 152, 0, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(255, 152, 0, 0.4)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      background: 'rgba(255,255,255,0.2)',
                      mr: 2
                    }}>
                      <AccountBalance sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('home.forecasts')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                    <CurrencyFormatter amount={nextMonthProjected} />
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {getMonthName((selectedMonth + 1) % 12, selectedMonth === 11 ? selectedYear + 1 : selectedYear)}
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Actions rapides modernes */}
        <Paper sx={{ 
          p: 3, 
          mb: 4,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            {t('home.quickActions')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Button
                component={RouterLink}
                to="/action-plans"
                variant="contained"
                startIcon={<Assignment />}
                fullWidth
                sx={{ 
                  py: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                  }
                }}
              >
                Plans d'actions
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                component={RouterLink}
                to="/expenses"
                variant="outlined"
                fullWidth
                sx={{ 
                  py: 2,
                  borderRadius: 3,
                  borderColor: '#f44336',
                  color: '#f44336',
                  borderWidth: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: '#f44336',
                    color: 'white',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 35px rgba(244, 67, 54, 0.3)',
                  }
                }}
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
                sx={{ 
                  py: 2,
                  borderRadius: 3,
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  borderWidth: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: '#4caf50',
                    color: 'white',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 35px rgba(76, 175, 80, 0.3)',
                  }
                }}
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
                sx={{ 
                  py: 2,
                  borderRadius: 3,
                  borderColor: '#2196f3',
                  color: '#2196f3',
                  borderWidth: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: '#2196f3',
                    color: 'white',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 35px rgba(33, 150, 243, 0.3)',
                  }
                }}
              >
                Analytics
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Graphiques avec design moderne */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              p: 3,
              background: 'rgba(255,255,255,0.95)',
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
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {t('home.financialEvolution')}
              </Typography>
              <Box sx={{ height: 350 }}>
                <Line data={lineData} options={lineOptions} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3,
              background: 'rgba(255,255,255,0.95)',
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
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {t('home.expenseBreakdown')}
              </Typography>
              <Box sx={{ height: 350 }}>
                <Doughnut data={doughnutData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Prévisions intelligentes avec design moderne */}
        {hasPartialAI() && (
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            background: 'rgba(255,255,255,0.95)',
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                mr: 2,
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
              }}>
                <AccountBalance sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Prévisions intelligentes {getMonthName((selectedMonth + 1) % 12, selectedMonth === 11 ? selectedYear + 1 : selectedYear)}
              </Typography>
              <Chip 
                label={t('home.ai')} 
                size="small" 
                sx={{ 
                  ml: 2,
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                }}
              />
            </Box>
            
            <Alert severity="info" sx={{ 
              mb: 3,
              borderRadius: 3,
              background: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.2)'
            }}>
              <AlertTitle>Calcul intelligent</AlertTitle>
              Ces prévisions utilisent l'IA pour analyser vos tendances et prédire vos finances du mois prochain.
            </Alert>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  borderRadius: 4,
                  color: 'white',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)',
                  }
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Revenus prévus
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                    {forecast.income.toLocaleString()}€
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    {forecast.incomeTrend > 0 ? '📈 +' : forecast.incomeTrend < 0 ? '📉 ' : '➡️ '}
                    {Math.abs(forecast.incomeTrend).toLocaleString()}€ vs ce mois
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                    Confiance: {Math.round(forecast.incomeConfidence * 100)}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                  borderRadius: 4,
                  color: 'white',
                  boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 35px rgba(244, 67, 54, 0.4)',
                  }
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Dépenses prévues
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                    {forecast.expenses.toLocaleString()}€
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    {forecast.expenseTrend > 0 ? '📈 +' : forecast.expenseTrend < 0 ? '📉 ' : '➡️ '}
                    {Math.abs(forecast.expenseTrend).toLocaleString()}€ vs ce mois
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                    Confiance: {Math.round(forecast.expenseConfidence * 100)}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  borderRadius: 4,
                  color: 'white',
                  boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)',
                  }
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Économies prévues
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                    {forecast.balance.toLocaleString()}€
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    {forecast.balance > 0 ? '✅ Prévision positive' : '⚠️ Attention nécessaire'}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                    Inclut les tendances saisonnières
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  borderRadius: 4,
                  color: 'white',
                  boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 35px rgba(255, 152, 0, 0.4)',
                  }
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Taux d'épargne
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                    {forecast.income > 0 ? Math.round((forecast.balance / forecast.income) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Objectif recommandé: 20%
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                    Basé sur les prévisions IA
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Détails du calcul amélioré */}
            <Collapse in={true}>
              <Box sx={{ 
                mt: 3, 
                p: 3, 
                background: 'rgba(33, 150, 243, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(33, 150, 243, 0.1)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
                  🧠 Détails du calcul intelligent:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      • Revenus: Moyenne pondérée des 3 derniers mois + ajustement tendance
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      • Dépenses: Analyse des tendances + ajustements saisonniers
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      • Pondération: 50% mois récent, 30% avant-dernier, 20% troisième
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      • Précision: Améliore avec plus de données historiques
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      • Volatilité: Mesure de la stabilité des données
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      • Confiance: Indicateur de fiabilité des prévisions
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Paper>
        )}

        {/* Message pour les utilisateurs gratuits - Prévisions intelligentes */}
        {!hasPartialAI() && (
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 152, 0, 0.2)',
            boxShadow: '0 8px 32px rgba(255, 152, 0, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                mr: 2,
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
              }}>
                <AccountBalance sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {t('home.upgradeForIntelligentForecasts')}
              </Typography>
              <Chip 
                label={t('home.premium')} 
                size="small" 
                sx={{ 
                  ml: 2,
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                }}
              />
            </Box>
            <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
              {t('home.intelligentForecastsDescription')}
            </Typography>
            <Button 
              variant="contained" 
              sx={{
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(255, 152, 0, 0.4)',
                }
              }}
              onClick={() => navigate('/subscription')}
              startIcon={<AccountBalance />}
            >
              {t('home.upgradeNow')}
            </Button>
          </Paper>
        )}

        {/* Recommandations intelligentes avec design moderne */}
        {isFeatureAvailable('aiAnalysis') && (
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            background: 'rgba(255,255,255,0.95)',
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                mr: 2,
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }}>
                <Lightbulb sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Recommandations intelligentes
              </Typography>
              <Chip 
                label={t('home.ai')} 
                size="small" 
                sx={{ 
                  ml: 2,
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                }}
              />
              <Chip 
                label={`${recommendations.length} conseils`}
                size="small" 
                sx={{ 
                  ml: 2,
                  background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
                }}
              />
            </Box>
            
            {recommendations.map((rec, index) => (
              <Alert 
                key={index}
                severity={rec.type} 
                sx={{ 
                  mb: 2,
                  borderRadius: 3,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '& .MuiAlert-icon': {
                    fontSize: 28
                  }
                }}
                action={
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => handleRecommendationAction(rec.actionType, rec)}
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2,
                      borderColor: 'currentColor',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        transform: 'scale(1.05)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                  >
                    {rec.action}
                  </Button>
                }
              >
                <AlertTitle sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem'
                }}>
                  {rec.title}
                  {rec.priority === 'high' && (
                    <Chip 
                      label={t('home.priority')} 
                      size="small" 
                      sx={{ 
                        ml: 2, 
                        height: 24,
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        color: 'white',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)'
                      }} 
                    />
                  )}
                  {rec.priority === 'medium' && (
                    <Chip 
                      label={t('home.important')} 
                      size="small" 
                      sx={{ 
                        ml: 2, 
                        height: 24,
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        color: 'white',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
                      }} 
                    />
                  )}
                </AlertTitle>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                  {rec.message}
                </Typography>
                
                {/* Afficher le plan suggéré s'il existe */}
                {rec.suggestedPlan && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      fontWeight: 600,
                      color: 'primary.main'
                    }}>
                      💡 {t('ai.suggestedPlan')} : {rec.suggestedPlan.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                      {rec.suggestedPlan.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`${t('ai.savings')}: ${rec.suggestedPlan.savings || 0}${t('ai.perMonth')}`}
                        size="small" 
                        sx={{
                          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                        }}
                      />
                      <Chip 
                        label={`${t('ai.effort')}: ${rec.suggestedPlan.effort || t('ai.lowEffort')}`}
                        size="small" 
                        sx={{
                          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)'
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Alert>
            ))}
          </Paper>
        )}

        {/* Message pour les utilisateurs gratuits - Recommandations IA */}
        {!isFeatureAvailable('aiAnalysis') && (
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(33, 150, 243, 0.2)',
            boxShadow: '0 8px 32px rgba(33, 150, 243, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                mr: 2,
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }}>
                <Lightbulb sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {t('home.upgradeForAI')}
              </Typography>
              <Chip 
                label={t('home.premium')} 
                size="small" 
                sx={{ 
                  ml: 2,
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                }}
              />
            </Box>
            <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
              {t('home.aiFeaturesDescription')}
            </Typography>
            <Button 
              variant="contained" 
              sx={{
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)',
                }
              }}
              onClick={() => navigate('/subscription')}
              startIcon={<Star />}
            >
              {t('home.upgradeNow')}
            </Button>
          </Paper>
        )}

        {/* Analyse détaillée par catégorie - AMÉLIORÉE */}
        {isFeatureAvailable('basicAnalytics') && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Analytics sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h6">
                {t('home.categoryAnalysis')}
              </Typography>
              <Chip 
                label={t('home.intelligent')} 
                size="small" 
                color="secondary" 
                variant="outlined"
                sx={{ ml: 1 }}
              />
              <Chip 
                label={`${categoryForecastAnalysis.length} ${t('home.categories')}`}
                size="small" 
                color="info" 
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Box>
            
            {categoryForecastAnalysis.length > 0 ? (
              <Grid container spacing={2}>
                {categoryForecastAnalysis.map((cat, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        borderColor: cat.isImportant ? `${cat.statusColor}.main` : 'grey.300',
                        borderWidth: cat.isImportant ? 2 : 1,
                        position: 'relative',
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                      {cat.isImportant && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: -8, 
                          right: 8,
                          zIndex: 1
                        }}>
                          <Chip 
                            label={t('home.important')} 
                            size="small" 
                            color={cat.statusColor}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      )}
                      
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          {cat.category}
                          <Chip 
                            label={cat.status === 'augmentation' ? '📈' : cat.status === 'diminution' ? '📉' : '➡️'}
                            size="small" 
                            color={cat.statusColor}
                            sx={{ ml: 1, height: 20 }}
                          />
                        </Typography>
                        
                        {/* Montant actuel */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('home.thisMonth')}:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {(cat.current || 0).toLocaleString()}€
                          </Typography>
                        </Box>
                        
                        {/* Pourcentage du budget */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('home.budgetPercentage')}:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color={(cat.budgetPercentage || 0) > 30 ? 'error.main' : 'text.primary'}>
                            {Math.round(cat.budgetPercentage || 0)}%
                          </Typography>
                        </Box>
                        
                        {/* Prévision */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('home.forecast')}:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="warning.main">
                            {(cat.forecast || 0).toLocaleString()}€
                          </Typography>
                        </Box>
                        
                        {/* Changement prévu */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Changement:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color={cat.trend > 0 ? 'error.main' : 'success.main'}>
                            {cat.trend > 0 ? '+' : ''}{(cat.trend || 0).toLocaleString()}€
                          </Typography>
                        </Box>
                        
                        {/* Barre de progression */}
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(cat.budgetPercentage || 0, 100)} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': { 
                              bgcolor: (cat.budgetPercentage || 0) > 30 ? 'error.main' : 'success.main',
                              borderRadius: 4
                            }
                          }} 
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  {t('home.noCategoryData')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.addExpensesToSeeAnalysis')}
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Message pour les utilisateurs gratuits - Analytics */}
        {!isFeatureAvailable('basicAnalytics') && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'secondary.light' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Analytics sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h6">
                {t('home.upgradeForAnalytics')}
              </Typography>
              <Chip 
                label={t('home.premium')} 
                size="small" 
                color="secondary" 
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t('home.analyticsFeaturesDescription')}
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => navigate('/subscription')}
              startIcon={<Analytics />}
            >
              {t('home.upgradeNow')}
            </Button>
          </Paper>
        )}

        {/* Transactions récentes avec design moderne */}
        <Paper sx={{ 
          p: 3,
          background: 'rgba(255,255,255,0.95)',
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {t('home.recentTransactions')}
            </Typography>
            <Button
              component={RouterLink}
              to="/history"
              size="small"
              endIcon={<MoreVert />}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                }
              }}
            >
              {t('home.seeAll')}
            </Button>
          </Box>
          
          <List sx={{ p: 0 }}>
            {recentTransactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <ListItem sx={{ 
                  p: 2,
                  borderRadius: 2,
                  mb: 1,
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.8)',
                    transform: 'translateX(8px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }
                }}>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: transaction.type === 'income' ? 'success.main' : 'error.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      width: 48,
                      height: 48
                    }}>
                      {transaction.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {transaction.category}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {transaction.date}
                      </Typography>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                      variant="h6" 
                      color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                      sx={{ 
                        fontWeight: 900,
                        fontSize: '1.2rem'
                      }}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{(transaction.amount || 0).toLocaleString()}€
                    </Typography>
                    <Chip 
                      label={transaction.type === 'income' ? t('home.income') : t('home.expense')} 
                      size="small" 
                      sx={{
                        background: transaction.type === 'income' 
                          ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                          : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        color: 'white',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    />
                  </Box>
                </ListItem>
                {index < recentTransactions.length - 1 && (
                  <Divider sx={{ 
                    my: 1,
                    opacity: 0.3,
                    borderColor: 'rgba(0,0,0,0.1)'
                  }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default Home; 