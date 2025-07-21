import React, { useState, useEffect, useMemo } from 'react';
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
  Collapse,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
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
  Assignment,
  Star,
  Diamond,
  CardMembership,
  Notifications,
  Refresh,
  Savings,
  MoreVert,
  Info,
  Chat,
  EmojiEvents,
  Spa,
  Dashboard
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

// Import des nouveaux composants optimisés
import { MetricCard, ProgressCard, useMemoizedCalculations } from '../components/optimized/MemoizedComponents';
import { useSmartCache, useCachedCalculation } from '../hooks/useOptimizedCache';
import ZenDashboard from '../components/zen/ZenDashboard';
import AIAssistant from '../components/ai/AIAssistant';
import AchievementSystem from '../components/gamification/AchievementSystem';
import QuickAdd from './QuickAdd';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('classic'); // 'classic', 'zen', 'achievements'
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
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
    tutorialCompleted,
    onboardingCompleted,
    showUpdateDialog,
    checkForUpdates,
    closeUpdateDialog,
    forceShowUpdateDialog,
    resetOnboardingStates,
    forceOnboardingCompleted,
    checkAndFixOnboardingState,
    validateAndCleanDates,
    syncExpensesWithCategories,
    syncIncomesWithTypes,
    addTransaction,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addDebt,
    updateDebt,
    deleteDebt,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setValue,
    addCategory,
    removeCategory,
    addMonth,
    removeMonth,
    setIncome,
    addIncomeType,
    removeIncomeType,
    renameIncomeType,
    setSideByMonth,
    renameCategory,
    logout,
    clearAllData,
    resetToDefaults,
    renameMonth,
    reorderCategories,
    reorderIncomeTypes,
    setCategoryLimit,
    setTutorialCompleted,
    setOnboardingCompleted,
    showTutorial,
    resetTutorial,
    forceShowTutorial,
    clearForceTutorial,
    setUser,
    setLoading,
    setError,
    setToken,
    updateUserProfile,
    updateAppSettings,
    setSelectedMonth: setSelectedMonthAction,
    getCurrentMonthIndex,
    getSelectedMonthIndex,
    hasSpecialAccess,
    getCurrentPlan,
    isFeatureAvailable,
    getAILevel,
    hasFullAI,
    hasPartialAI,
    checkUsageLimit,
    updateSubscription,
    cancelSubscription,
    resetSubscription,
    reloadBudgetData,
    fetchSubscriptionFromStripe,
    isSaving,
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    serverConnected,
    subscription,
    subscriptionPlans,
    specialAccessEmails,
    appliedPromoCode,
    promoCodeDiscount
  } = useStore();

  // Utiliser le cache intelligent
  const { getCached, setCached } = useSmartCache();

  // Calculs optimisés avec cache
  const { totals, trends } = useCachedCalculation(
    'home-calculations',
    () => useMemoizedCalculations(data, categories, months),
    [data, categories, months]
  );

  // Calculs pour les métriques principales
  const mainMetrics = useCachedCalculation(
    'main-metrics',
    () => {
      const currentMonthIndex = selectedMonth;
      const currentExpenses = categories.map(cat => data[cat]?.[currentMonthIndex] || 0);
      const totalExpenses = currentExpenses.reduce((sum, val) => sum + val, 0);
      const totalIncome = revenus[currentMonthIndex] || 0;
      const balance = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

      return {
        balance,
        totalExpenses,
        totalIncome,
        savingsRate,
        expenseTrend: trends.total || 0
      };
    },
    [data, categories, revenus, selectedMonth, trends]
  );

  // Actions rapides optimisées
  const quickActions = [
    {
      icon: <Add />,
      name: 'Ajouter Revenu',
      action: () => setShowQuickAdd(true),
      color: 'success'
    },
    {
      icon: <Remove />,
      name: 'Ajouter Dépense',
      action: () => setShowQuickAdd(true),
      color: 'error'
    },
    {
      icon: <Savings />,
      name: 'Objectif Épargne',
      action: () => navigate('/savings'),
      color: 'info'
    },
    {
      icon: <Chat />,
      name: 'Assistant IA',
      action: () => setViewMode('ai'),
      color: 'primary'
    }
  ];

  // Gestion des vues
  const renderView = () => {
    switch (viewMode) {
      case 'zen':
        return <ZenDashboard />;
      case 'achievements':
        return <AchievementSystem />;
      case 'ai':
        return <AIAssistant />;
      default:
        return renderClassicView();
    }
  };

  // Vue classique optimisée
  const renderClassicView = () => (
    <Box sx={{ p: 3 }}>
      {/* Header avec sélecteur de vue */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Tableau de Bord
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'classic' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('classic')}
            startIcon={<Dashboard />}
          >
            Classique
          </Button>
          <Button
            variant={viewMode === 'zen' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('zen')}
            startIcon={<Spa />}
          >
            Zen
          </Button>
          <Button
            variant={viewMode === 'achievements' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('achievements')}
            startIcon={<EmojiEvents />}
          >
            Récompenses
          </Button>
        </Box>
      </Box>

      {/* Métriques principales optimisées */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Solde du Mois"
            value={mainMetrics.balance}
            trend={mainMetrics.expenseTrend}
            color={mainMetrics.balance >= 0 ? 'success.main' : 'error.main'}
            icon={<AccountBalance />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Revenus"
            value={mainMetrics.totalIncome}
            color="primary.main"
            icon={<TrendingUp />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Dépenses"
            value={mainMetrics.totalExpenses}
            color="error.main"
            icon={<TrendingDown />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Taux d'Épargne"
            value={mainMetrics.savingsRate}
            subtitle={`${mainMetrics.savingsRate.toFixed(1)}%`}
            color="info.main"
            icon={<Savings />}
          />
        </Grid>
      </Grid>

      {/* Actions rapides */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Actions Rapides
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                }}
                onClick={action.action}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box sx={{ color: `${action.color}.main`, mb: 1 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="body2">
                    {action.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Graphiques et analyses */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Évolution des Finances
              </Typography>
              {/* Graphique d'évolution */}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Répartition des Dépenses
              </Typography>
              {/* Graphique camembert */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Assistant IA flottant */}
      <AIAssistant />
      
      {/* Contenu principal */}
      {renderView()}
      
      {/* Speed Dial pour les actions rapides */}
      <SpeedDial
        ariaLabel="Actions rapides"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {quickActions.map((action, index) => (
          <SpeedDialAction
            key={index}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
            sx={{ color: `${action.color}.main` }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default Home; 