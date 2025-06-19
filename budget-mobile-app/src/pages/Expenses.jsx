import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
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
  Info
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
    activeAccount,
    selectedMonth,
    selectedYear
  } = useStore();
  
  const idx = months.length - 1;
  
  // Fonction pour vérifier si une date correspond au mois sélectionné
  const isDateInSelectedMonth = (dateString) => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return false;
      
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    } catch (error) {
      console.error('Erreur dans isDateInSelectedMonth:', error);
      return false;
    }
  };
  
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
    setSnack({ open: true, message: 'Dépense modifiée avec succès', severity: 'success' });
  };

  const handleDelete = (cat) => {
    removeCategory(cat);
    setDeleteIdx(null);
    setSnack({ open: true, message: 'Catégorie supprimée', severity: 'info' });
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
      setShowCategoryDialog(false);
      setSnack({ open: true, message: 'Catégorie ajoutée avec succès', severity: 'success' });
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
      setSnack({ open: true, message: 'Dépense ajoutée avec succès', severity: 'success' });
    }
  };

  const handleDeleteExpense = (expenseId) => {
    deleteExpense(expenseId);
    setSnack({ open: true, message: 'Dépense supprimée', severity: 'info' });
  };

  // Calculs pour les graphiques
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyExpenses = expenses
    .filter(exp => isDateInSelectedMonth(exp.date))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const categoryTotals = {};
  expenses
    .filter(exp => isDateInSelectedMonth(exp.date))
    .forEach(exp => {
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
      'Alimentation': '🍔',
      'Transport': '🚗',
      'Loisirs': '🎬',
      'Logement': '🏠',
      'Santé': '💊',
      'Shopping': '🛍️',
      'Restaurant': '🍽️',
      'Voyages': '✈️'
    };
    return icons[category] || '💰';
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
    <Box sx={{ pb: 8 }}>
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
                  <Typography variant="h6">Ce mois</Typography>
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
            <Tab label="Catégories" />
            <Tab label="Historique" />
            <Tab label="Analytics" />
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
                    <DialogTitle>Supprimer la catégorie ?</DialogTitle>
                    <DialogContent>
                      Cette action supprimera la catégorie <b>{cat}</b> et toutes ses données.
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setDeleteIdx(null)}>Annuler</Button>
                      <Button color="error" onClick={() => handleDelete(cat)}>Supprimer</Button>
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
                  Aucune dépense enregistrée
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span">
                  Ajoutez votre première dépense en utilisant le bouton +
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
                              <Chip label="Récurrent" size="small" color="warning" />
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
        <DialogTitle>Ajouter une dépense</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                label="Catégorie"
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
              Créer une nouvelle catégorie
            </Button>
            
            <TextField
              fullWidth
              label="Montant"
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
              label="Date"
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label="Description (optionnel)"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleAddExpense} 
            variant="contained"
            disabled={!newExpense.category || !newExpense.amount}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'ajout de catégorie */}
      <Dialog open={showCategoryDialog} onClose={() => setShowCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nom de la catégorie"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Ex: Loisirs, Transport, Alimentation..."
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCategoryDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleAddCategory} 
            variant="contained"
            disabled={!newCategory.trim()}
          >
            Créer
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