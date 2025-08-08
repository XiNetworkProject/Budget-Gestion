import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  Category,
  AttachMoney,
  FilterList,
  Refresh,
  Info,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Legend,
  ArcElement,
  Tooltip
} from 'chart.js';

// Composants optimisés
import ErrorBoundary from '../components/optimized/ErrorBoundary';
import LoadingSpinner from '../components/optimized/LoadingSpinner';
import CategoryManager from '../components/optimized/CategoryManager';
import TransactionManager from '../components/optimized/TransactionManager';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Legend,
  ArcElement,
  Tooltip
);

const IncomeOptimized = () => {
  const { 
    incomeTypes, 
    incomeTransactions,
    addIncomeType,
    updateIncomeType,
    removeIncomeType,
    addIncome,
    updateIncome,
    deleteIncome,
    isLoading,
    error,
    serverConnected,
    isAuthenticated,
    activeAccount
  } = useStore();
  
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtrer les transactions par catégorie sélectionnée
  const filteredIncomes = useMemo(() => {
    if (!selectedCategory) return incomeTransactions;
    return incomeTransactions.filter(income => income.category === selectedCategory.name);
  }, [incomeTransactions, selectedCategory]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const total = incomeTransactions.reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const count = incomeTransactions.length;
    const avg = count > 0 ? total / count : 0;
    
    // Grouper par catégorie
    const byCategory = incomeTransactions.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + parseFloat(i.amount);
      return acc;
    }, {});

    return { total, count, avg, byCategory };
  }, [incomeTransactions]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    const categoryData = Object.entries(stats.byCategory).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount).slice(0, 5);

    return {
      doughnut: {
        labels: categoryData.map(d => d.category),
        datasets: [{
          data: categoryData.map(d => d.amount),
          backgroundColor: [
            '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B',
            '#795548', '#FF5722', '#00BCD4', '#8BC34A', '#FFC107'
          ],
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.8)'
        }]
      },
      bar: {
        labels: categoryData.map(d => d.category),
        datasets: [{
          label: t('income.amount'),
          data: categoryData.map(d => d.amount),
          backgroundColor: 'rgba(76, 175, 80, 0.8)',
          borderColor: '#4CAF50',
          borderWidth: 1
        }]
      }
    };
  }, [stats.byCategory, t]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleAddCategory = (categoryData) => {
    const newCategory = {
      id: Date.now().toString(),
      ...categoryData,
      type: 'income'
    };
    addIncomeType(newCategory);
  };

  const handleUpdateCategory = (categoryId, categoryData) => {
    updateIncomeType(categoryId, categoryData);
  };

  const handleDeleteCategory = (categoryId, deleteWithData = false) => {
    removeIncomeType(categoryId, deleteWithData);
    if (selectedCategory?.id === categoryId) {
      setSelectedCategory(null);
    }
  };

  const handleAddIncome = (incomeData) => {
    const newIncome = {
      id: Date.now().toString(),
      ...incomeData,
      type: 'income'
    };
    addIncome(newIncome);
  };

  const handleUpdateIncome = (incomeId, incomeData) => {
    updateIncome(incomeId, incomeData);
  };

  const handleDeleteIncome = (incomeId) => {
    deleteIncome(incomeId);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <LoadingSpinner message={t('income.loading')} variant="elegant" fullScreen />
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
        {/* AppBar */}
        <AppBar position="static" sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <Toolbar>
            <TrendingUp sx={{ mr: 2, color: '#4CAF50' }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'white' }}>
              {t('income.title')}
            </Typography>
            <IconButton color="inherit" onClick={() => window.location.reload()}>
              <Refresh />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Alertes */}
        {!isAuthenticated && (
          <Alert 
            severity="warning" 
            sx={{ 
              m: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {t('income.notConnected')}
          </Alert>
        )}
        
        {isAuthenticated && !serverConnected && (
          <Alert 
            severity="info" 
            sx={{ 
              m: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {t('income.offlineMode')}
          </Alert>
        )}

        {/* Onglets */}
        <AppBar position="static" sx={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
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
                  color: '#4CAF50'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#4CAF50',
                  height: 3
                }
              }}
            >
              <Tab 
                label={t('income.tabs.transactions')} 
                icon={<AttachMoney />} 
                iconPosition="start"
              />
              <Tab 
                label={t('income.tabs.types')} 
                icon={<Category />} 
                iconPosition="start"
              />
              <Tab 
                label={t('income.tabs.analytics')} 
                icon={<TrendingUp />} 
                iconPosition="start"
              />
            </Tabs>
          </Toolbar>
        </AppBar>

        {/* Contenu des tabs */}
        <Box sx={{ m: 2 }}>
          {activeTab === 0 && (
            <Box sx={{
              animation: mounted ? 'fadeIn 0.5s ease' : 'none',
              '@keyframes fadeIn': {
                '0%': { opacity: 0 },
                '100%': { opacity: 1 }
              }
            }}>
              <TransactionManager
                type="income"
                transactions={filteredIncomes}
                categories={incomeTypes}
                onAddTransaction={handleAddIncome}
                onUpdateTransaction={handleUpdateIncome}
                onDeleteTransaction={handleDeleteIncome}
                selectedCategory={selectedCategory}
                t={t}
              />
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
              <CategoryManager
                type="income"
                categories={incomeTypes}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onSelectCategory={handleCategorySelect}
                selectedCategory={selectedCategory}
                t={t}
              />
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
                      {t('income.categoryDistribution')}
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <Doughnut 
                        data={chartData.doughnut}
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
                      {t('income.topCategories')}
                    </Typography>
                    <Box sx={{ height: 300 }}>
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
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default IncomeOptimized; 