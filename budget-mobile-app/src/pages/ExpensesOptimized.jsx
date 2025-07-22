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
  Fade,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  TrendingDown,
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
import SafeZoom from '../components/optimized/SafeZoom';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Legend,
  ArcElement,
  Tooltip
);

const ExpensesOptimized = () => {
  const { 
    categories: rawCategories, 
    expenses,
    addCategory,
    updateCategory,
    removeCategory,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoading,
    error,
    serverConnected,
    isAuthenticated,
    activeAccount
  } = useStore();

  // Transformer les catégories simples en objets complets
  const categories = useMemo(() => {
    return rawCategories.map((catName, index) => ({
      id: `cat-${index}`,
      name: catName,
      icon: 'Category',
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A80'][index % 7],
      budget: 0,
      type: 'expense'
    }));
  }, [rawCategories]);
  
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filtrer les transactions par catégorie sélectionnée
  const filteredExpenses = useMemo(() => {
    if (!selectedCategory) return expenses;
    return expenses.filter(expense => expense.category === selectedCategory.name);
  }, [expenses, selectedCategory]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const count = expenses.length;
    const avg = count > 0 ? total / count : 0;
    
    // Grouper par catégorie
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
      return acc;
    }, {});

    return { total, count, avg, byCategory };
  }, [expenses]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    // Filtrer les catégories valides et non-undefined
    const validCategoryData = Object.entries(stats.byCategory)
      .filter(([category, amount]) => category && category !== 'undefined' && amount > 0)
      .map(([category, amount]) => ({
        category: category || 'Autre',
        amount: parseFloat(amount) || 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Si aucune donnée valide, afficher un message
    if (validCategoryData.length === 0) {
      return {
        doughnut: {
          labels: ['Aucune donnée'],
          datasets: [{
            data: [1],
            backgroundColor: ['rgba(255, 255, 255, 0.3)'],
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.8)'
          }]
        },
        bar: {
          labels: ['Aucune donnée'],
          datasets: [{
            label: t('expenses.amount'),
            data: [0],
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 1
          }]
        }
      };
    }

    return {
      doughnut: {
        labels: validCategoryData.map(d => d.category),
        datasets: [{
          data: validCategoryData.map(d => d.amount),
          backgroundColor: [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#FF8A80', '#90A4AE', '#FFB74D', '#81C784'
          ].slice(0, validCategoryData.length),
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.8)'
        }]
      },
      bar: {
        labels: validCategoryData.map(d => d.category),
        datasets: [{
          label: t('expenses.amount'),
          data: validCategoryData.map(d => d.amount),
          backgroundColor: 'rgba(255, 107, 107, 0.8)',
          borderColor: '#FF6B6B',
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
    // Ajouter seulement le nom pour l'ancien système
    addCategory(categoryData.name);
  };

  const handleUpdateCategory = (categoryId, categoryData) => {
    // Pour l'ancien système, on supprime et on rajoute
    const oldCategory = categories.find(c => c.id === categoryId);
    if (oldCategory) {
      removeCategory(oldCategory.name);
      addCategory(categoryData.name);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      removeCategory(category.name);
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
      }
    }
  };

  const handleAddExpense = (expenseData) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      type: 'expense'
    };
    addExpense(newExpense);
  };

  const handleUpdateExpense = (expenseId, expenseData) => {
    updateExpense(expenseId, expenseData);
  };

  const handleDeleteExpense = (expenseId) => {
    deleteExpense(expenseId);
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LoadingSpinner 
          message={t('expenses.loading')} 
          variant="elegant" 
          fullScreen 
        />
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
            <TrendingDown sx={{ mr: 2, color: '#FF6B6B' }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'white' }}>
              {t('expenses.title')}
            </Typography>
            <IconButton color="inherit" onClick={() => window.location.reload()}>
              <Refresh />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Alertes */}
        {!isAuthenticated && (
          <Fade in timeout={800}>
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
              {t('expenses.notConnected')}
            </Alert>
          </Fade>
        )}
        
        {isAuthenticated && !serverConnected && (
          <Fade in timeout={800}>
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
              {t('expenses.offlineMode')}
            </Alert>
          </Fade>
        )}

        {/* Statistiques principales */}
        <Paper sx={{
          m: 2,
          p: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#FF6B6B', fontWeight: 700 }}>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(stats.total)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {t('expenses.totalExpenses')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {stats.count}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {t('expenses.transactions')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(stats.avg)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {t('expenses.average')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Box sx={{ m: 2 }}>
          <Paper sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: '#FF6B6B'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#FF6B6B'
                }
              }}
            >
              <Tab 
                label={t('expenses.transactions')} 
                icon={<AttachMoney />} 
                iconPosition="start"
              />
              <Tab 
                label={t('expenses.categories')} 
                icon={<Category />} 
                iconPosition="start"
              />
              <Tab 
                label={t('expenses.analytics')} 
                icon={<TrendingDown />} 
                iconPosition="start"
              />
            </Tabs>
          </Paper>
        </Box>

        {/* Contenu des tabs */}
        <Box sx={{ m: 2 }}>
          {activeTab === 0 && (
            <SafeZoom in timeout={500}>
              <TransactionManager
                type="expenses"
                transactions={filteredExpenses}
                categories={categories}
                onAddTransaction={handleAddExpense}
                onUpdateTransaction={handleUpdateExpense}
                onDeleteTransaction={handleDeleteExpense}
                selectedCategory={selectedCategory}
                t={t}
              />
            </SafeZoom>
          )}

          {activeTab === 1 && (
            <SafeZoom in timeout={500}>
              <CategoryManager
                type="expenses"
                categories={categories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onSelectCategory={handleCategorySelect}
                selectedCategory={selectedCategory}
                t={t}
              />
            </SafeZoom>
          )}

          {activeTab === 2 && (
            <SafeZoom in timeout={500}>
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
                      {t('expenses.categoryDistribution')}
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
                      {t('expenses.topCategories')}
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
            </SafeZoom>
          )}
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default ExpensesOptimized; 