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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Alert,
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
  CalendarToday,
  Speed,
  Assessment,
  PieChart,
  BarChart,
  ShowChart,
  Timeline,
  CompareArrows,
  TrendingFlat,
  Warning,
  CheckCircle,
  Error,
  Lightbulb,
  Psychology,
  AutoGraph,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { Pie, Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
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
  RadialLinearScale,
  Filler
} from 'chart.js';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  ArcElement, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  Title,
  RadialLinearScale,
  Filler
);

const AnalyticsEnhanced = () => {
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
    isFeatureAvailable
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

  // Filtrer les données par compte actif
  const filteredIncomeTransactions = incomeTransactions.filter(t => !activeAccount || t.accountId === activeAccount?.id);
  const filteredExpenses = expenses.filter(e => !activeAccount || e.accountId === activeAccount?.id);
  const filteredSavings = savings.filter(s => !activeAccount || s.accountId === activeAccount?.id);

  // Calculs avancés pour les analyses
  const analyticsData = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Revenus du mois courant
    const currentMonthIncome = filteredIncomeTransactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Dépenses du mois courant
    const currentMonthExpenses = filteredExpenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    // Économies du mois
    const currentSavings = currentMonthIncome - currentMonthExpenses;

    // Taux d'épargne
    const savingsRate = currentMonthIncome > 0 ? ((currentSavings / currentMonthIncome) * 100) : 0;
    const expenseRate = currentMonthIncome > 0 ? ((currentMonthExpenses / currentMonthIncome) * 100) : 0;

    // Données des 12 derniers mois
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const targetDate = new Date(currentYear, currentMonth - (11 - i), 1);
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();

      const monthIncome = filteredIncomeTransactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === targetMonth && 
                 transactionDate.getFullYear() === targetYear;
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const monthExpenses = filteredExpenses
        .filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate.getMonth() === targetMonth && 
                 expenseDate.getFullYear() === targetYear;
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      return {
        month: targetDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthIncome - monthExpenses,
        savingsRate: monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome * 100) : 0
      };
    });

    // Analyse par catégorie
    const categoryAnalysis = categories.map(cat => {
      const categoryExpenses = filteredExpenses
        .filter(e => {
          const expenseDate = new Date(e.date);
          return e.category === cat && 
                 expenseDate.getMonth() === currentMonth && 
                 expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const categoryTransactions = filteredExpenses
        .filter(e => {
          const expenseDate = new Date(e.date);
          return e.category === cat && 
                 expenseDate.getMonth() === currentMonth && 
                 expenseDate.getFullYear() === currentYear;
        }).length;

      return {
        category: cat,
        amount: categoryExpenses,
        transactions: categoryTransactions,
        percentage: currentMonthExpenses > 0 ? (categoryExpenses / currentMonthExpenses * 100) : 0
      };
    }).filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    // Tendances et insights
    const trends = {
      incomeTrend: monthlyData.slice(-3).reduce((sum, data) => sum + data.income, 0) / 3,
      expenseTrend: monthlyData.slice(-3).reduce((sum, data) => sum + data.expenses, 0) / 3,
      savingsTrend: monthlyData.slice(-3).reduce((sum, data) => sum + data.savings, 0) / 3
    };

    // Insights et recommandations
    const insights = [];
    
    if (savingsRate < 20) {
      insights.push({
        type: 'warning',
        title: 'Taux d\'épargne faible',
        message: 'Votre taux d\'épargne est inférieur à 20%. Considérez réduire vos dépenses non essentielles.',
        icon: Warning
      });
    }

    if (expenseRate > 80) {
      insights.push({
        type: 'error',
        title: 'Dépenses élevées',
        message: 'Vos dépenses représentent plus de 80% de vos revenus. Analysez vos dépenses par catégorie.',
        icon: Error
      });
    }

    if (categoryAnalysis.length > 0 && categoryAnalysis[0].percentage > 40) {
      insights.push({
        type: 'info',
        title: 'Concentration des dépenses',
        message: `${categoryAnalysis[0].category} représente ${categoryAnalysis[0].percentage.toFixed(1)}% de vos dépenses.`,
        icon: Info
      });
    }

    if (savingsRate > 30) {
      insights.push({
        type: 'success',
        title: 'Excellent taux d\'épargne',
        message: 'Félicitations ! Votre taux d\'épargne est excellent. Continuez sur cette voie !',
        icon: CheckCircle
      });
    }

    return {
      current: {
        income: currentMonthIncome,
        expenses: currentMonthExpenses,
        savings: currentSavings,
        savingsRate,
        expenseRate
      },
      monthly: monthlyData,
      categories: categoryAnalysis,
      trends,
      insights
    };
  }, [filteredIncomeTransactions, filteredExpenses, categories, activeAccount]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
      '#FF9F40', '#2196F3', '#F44336', '#9C27B0', '#607D8B'
    ];

    // Graphique en camembert des dépenses par catégorie
    const pieData = {
      labels: analyticsData.categories.map(item => item.category),
      datasets: [{
        data: analyticsData.categories.map(item => item.amount),
        backgroundColor: colors.slice(0, analyticsData.categories.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    // Graphique en barres de l'évolution mensuelle
    const barData = {
      labels: analyticsData.monthly.map(item => item.month),
      datasets: [
        {
          label: 'Revenus',
          data: analyticsData.monthly.map(item => item.income),
          backgroundColor: 'rgba(76, 175, 80, 0.8)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        },
        {
          label: 'Dépenses',
          data: analyticsData.monthly.map(item => item.expenses),
          backgroundColor: 'rgba(244, 67, 54, 0.8)',
          borderColor: 'rgba(244, 67, 54, 1)',
          borderWidth: 1
        },
        {
          label: 'Économies',
          data: analyticsData.monthly.map(item => item.savings),
          backgroundColor: 'rgba(33, 150, 243, 0.8)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 1
        }
      ]
    };

    // Graphique linéaire du taux d'épargne
    const lineData = {
      labels: analyticsData.monthly.map(item => item.month),
      datasets: [{
        label: 'Taux d\'épargne (%)',
        data: analyticsData.monthly.map(item => item.savingsRate),
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    // Graphique radar des performances
    const radarData = {
      labels: ['Revenus', 'Économies', 'Taux d\'épargne', 'Gestion des dépenses', 'Stabilité'],
      datasets: [{
        label: 'Performance',
        data: [
          Math.min(analyticsData.current.income / 5000 * 100, 100), // Normalisé sur 5000€
          Math.min(analyticsData.current.savings / 1000 * 100, 100), // Normalisé sur 1000€
          analyticsData.current.savingsRate,
          Math.max(100 - analyticsData.current.expenseRate, 0),
          100 - Math.abs(analyticsData.trends.savingsTrend - analyticsData.current.savings)
        ],
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(76, 175, 80, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(76, 175, 80, 1)'
      }]
    };

    return { pieData, barData, lineData, radarData };
  }, [analyticsData]);

  // Options des graphiques
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
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

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          padding: 20
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'white',
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'white'
        }
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      padding: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules animées */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '@keyframes float': {
                '0%': {
                  transform: 'translateY(0px) rotate(0deg)',
                  opacity: 0
                },
                '10%': {
                  opacity: 1
                },
                '90%': {
                  opacity: 1
                },
                '100%': {
                  transform: 'translateY(-100vh) rotate(360deg)',
                  opacity: 0
                }
              }
            }}
          />
        ))}
      </Box>

      <Box sx={{ p: 0, pb: 10, position: 'relative', zIndex: 1 }}>
        {/* Vérifier l'accès aux analytics */}
        {!isFeatureAvailable('basicAnalytics') ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <AnalyticsIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.8)', mb: 2 }} />
            <Typography variant="h4" sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Mise à niveau requise
            </Typography>
            <Typography variant="body1" sx={{ 
              mb: 3, 
              maxWidth: 500, 
              mx: 'auto',
              color: 'rgba(255, 255, 255, 0.8)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              Accédez aux analyses détaillées, graphiques interactifs et insights personnalisés pour mieux comprendre vos finances.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/subscription')}
              startIcon={<AnalyticsIcon />}
              sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)'
                }
              }}
            >
              Passer à Premium
            </Button>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              p: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  Analyses Avancées
                </Typography>
                {activeAccount && (
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
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
                <Tooltip title="Actualiser">
                  <IconButton sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Onglets */}
            <Paper sx={{ 
              mb: 3,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: 600,
                    textTransform: 'none'
                  },
                  '& .Mui-selected': {
                    color: '#4caf50'
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#4caf50'
                  }
                }}
              >
                <Tab label="Vue d'ensemble" icon={<Assessment />} iconPosition="start" />
                <Tab label="Graphiques" icon={<BarChart />} iconPosition="start" />
                <Tab label="Insights" icon={<Lightbulb />} iconPosition="start" />
                <Tab label="Tendances" icon={<TrendingUp />} iconPosition="start" />
              </Tabs>
            </Paper>

            {/* Contenu des onglets */}
            {activeTab === 0 && (
              <Box sx={{
                animation: mounted ? 'fadeIn 0.5s ease' : 'none',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 }
                }
              }}>
                {/* KPIs Principaux */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      color: 'white'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccountBalance sx={{ mr: 1, color: '#4caf50' }} />
                          <Typography variant="h6" sx={{ color: 'white' }}>Revenus</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                          {analyticsData.current.income.toLocaleString()}€
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: 'rgba(255, 255, 255, 0.8)' }}>
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
                      color: 'white'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TrendingDown sx={{ mr: 1, color: '#f44336' }} />
                          <Typography variant="h6" sx={{ color: 'white' }}>Dépenses</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                          {analyticsData.current.expenses.toLocaleString()}€
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: 'rgba(255, 255, 255, 0.8)' }}>
                          {analyticsData.current.expenseRate.toFixed(1)}% des revenus
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
                      color: 'white'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Savings sx={{ mr: 1, color: '#4caf50' }} />
                          <Typography variant="h6" sx={{ color: 'white' }}>Économies</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                          {analyticsData.current.savings.toLocaleString()}€
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: 'rgba(255, 255, 255, 0.8)' }}>
                          Taux: {analyticsData.current.savingsRate.toFixed(1)}%
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
                      color: 'white'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Speed sx={{ mr: 1, color: '#ff9800' }} />
                          <Typography variant="h6" sx={{ color: 'white' }}>Performance</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                          {analyticsData.current.savingsRate.toFixed(1)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(analyticsData.current.savingsRate, 100)} 
                          sx={{ 
                            mt: 1, 
                            background: 'rgba(255,255,255,0.3)', 
                            '& .MuiLinearProgress-bar': { 
                              background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)'
                            } 
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Graphiques principaux */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                        Répartition des Dépenses
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Pie data={chartData.pieData} options={chartOptions} />
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                        Évolution sur 12 Mois
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar data={chartData.barData} options={chartOptions} />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{
                animation: mounted ? 'fadeIn 0.5s ease' : 'none',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 }
                }
              }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                        Taux d'Épargne Mensuel
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Line data={chartData.lineData} options={chartOptions} />
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                        Performance Globale
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Radar data={chartData.radarData} options={radarOptions} />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{
                animation: mounted ? 'fadeIn 0.5s ease' : 'none',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 }
                }
              }}>
                {/* Insights et recommandations */}
                <Paper sx={{ 
                  p: 2,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Insights et Recommandations
                  </Typography>
                  
                  {analyticsData.insights.length === 0 ? (
                    <Alert severity="success" sx={{ background: 'rgba(76, 175, 80, 0.1)', color: 'white' }}>
                      Excellent ! Vos finances sont en bonne santé. Continuez sur cette voie !
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {analyticsData.insights.map((insight, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Alert 
                            severity={insight.type} 
                            icon={<insight.icon />}
                            sx={{ 
                              background: `rgba(${insight.type === 'success' ? '76, 175, 80' : 
                                                   insight.type === 'warning' ? '255, 193, 7' : 
                                                   insight.type === 'error' ? '244, 67, 54' : 
                                                   '33, 150, 243'}, 0.1)`, 
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              {insight.title}
                            </Typography>
                            <Typography variant="body2">
                              {insight.message}
                            </Typography>
                          </Alert>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>

                {/* Détails par catégorie */}
                <Paper sx={{ 
                  p: 2, 
                  mt: 3,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Analyse par Catégorie
                  </Typography>
                  
                  {analyticsData.categories.length === 0 ? (
                    <Typography variant="body2" sx={{ 
                      textAlign: 'center',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      Aucune dépense enregistrée ce mois-ci
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {analyticsData.categories.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={item.category}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            p: 2,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 1,
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)'
                          }}>
                            <Box>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {item.category}
                              </Typography>
                              <Typography variant="h6" sx={{ color: 'white' }}>
                                {item.amount.toLocaleString()}€
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {item.transactions} transaction{item.transactions > 1 ? 's' : ''}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${item.percentage.toFixed(1)}%`}
                              size="small"
                              sx={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                              }}
                              variant="outlined"
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Box>
            )}

            {activeTab === 3 && (
              <Box sx={{
                animation: mounted ? 'fadeIn 0.5s ease' : 'none',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 }
                }
              }}>
                {/* Tendances détaillées */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                        Tendances des 3 Derniers Mois
                      </Typography>
                      
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <TrendingUp sx={{ color: '#4caf50' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Revenus moyens" 
                            secondary={`${analyticsData.trends.incomeTrend.toLocaleString()}€`}
                            sx={{ 
                              '& .MuiListItemText-primary': { color: 'white' },
                              '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                            }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TrendingDown sx={{ color: '#f44336' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Dépenses moyennes" 
                            secondary={`${analyticsData.trends.expenseTrend.toLocaleString()}€`}
                            sx={{ 
                              '& .MuiListItemText-primary': { color: 'white' },
                              '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                            }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Savings sx={{ color: '#4caf50' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Économies moyennes" 
                            secondary={`${analyticsData.trends.savingsTrend.toLocaleString()}€`}
                            sx={{ 
                              '& .MuiListItemText-primary': { color: 'white' },
                              '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                            }}
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                        Comparaison Mensuelle
                      </Typography>
                      
                      <Box sx={{ height: 300 }}>
                        <Line data={chartData.lineData} options={chartOptions} />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsEnhanced; 