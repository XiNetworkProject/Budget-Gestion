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
  Fade,
  Zoom,
  Button
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
  CardMembership
} from '@mui/icons-material';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  Title
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
  Title
);

const Analytics = () => {
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
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Index du mois courant
  const idx = months.length - 1;

  // Filtrer les données par compte actif
  const filteredIncomeTransactions = incomeTransactions.filter(t => !activeAccount || t.accountId === activeAccount?.id);
  const filteredExpenses = expenses.filter(e => !activeAccount || e.accountId === activeAccount?.id);
  const filteredSavings = savings.filter(s => !activeAccount || s.accountId === activeAccount?.id);

  // Calculer les revenus du mois courant - SEULEMENT LES TRANSACTIONS INDIVIDUELLES
  const currentMonthIncomeTransactions = filteredIncomeTransactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const currentMonth = new Date();
      return transactionDate.getMonth() === currentMonth.getMonth() && 
             transactionDate.getFullYear() === currentMonth.getFullYear();
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const currentRevenue = currentMonthIncomeTransactions;

  // Calculer les dépenses du mois courant - SEULEMENT LES TRANSACTIONS INDIVIDUELLES
  const currentMonthExpenses = filteredExpenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      const currentMonth = new Date();
      return expenseDate.getMonth() === currentMonth.getMonth() && 
             expenseDate.getFullYear() === currentMonth.getFullYear();
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalExpenses = currentMonthExpenses;

  // Calculer les économies (revenus - dépenses)
  const currentSavings = currentRevenue - totalExpenses;

  // Calculer les taux
  const savingsRate = currentRevenue > 0 ? ((currentSavings / currentRevenue) * 100).toFixed(1) : 0;
  const expenseRate = currentRevenue > 0 ? ((totalExpenses / currentRevenue) * 100).toFixed(1) : 0;

  // Revenus par mois (6 derniers mois) - SEULEMENT LES TRANSACTIONS INDIVIDUELLES
  const revenuesByMonth = months.slice(-6).map((_, i) => {
    const monthIncomeTransactions = filteredIncomeTransactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - i));
        return transactionDate.getMonth() === monthDate.getMonth() && 
               transactionDate.getFullYear() === monthDate.getFullYear();
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    return monthIncomeTransactions;
  });

  // Dépenses par mois (6 derniers mois) - SEULEMENT LES TRANSACTIONS INDIVIDUELLES
  const expensesByMonth = months.slice(-6).map((_, i) => {
    const monthExpenses = filteredExpenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - i));
        return expenseDate.getMonth() === monthDate.getMonth() && 
               expenseDate.getFullYear() === monthDate.getFullYear();
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    return monthExpenses;
  });

  // Économies par mois (revenus - dépenses)
  const savingsByMonth = revenuesByMonth.map((revenue, i) => revenue - expensesByMonth[i]);

  // Catégories de dépenses pour le mois courant - SEULEMENT LES TRANSACTIONS INDIVIDUELLES
  const expenseByCategory = categories.map(cat => {
    const categoryExpenses = filteredExpenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        const currentMonth = new Date();
        return e.category === cat && 
               expenseDate.getMonth() === currentMonth.getMonth() && 
               expenseDate.getFullYear() === currentMonth.getFullYear();
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    return {
      category: cat,
      amount: categoryExpenses
    };
  }).filter(item => item.amount > 0);

  // Graphiques
  const pieData = {
    labels: expenseByCategory.map(item => item.category),
    datasets: [{
      data: expenseByCategory.map(item => item.amount),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#2196F3', '#F44336'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // Générer les labels des 6 derniers mois avec les bonnes dates
  const getLast6MonthsLabels = () => {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const labels = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear();
      labels.push(`${monthName} ${year}`);
    }
    
    return labels;
  };

  const last6MonthsLabels = getLast6MonthsLabels();

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

  const barData = {
    labels: last6MonthsLabels,
    datasets: [{
      label: 'Économies',
      data: savingsByMonth,
      backgroundColor: 'rgba(75, 192, 192, 0.8)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const lineData = {
    labels: last6MonthsLabels,
    datasets: [
      {
        label: 'Revenus',
        data: revenuesByMonth,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
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

      <Box sx={{ p: 2, pb: 10, position: 'relative', zIndex: 1 }}>
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
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              Plan actuel: {getSubscriptionText()}
            </Typography>
          </Box>
        ) : (
          <>
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
                  Analyses et Statistiques
                </Typography>
                {activeAccount && (
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }} component="span">
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
                <Tooltip title="Actualiser">
                  <IconButton sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* KPIs glassmorphism */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Fade in timeout={500}>
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
                      }} component="span">
                        Ce mois
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Fade in timeout={700}>
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
                      }} component="span">
                        {expenseRate}% des revenus
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Fade in timeout={900}>
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
                        <Typography variant="h6" sx={{ 
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>Économies</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {currentSavings.toLocaleString()}€
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        opacity: 0.8,
                        color: 'rgba(255, 255, 255, 0.8)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }} component="span">
                        Taux: {savingsRate}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Fade in timeout={1100}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUp sx={{ mr: 1, color: '#ff9800' }} />
                        <Typography variant="h6" sx={{ 
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>{t('analytics.savingsRate')}</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {savingsRate}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseFloat(savingsRate)} 
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
                </Fade>
              </Grid>
            </Grid>

            {/* Graphiques glassmorphism */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Zoom in timeout={600}>
                  <Paper sx={{ 
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        flexGrow: 1,
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {t('analytics.expenseDistribution')}
                      </Typography>
                      <Tooltip title={t('analytics.expenseDistributionTooltip')}>
                        <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
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
                  <Paper sx={{ 
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        flexGrow: 1,
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {t('analytics.savingsEvolution')}
                      </Typography>
                      <Tooltip title={t('analytics.savingsEvolutionTooltip')}>
                        <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
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
                  <Paper sx={{ 
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        flexGrow: 1,
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {t('analytics.revenuesVsExpenses')}
                      </Typography>
                      <Tooltip title={t('analytics.revenuesVsExpensesTooltip')}>
                        <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
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

            {/* Détails par catégorie glassmorphism */}
            <Paper sx={{ 
              p: 2, 
              mt: 3,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {t('analytics.expenseDetails')}
              </Typography>
              {expenseByCategory.length === 0 ? (
                <Typography variant="body2" sx={{ 
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.7)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }} component="span">
                  {t('analytics.noExpenseRecordedThisMonth')}
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {expenseByCategory.map((item, index) => (
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
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }} component="span">
                            {item.category}
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}>
                            {item.amount.toLocaleString()}€
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${totalExpenses > 0 ? ((item.amount / totalExpenses) * 100).toFixed(1) : 0}%`}
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default Analytics; 