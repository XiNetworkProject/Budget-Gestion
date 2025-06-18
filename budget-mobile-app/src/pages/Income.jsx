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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Delete,
  Edit,
  Add,
  TrendingUp,
  Work,
  CalendarToday,
  Euro,
  Save,
  Cancel,
  Warning,
  CheckCircle,
  Info,
  Business,
  School,
  MonetizationOn,
  AccountBalance
} from '@mui/icons-material';
import { Doughnut, Line } from 'react-chartjs-2';
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

const Income = () => {
  const { 
    months, 
    incomeTypes, 
    incomes, 
    setIncome, 
    removeIncomeType,
    addIncome,
    updateIncome,
    deleteIncome,
    activeAccount
  } = useStore();
  
  const idx = months.length - 1;
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [newIncome, setNewIncome] = useState({
    type: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    recurring: false,
    source: ''
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleEdit = (i, val) => {
    setEditIdx(i);
    setEditValue(val);
  };

  const handleEditSave = (type) => {
    setIncome(type, idx, parseFloat(editValue) || 0);
    setEditIdx(null);
    setSnack({ open: true, message: 'Revenu modifié avec succès', severity: 'success' });
  };

  const handleDelete = (type) => {
    removeIncomeType(type);
    setDeleteIdx(null);
    setSnack({ open: true, message: 'Type de revenu supprimé', severity: 'info' });
  };

  const handleAddIncome = () => {
    if (newIncome.type && newIncome.amount) {
      const income = {
        type: newIncome.type,
        amount: parseFloat(newIncome.amount),
        date: new Date(newIncome.date).toLocaleDateString('fr-FR'),
        description: newIncome.description,
        recurring: newIncome.recurring,
        source: newIncome.source,
        accountId: activeAccount?.id
      };
      
      addIncome(income);
      
      setNewIncome({
        type: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        recurring: false,
        source: ''
      });
      setShowAddDialog(false);
      setSnack({ open: true, message: 'Revenu ajouté avec succès', severity: 'success' });
    }
  };

  const handleDeleteIncome = (incomeId) => {
    deleteIncome(incomeId);
    setSnack({ open: true, message: 'Revenu supprimé', severity: 'info' });
  };

  // Calculs pour les graphiques
  const totalIncome = Object.values(incomes).reduce((sum, arr) => sum + (arr[idx] || 0), 0);
  const monthlyIncome = Object.values(incomes).reduce((sum, arr) => sum + (arr[idx] || 0), 0);

  const typeTotals = {};
  Object.keys(incomes).forEach(type => {
    typeTotals[type] = incomes[type][idx] || 0;
  });

  const doughnutData = {
    labels: Object.keys(typeTotals),
    datasets: [{
      data: Object.values(typeTotals),
      backgroundColor: [
        '#4CAF50',
        '#2196F3',
        '#FF9800',
        '#9C27B0',
        '#F44336',
        '#00BCD4',
        '#795548',
        '#607D8B'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const lineData = {
    labels: months.slice(-6), // 6 derniers mois
    datasets: [{
      label: 'Revenus mensuels',
      data: months.slice(-6).map((_, i) => {
        const monthIndex = months.length - 6 + i;
        return incomeTypes.reduce((sum, type) => sum + (incomes[type]?.[monthIndex] || 0), 0);
      }),
      borderColor: 'rgba(76, 175, 80, 1)',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      tension: 0.4,
      fill: true
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

  const getTypeIcon = (type) => {
    const icons = {
      'Salaire': '💼',
      'Freelance': '💻',
      'Investissements': '📈',
      'Location': '🏠',
      'Bonus': '🎁',
      'Pension': '👴',
      'Allocations': '💰',
      'Autres': '💵'
    };
    return icons[type] || '💵';
  };

  const getTypeColor = (type) => {
    const colors = {
      'Salaire': '#4CAF50',
      'Freelance': '#2196F3',
      'Investissements': '#FF9800',
      'Location': '#9C27B0',
      'Bonus': '#F44336',
      'Pension': '#00BCD4'
    };
    return colors[type] || '#607D8B';
  };

  const incomeSources = [
    'Salaire',
    'Freelance',
    'Investissements',
    'Location',
    'Bonus',
    'Pension',
    'Allocations',
    'Autres'
  ];

  return (
    <Box sx={{ pb: 8 }}>
      {/* AppBar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Revenus
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
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6">Total</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalIncome.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Tous les revenus
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ mr: 1 }} />
                  <Typography variant="h6">Ce mois</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {monthlyIncome.toLocaleString()}€
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((monthlyIncome / 5000) * 100, 100)} 
                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Types" />
            <Tab label="Historique" />
            <Tab label="Analytics" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Paper>
            <List>
              {incomeTypes.map((type, index) => (
                <React.Fragment key={type}>
                  <ListItem
                    secondaryAction={
                      <>
                        <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(index, incomes[type]?.[idx] || 0)}>
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
                        onBlur={() => handleEditSave(type)}
                        onKeyDown={e => { if (e.key === 'Enter') handleEditSave(type); }}
                        autoFocus
                        InputProps={{
                          startAdornment: <InputAdornment position="start">€</InputAdornment>,
                        }}
                      />
                    ) : (
                      <>
                        <ListItemText 
                          primary={type} 
                          secondary={`${(incomes[type]?.[idx] || 0).toLocaleString()}€ ce mois`}
                        />
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                          {(incomes[type]?.[idx] || 0).toLocaleString()}€
                        </Typography>
                      </>
                    )}
                  </ListItem>
                  {index < incomeTypes.length - 1 && <Divider />}
                  
                  {/* Dialog de confirmation suppression */}
                  <Dialog open={deleteIdx === index} onClose={() => setDeleteIdx(null)}>
                    <DialogTitle>Supprimer le type de revenu ?</DialogTitle>
                    <DialogContent>
                      Cette action supprimera <b>{type}</b> et toutes ses données.
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setDeleteIdx(null)}>Annuler</Button>
                      <Button color="error" onClick={() => handleDelete(type)}>Supprimer</Button>
                    </DialogActions>
                  </Dialog>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {activeTab === 1 && (
          <Box>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Historique des revenus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                L'historique détaillé sera disponible dans une prochaine version
              </Typography>
            </Paper>
          </Box>
        )}

        {activeTab === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Répartition par type
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={doughnutData} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Évolution des revenus
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={lineData} options={lineOptions} />
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

      {/* Dialog d'ajout de revenu */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un revenu</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type de revenu</InputLabel>
              <Select
                value={newIncome.type}
                onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value })}
                label="Type de revenu"
              >
                {[...incomeTypes, ...incomeSources].filter((type, index, arr) => arr.indexOf(type) === index).map((type) => (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{getTypeIcon(type)}</span>
                      {type}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Montant"
              type="number"
              value={newIncome.amount}
              onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
            />
            
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={newIncome.date}
              onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label="Source (optionnel)"
              value={newIncome.source}
              onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="Ex: Entreprise ABC, Client XYZ..."
            />
            
            <TextField
              fullWidth
              label="Description (optionnel)"
              value={newIncome.description}
              onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={newIncome.recurring}
                  onChange={(e) => setNewIncome({ ...newIncome, recurring: e.target.checked })}
                />
              }
              label="Revenu récurrent"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleAddIncome} 
            variant="contained"
            disabled={!newIncome.type || !newIncome.amount}
          >
            Ajouter
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

export default Income; 