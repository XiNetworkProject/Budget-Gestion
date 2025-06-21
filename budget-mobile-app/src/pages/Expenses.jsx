import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  IconButton, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Snackbar, 
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Fab,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Delete,
  Edit,
  Add,
  TrendingDown,
  Category,
  CalendarToday,
  Euro,
  ExpandMore,
  Save,
  Cancel,
  Warning,
  CheckCircle,
  Info,
  Home,
  LocalHospital,
  Restaurant,
  DirectionsCar,
  ShoppingCart,
  School,
  SportsEsports,
  AttachMoney,
  MoreVert
} from '@mui/icons-material';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Legend,
  ArcElement
);

const Expenses = () => {
  const { 
    months, 
    categories, 
    data, 
    setValue, 
    removeCategory,
    addCategory,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    activeAccount
  } = useStore();
  
  const { t } = useTranslation();
  
  const idx = months.length - 1;
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    recurring: false
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleEdit = (i, val) => {
    setEditIdx(i);
    setEditValue(val);
  };

  const handleEditSave = (cat) => {
    setValue(cat, idx, parseFloat(editValue) || 0);
    setEditIdx(null);
    setSnack({ open: true, message: t('expenses.expenseUpdated'), severity: 'success' });
  };

  const handleDelete = (cat) => {
    removeCategory(cat);
    setDeleteIdx(null);
    setSnack({ open: true, message: t('expenses.categoryDeleted'), severity: 'info' });
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
      setShowCategoryDialog(false);
      setSnack({ open: true, message: t('expenses.categoryAdded'), severity: 'success' });
    }
  };

  const handleAddExpense = () => {
    if (newExpense.category && newExpense.amount) {
      // Convertir la date au format ISO
      const isoDate = new Date(newExpense.date + 'T12:00:00').toISOString();
      
      console.log('Expenses - Date sélectionnée:', {
        selectedDate: newExpense.date,
        isoDate,
        parsedDate: new Date(isoDate),
        month: new Date(isoDate).getMonth(),
        year: new Date(isoDate).getFullYear()
      });
      
      const expense = {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: isoDate, // Utiliser la date ISO au lieu du format français
        description: newExpense.description,
        recurring: newExpense.recurring,
        accountId: activeAccount?.id
      };
      
      console.log('Expenses - Dépense à ajouter:', expense);
      addExpense(expense);
      
      setNewExpense({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        recurring: false
      });
      setShowAddDialog(false);
      setSnack({ open: true, message: t('expenses.expenseAdded'), severity: 'success' });
    }
  };

  const handleDeleteExpense = (expenseId) => {
    deleteExpense(expenseId);
    setSnack({ open: true, message: t('expenses.expenseDeleted'), severity: 'info' });
  };

  // Calculs pour les graphiques
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyExpenses = expenses.reduce((sum, exp) => {
    const month = new Date(exp.date).getMonth();
    const currentMonth = new Date().getMonth();
    if (month === currentMonth) {
      return sum + exp.amount;
    }
    return sum;
  }, 0);

  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const doughnutData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#C9CBCF'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const barData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Dépenses hebdomadaires',
      data: [120, 85, 200, 150, 90, 180, 95],
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
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

  const getCategoryIcon = (category) => {
    const icons = {
      'Logement': <Home sx={{ fontSize: 20 }} />,
      'Santé': <LocalHospital sx={{ fontSize: 20 }} />,
      'Alimentation': <Restaurant sx={{ fontSize: 20 }} />,
      'Transport': <DirectionsCar sx={{ fontSize: 20 }} />,
      'Shopping': <ShoppingCart sx={{ fontSize: 20 }} />,
      'Éducation': <School sx={{ fontSize: 20 }} />,
      'Loisirs': <SportsEsports sx={{ fontSize: 20 }} />
    };
    return icons[category] || <AttachMoney sx={{ fontSize: 20 }} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Alimentation': '#FF6384',
      'Transport': '#36A2EB',
      'Loisirs': '#FFCE56',
      'Logement': '#4BC0C0',
      'Santé': '#9966FF',
      'Shopping': '#FF9F40'
    };
    return colors[category] || '#C9CBCF';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules animées en arrière-plan */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
        animation: 'float 20s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(1deg)' },
          '66%': { transform: 'translateY(10px) rotate(-1deg)' }
        }
      }} />

      <AppBar position="static" sx={{ 
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <Toolbar>
          <Typography variant="h6" sx={{ 
            flexGrow: 1,
            color: 'white',
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Dépenses
          </Typography>
          <IconButton color="inherit" sx={{
            color: 'white',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)'
            }
          }}>
            <Info />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* KPIs */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Box sx={{ 
              p: 3,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              '&:hover': {
                transform: 'translateY(-4px)',
                background: 'rgba(255,255,255,0.15)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <TrendingDown sx={{ 
                  fontSize: 32, 
                  color: '#f44336',
                  filter: 'drop-shadow(0 2px 4px rgba(244, 67, 54, 0.3))'
                }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: '#f44336',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Total
              </Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 900, 
                color: '#f44336',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                {totalExpenses.toLocaleString()}€
              </Typography>
              <Typography variant="body2" sx={{ 
                opacity: 0.8, 
                fontWeight: 500,
                color: 'rgba(255,255,255,0.9)'
              }}>
                Toutes les dépenses
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ 
              p: 3,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              '&:hover': {
                transform: 'translateY(-4px)',
                background: 'rgba(255,255,255,0.15)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <CalendarToday sx={{ 
                  fontSize: 32, 
                  color: '#ff9800',
                  filter: 'drop-shadow(0 2px 4px rgba(255, 152, 0, 0.3))'
                }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: '#ff9800',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                {t('expenses.thisMonth')}
              </Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 900, 
                color: '#ff9800',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                {monthlyExpenses.toLocaleString()}€
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((monthlyExpenses / 2000) * 100, 100)} 
                sx={{ 
                  mt: 1, 
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#ff9800',
                    borderRadius: 3
                  } 
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ 
          mb: 3,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)'
                }
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: 3
              }
            }}
          >
            <Tab label={t('expenses.tabs.categories')} />
            <Tab label={t('expenses.tabs.history')} />
            <Tab label={t('expenses.tabs.analytics')} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box sx={{ 
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <List sx={{ p: 0 }}>
              {categories.map((cat, index) => (
                <React.Fragment key={cat}>
                  <ListItem sx={{ 
                    p: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                    }
                  }}
                    secondaryAction={
                      <>
                        <IconButton 
                          edge="end" 
                          aria-label="edit" 
                          onClick={() => handleEdit(index, data[cat]?.[idx] || 0)}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          color="error" 
                          onClick={() => setDeleteIdx(index)}
                          sx={{ color: '#f44336' }}
                        >
                          <Delete />
                        </IconButton>
                      </>
                    }
                  >
                    {editIdx === index ? (
                      <TextField
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        size="small"
                        sx={{ 
                          width: 100, 
                          mr: 2,
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'white',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                          '& .MuiInputAdornment-root': {
                            color: 'rgba(255,255,255,0.7)',
                          }
                        }}
                        onBlur={() => handleEditSave(cat)}
                        onKeyDown={e => { if (e.key === 'Enter') handleEditSave(cat); }}
                        autoFocus
                        InputProps={{
                          startAdornment: <InputAdornment position="start">€</InputAdornment>,
                        }}
                      />
                    ) : (
                      <>
                        <ListItemText 
                          primary={
                            <Typography sx={{ 
                              color: 'white',
                              fontWeight: 600,
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                              {cat}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ 
                              color: 'rgba(255,255,255,0.8)',
                              fontWeight: 500
                            }}>
                              {`${expenses.filter(exp => exp.category === cat).length} transactions`}
                            </Typography>
                          }
                        />
                        <Typography variant="h6" color="#f44336" sx={{ 
                          fontWeight: 900,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                          {(data[cat]?.[idx] || 0).toLocaleString()}€
                        </Typography>
                      </>
                    )}
                  </ListItem>
                  {index < categories.length - 1 && (
                    <Divider sx={{ 
                      opacity: 0.3,
                      borderColor: 'rgba(255,255,255,0.2)'
                    }} />
                  )}
                  
                  {/* Dialog de confirmation suppression */}
                  <Dialog open={deleteIdx === index} onClose={() => setDeleteIdx(null)}>
                    <DialogTitle>{t('expenses.confirmDeleteCategory')}</DialogTitle>
                    <DialogContent>
                      Cette action supprimera la catégorie <b>{cat}</b> et toutes ses données.
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setDeleteIdx(null)}>{t('common.cancel')}</Button>
                      <Button color="error" onClick={() => handleDelete(cat)}>{t('common.delete')}</Button>
                    </DialogActions>
                  </Dialog>
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {expenses.length === 0 ? (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600,
                  mb: 1
                }} gutterBottom>
                  {t('expenses.noExpenses')}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 500
                }}>
                  {t('expenses.addFirstExpense')}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ 
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <List sx={{ p: 0 }}>
                  {expenses.map((expense, index) => (
                    <React.Fragment key={expense.id}>
                      <ListItem sx={{ 
                        p: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.1)',
                          transform: 'translateX(8px)',
                        }
                      }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ 
                                color: 'white',
                                fontWeight: 600,
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                              }}>
                                {expense.category}
                              </Typography>
                              {expense.recurring && (
                                <Chip 
                                  label={t('expenses.recurring')} 
                                  size="small" 
                                  sx={{
                                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(255,255,255,0.8)',
                              fontWeight: 500
                            }}>
                              {expense.date} • {expense.description}
                            </Typography>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" color="#f44336" sx={{ 
                            fontWeight: 900,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}>
                            -{expense.amount}€
                          </Typography>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteExpense(expense.id)}
                            sx={{ color: '#f44336' }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < expenses.length - 1 && (
                        <Divider sx={{ 
                          opacity: 0.3,
                          borderColor: 'rgba(255,255,255,0.2)'
                        }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                p: 3,
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
                <Typography variant="h6" sx={{ 
                  gutterBottom: true,
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 2
                }}>
                  Répartition par catégorie
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={doughnutData} options={chartOptions} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                p: 3,
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
                <Typography variant="h6" sx={{ 
                  gutterBottom: true,
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 2
                }}>
                  Dépenses hebdomadaires
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={barData} options={chartOptions} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* FAB pour ajouter */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setShowAddDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)',
          width: 64,
          height: 64,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'rgba(255,255,255,0.25)',
            transform: 'scale(1.1) translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '& .MuiFab-label': {
            fontSize: 0,
          },
        }}
      >
        <Add sx={{ 
          fontSize: 28,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          transition: 'all 0.3s ease'
        }} />
      </Fab>

      {/* Dialog d'ajout de dépense */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('expenses.addExpense')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('expenses.category')}</InputLabel>
              <Select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                label={t('expenses.category')}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{getCategoryIcon(cat)}</span>
                      {cat}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setShowCategoryDialog(true)}
              sx={{ mb: 2 }}
              startIcon={<Add />}
            >
              {t('expenses.createNewCategory')}
            </Button>
            
            <TextField
              fullWidth
              label={t('expenses.amount')}
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
            />
            
            <TextField
              fullWidth
              label={t('expenses.date')}
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label={t('expenses.descriptionOptional')}
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleAddExpense} 
            variant="contained"
            disabled={!newExpense.category || !newExpense.amount}
          >
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'ajout de catégorie */}
      <Dialog open={showCategoryDialog} onClose={() => setShowCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('expenses.createNewCategory')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label={t('expenses.categoryName')}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Ex: Loisirs, Transport, Alimentation..."
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCategoryDialog(false)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleAddCategory} 
            variant="contained"
            disabled={!newCategory.trim()}
          >
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snack.open} 
        autoHideDuration={3000} 
        onClose={() => setSnack(s => ({ ...s, open: false }))} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Expenses; 