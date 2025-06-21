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
    <Box sx={{ p: 2, pb: 10 }}>
      {/* AppBar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dépenses
          </Typography>
          <IconButton color="inherit">
            <Info />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* KPIs */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown sx={{ mr: 1 }} />
                  <Typography variant="h6">Total</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalExpenses.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                  Toutes les dépenses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('expenses.thisMonth')}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {monthlyExpenses.toLocaleString()}€
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((monthlyExpenses / 2000) * 100, 100)} 
                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label={t('expenses.tabs.categories')} />
            <Tab label={t('expenses.tabs.history')} />
            <Tab label={t('expenses.tabs.analytics')} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Paper>
            <List>
              {categories.map((cat, index) => (
                <React.Fragment key={cat}>
                  <ListItem
                    secondaryAction={
                      <>
                        <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(index, data[cat]?.[idx] || 0)}>
                          <Edit />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" color="error" onClick={() => setDeleteIdx(index)}>
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
                        sx={{ width: 100, mr: 2 }}
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
                          primary={cat} 
                          secondary={`${expenses.filter(exp => exp.category === cat).length} transactions`}
                        />
                        <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                          {(data[cat]?.[idx] || 0).toLocaleString()}€
                        </Typography>
                      </>
                    )}
                  </ListItem>
                  {index < categories.length - 1 && <Divider />}
                  
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
          </Paper>
        )}

        {activeTab === 1 && (
          <Box>
            {expenses.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('expenses.noExpenses')}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span">
                  {t('expenses.addFirstExpense')}
                </Typography>
              </Paper>
            ) : (
              <List>
                {expenses.map((expense, index) => (
                  <React.Fragment key={expense.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{expense.category}</Typography>
                            {expense.recurring && (
                              <Chip label={t('expenses.recurring')} size="small" color="warning" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" component="span">
                              {expense.date} • {expense.description}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                          -{expense.amount}€
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < expenses.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Répartition par catégorie
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={doughnutData} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Dépenses hebdomadaires
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={barData} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* FAB pour ajouter */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => setShowAddDialog(true)}
      >
        <Add />
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