import React, { useState, useMemo, useEffect } from 'react';
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
  Button,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AccountBalance, 
  Savings,
  Refresh,
  Info,
  Star,
  Diamond,
  CardMembership,
  ExpandMore,
  AttachMoney,
  Category,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  TrendingFlat,
  Warning,
  CheckCircle,
  Error,
  Notifications,
  Settings,
  FilterList,
  CalendarToday,
  Euro,
  Percent
} from '@mui/icons-material';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip
} from 'chart.js';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Composants optimisés
import ErrorBoundary from '../components/optimized/ErrorBoundary';
import LoadingSpinner from '../components/optimized/LoadingSpinner';

ChartJS.register(
  ArcElement, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip
);

const AnalyticsOptimized = () => {
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
    activeAccount,
    getCurrentPlan,
    isFeatureAvailable,
    isLoading,
    error,
    serverConnected,
    isAuthenticated
  } = useStore();
  
  const [timeFilter, setTimeFilter] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Index du mois courant
  const idx = months.length - 1;

  // Filtrer les données par compte actif
  const filteredIncomeTransactions = incomeTransactions.filter(t => !activeAccount || t.accountId === activeAccount?.id);
  const filteredExpenses = expenses.filter(e => !activeAccount || e.accountId === activeAccount?.id);
  const filteredSavings = savings.filter(s => !activeAccount || s.accountId === activeAccount?.id);

  // Calculer les revenus du mois courant
  const currentMonthIncomeTransactions = filteredIncomeTransactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const currentMonth = new Date();
      return transactionDate.getMonth() === currentMonth.getMonth() && 
             transactionDate.getFullYear() === currentMonth.getFullYear();
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const currentRevenue = currentMonthIncomeTransactions;

  // Calculer les dépenses du mois courant
  const currentMonthExpenses = filteredExpenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      const currentMonth = new Date();
      return expenseDate.getMonth() === currentMonth.getMonth() && 
             expenseDate.getFullYear() === currentMonth.getFullYear();
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalExpenses = currentMonthExpenses;

  // Calculer les économies
  const currentSavings = currentRevenue - totalExpenses;
  const savingsRate = currentRevenue > 0 ? ((currentSavings / currentRevenue) * 100).toFixed(1) : 0;
  const expenseRate = currentRevenue > 0 ? ((totalExpenses / currentRevenue) * 100).toFixed(1) : 0;

  // Données pour les graphiques
  const chartData = useMemo(() => {
    // Données des 6 derniers mois
    const last6Months = months.slice(-6);
    const last6MonthsData = last6Months.map((month, index) => {
      const monthExpenses = filteredExpenses
        .filter(e => {
          const expenseDate = new Date(e.date);
          const targetDate = new Date();
          targetDate.setMonth(targetDate.getMonth() - (5 - index));
          return expenseDate.getMonth() === targetDate.getMonth() && 
                 expenseDate.getFullYear() === targetDate.getFullYear();
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const monthIncome = filteredIncomeTransactions
        .filter(t => {
          const incomeDate = new Date(t.date);
          const targetDate = new Date();
          targetDate.setMonth(targetDate.getMonth() - (5 - index));
          return incomeDate.getMonth() === targetDate.getMonth() && 
                 incomeDate.getFullYear() === targetDate.getFullYear();
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        month,
        expenses: monthExpenses,
        income: monthIncome,
        savings: monthIncome - monthExpenses
      };
    });

    // Répartition des dépenses par catégorie
    const categoryData = categories.reduce((acc, category) => {
      const categoryExpenses = filteredExpenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      
      if (categoryExpenses > 0) {
        acc[category] = categoryExpenses;
      }
      return acc;
    }, {});

    const colors = ['#FF6B6B', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B', '#795548', '#E91E63'];

    return {
      line: {
        labels: last6MonthsData.map(d => d.month),
        datasets: [
          {
            label: 'Revenus',
            data: last6MonthsData.map(d => d.income),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Dépenses',
            data: last6MonthsData.map(d => d.expenses),
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Économies',
            data: last6MonthsData.map(d => d.savings),
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      pie: {
        labels: Object.keys(categoryData),
        datasets: [{
          data: Object.values(categoryData),
          backgroundColor: colors.slice(0, Object.keys(categoryData).length),
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.8)'
        }]
      },
      bar: {
        labels: Object.keys(categoryData),
        datasets: [{
          label: 'Dépenses par catégorie',
          data: Object.values(categoryData),
          backgroundColor: colors.slice(0, Object.keys(categoryData).length),
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.8)'
        }]
      }
    };
  }, [months, categories, filteredExpenses, filteredIncomeTransactions]);

  // Insights et recommandations
  const insights = useMemo(() => {
    const insightsList = [];

    // Analyse des dépenses
    if (expenseRate > 90) {
      insightsList.push({
        type: 'warning',
        icon: <Warning />,
        title: 'Dépenses élevées',
        message: `Vous dépensez ${expenseRate}% de vos revenus. Considérez réduire vos dépenses.`,
        color: '#FF9800'
      });
    } else if (expenseRate < 70) {
      insightsList.push({
        type: 'success',
        icon: <CheckCircle />,
        title: 'Gestion excellente',
        message: `Vous dépensez seulement ${expenseRate}% de vos revenus. Excellent contrôle !`,
        color: '#4CAF50'
      });
    }

    // Analyse des économies
    if (savingsRate < 10) {
      insightsList.push({
        type: 'warning',
        icon: <Savings />,
        title: 'Économies faibles',
        message: `Vous épargnez seulement ${savingsRate}%. Augmentez vos économies.`,
        color: '#FF9800'
      });
    } else if (savingsRate > 30) {
      insightsList.push({
        type: 'success',
        icon: <Star />,
        title: 'Épargne exemplaire',
        message: `Vous épargnez ${savingsRate}% ! Continuez sur cette voie.`,
        color: '#4CAF50'
      });
    }

    // Analyse des tendances
    const recentMonths = chartData.line.datasets[0].data.slice(-3);
    const trend = recentMonths[recentMonths.length - 1] - recentMonths[0];
    
    if (trend > 0) {
      insightsList.push({
        type: 'success',
        icon: <TrendingUp />,
        title: 'Tendance positive',
        message: 'Vos revenus augmentent sur les 3 derniers mois.',
        color: '#4CAF50'
      });
    } else if (trend < 0) {
      insightsList.push({
        type: 'warning',
        icon: <TrendingDown />,
        title: 'Tendance négative',
        message: 'Vos revenus diminuent. Analysez les causes.',
        color: '#FF9800'
      });
    }

    return insightsList;
  }, [expenseRate, savingsRate, chartData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getSubscriptionIcon = () => {
    const plan = getCurrentPlan();
    switch (plan) {
      case 'FREE': return <CardMembership />;
      case 'PREMIUM': return <Star />;
      case 'PRO': return <Diamond />;
      default: return <CardMembership />;
    }
  };

  const getSubscriptionText = () => {
    const plan = getCurrentPlan();
    switch (plan) {
      case 'FREE': return 'Gratuit';
      case 'PREMIUM': return 'Premium';
      case 'PRO': return 'Pro';
      default: return 'Gratuit';
    }
  };

  const getSubscriptionColor = () => {
    const plan = getCurrentPlan();
    switch (plan) {
      case 'FREE': return '#9E9E9E';
      case 'PREMIUM': return '#FF9800';
      case 'PRO': return '#E91E63';
      default: return '#9E9E9E';
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement des analyses..." />;
  }

  return (
    <ErrorBoundary>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pb: 8
      }}>
        {/* Header */}
        <AppBar position="static" sx={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Analytics
              </Typography>
              {activeAccount && (
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  Compte: {activeAccount.name}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }}
                >
                  <MenuItem value="week">Semaine</MenuItem>
                  <MenuItem value="month">Mois</MenuItem>
                  <MenuItem value="quarter">Trimestre</MenuItem>
                  <MenuItem value="year">Année</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title={`Plan actuel: ${getSubscriptionText()}`}>
                <IconButton
                  onClick={() => navigate('/subscription')}
                  sx={{
                    color: getSubscriptionColor(),
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'scale(1.1)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  {getSubscriptionIcon()}
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Alertes */}
        {!isAuthenticated && (
          <Alert 
            severity="warning" 
            sx={{ m: 2, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)' }}
          >
            Vous n'êtes pas connecté. Mode hors ligne activé.
          </Alert>
        )}
        
        {isAuthenticated && !serverConnected && (
          <Alert 
            severity="info" 
            sx={{ m: 2, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)' }}
          >
            Mode hors ligne. Vos données seront synchronisées lors de la reconnexion.
          </Alert>
        )}

        {/* Statistiques principales */}
        <Box sx={{ m: 2 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                color: 'white',
                animation: mounted ? 'fadeInUp 0.6s ease' : 'none',
                '@keyframes fadeInUp': {
                  '0%': { opacity: 0, transform: 'translateY(20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccountBalance sx={{ mr: 1, color: '#4caf50' }} />
                    <Typography variant="h6" sx={{ 
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>Revenus</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {currentRevenue.toLocaleString()}€
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.8,
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    Ce mois
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                color: 'white',
                animation: mounted ? 'fadeInUp 0.6s ease 0.1s both' : 'none'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingDown sx={{ mr: 1, color: '#f44336' }} />
                    <Typography variant="h6" sx={{ 
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>Dépenses</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {totalExpenses.toLocaleString()}€
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.8,
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    {expenseRate}% des revenus
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                color: 'white',
                animation: mounted ? 'fadeInUp 0.6s ease 0.2s both' : 'none'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Savings sx={{ mr: 1, color: '#4caf50' }} />
                    <Typography variant="h6" sx={{ 
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>Économies</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    color: currentSavings >= 0 ? 'white' : '#f44336',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {currentSavings.toLocaleString()}€
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.8,
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    {savingsRate}% des revenus
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                color: 'white',
                animation: mounted ? 'fadeInUp 0.6s ease 0.3s both' : 'none'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Percent sx={{ mr: 1, color: '#2196f3' }} />
                    <Typography variant="h6" sx={{ 
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>Taux d'épargne</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    color: savingsRate >= 20 ? '#4caf50' : savingsRate >= 10 ? '#ff9800' : '#f44336',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {savingsRate}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(savingsRate, 100)} 
                    sx={{ 
                      mt: 1,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: savingsRate >= 20 ? '#4caf50' : savingsRate >= 10 ? '#ff9800' : '#f44336',
                        borderRadius: 3
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Onglets */}
          <AppBar position="static" sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(20px)',
            boxShadow: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            mb: 2
          }}>
            <Toolbar sx={{ px: 0 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    minWidth: 'auto',
                    px: 2
                  },
                  '& .Mui-selected': {
                    color: 'white'
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'white',
                    height: 3
                  }
                }}
              >
                <Tab 
                  label="Vue d'ensemble" 
                  icon={<Timeline />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Répartition" 
                  icon={<PieChart />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Tendances" 
                  icon={<ShowChart />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Insights" 
                  icon={<Info />} 
                  iconPosition="start"
                />
              </Tabs>
            </Toolbar>
          </AppBar>

          {/* Contenu des onglets */}
          <Box sx={{ animation: mounted ? 'fadeIn 0.5s ease' : 'none' }}>
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Paper sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>
                      Évolution sur 6 mois
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <Line 
                        data={chartData.line}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              labels: {
                                color: 'white',
                                padding: 20
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: 'white'
                              },
                              grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                              }
                            },
                            x: {
                              ticks: {
                                color: 'white'
                              },
                              grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Paper sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>
                      Répartition des dépenses
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <Doughnut 
                        data={chartData.pie}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: 'white',
                                padding: 20
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>
                      Dépenses par catégorie
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <Bar 
                        data={chartData.bar}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: 'white'
                              },
                              grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                              }
                            },
                            x: {
                              ticks: {
                                color: 'white'
                              },
                              grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>
                      Top des catégories
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {Object.entries(chartData.pie.datasets[0].data)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([category, amount], index) => (
                          <ListItem key={category} sx={{ 
                            p: 1, 
                            mb: 1, 
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}>
                            <ListItemAvatar>
                              <Avatar sx={{ 
                                bgcolor: chartData.pie.datasets[0].backgroundColor[index],
                                width: 32,
                                height: 32
                              }}>
                                {index + 1}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography sx={{ color: 'white', fontWeight: 600 }}>
                                  {category}
                                </Typography>
                              }
                              secondary={
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                  {amount.toLocaleString()}€
                                </Typography>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Chip 
                                label={`${((amount / Object.values(chartData.pie.datasets[0].data).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                                  color: 'white',
                                  border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              <Paper sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 600 }}>
                  Analyse des tendances
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      p: 2
                    }}>
                      <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                        Tendance des revenus
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUp sx={{ color: '#4caf50', mr: 1 }} />
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          +{((chartData.line.datasets[0].data[chartData.line.datasets[0].data.length - 1] - chartData.line.datasets[0].data[0]) / chartData.line.datasets[0].data[0] * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={70} 
                        sx={{ 
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#4caf50',
                            borderRadius: 3
                          }
                        }}
                      />
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      p: 2
                    }}>
                      <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                        Tendance des dépenses
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingDown sx={{ color: '#f44336', mr: 1 }} />
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          -{((chartData.line.datasets[1].data[0] - chartData.line.datasets[1].data[chartData.line.datasets[1].data.length - 1]) / chartData.line.datasets[1].data[0] * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={30} 
                        sx={{ 
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#f44336',
                            borderRadius: 3
                          }
                        }}
                      />
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {activeTab === 3 && (
              <Paper sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 600 }}>
                  Insights et recommandations
                </Typography>
                <Grid container spacing={2}>
                  {insights.map((insight, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${insight.color}40`,
                        p: 2,
                        animation: mounted ? `fadeInUp 0.6s ease ${index * 0.1}s both` : 'none'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ 
                            color: insight.color, 
                            mr: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {insight.icon}
                          </Box>
                          <Typography variant="subtitle1" sx={{ 
                            color: 'white', 
                            fontWeight: 600 
                          }}>
                            {insight.title}
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.875rem'
                        }}>
                          {insight.message}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                  {insights.length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        <CheckCircle sx={{ fontSize: 48, mb: 2, color: '#4caf50' }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Excellente gestion !
                        </Typography>
                        <Typography>
                          Vos finances sont en bon état. Continuez sur cette voie !
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default AnalyticsOptimized; 