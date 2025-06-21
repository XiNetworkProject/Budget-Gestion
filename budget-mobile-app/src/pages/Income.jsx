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
  AccountBalance,
  Computer,
  Home,
  Person,
  AttachMoney,
  MoreVert
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
    activeAccount,
    incomeTransactions
  } = useStore();
  
  const { t } = useTranslation();
  
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
    setSnack({ open: true, message: t('income.incomeUpdated'), severity: 'success' });
  };

  const handleDelete = (type) => {
    removeIncomeType(type);
    setDeleteIdx(null);
    setSnack({ open: true, message: t('income.typeDeleted'), severity: 'info' });
  };

  const handleAddIncome = () => {
    if (newIncome.type && newIncome.amount) {
      // Convertir la date au format ISO
      const isoDate = new Date(newIncome.date + 'T12:00:00').toISOString();
      
      console.log('Income - Date sélectionnée:', {
        selectedDate: newIncome.date,
        isoDate,
        parsedDate: new Date(isoDate),
        month: new Date(isoDate).getMonth(),
        year: new Date(isoDate).getFullYear()
      });
      
      const income = {
        type: newIncome.type,
        amount: parseFloat(newIncome.amount),
        date: isoDate, // Utiliser la date ISO au lieu du format français
        description: newIncome.description,
        recurring: newIncome.recurring,
        source: newIncome.source,
        accountId: activeAccount?.id
      };
      
      console.log('Income - Revenu à ajouter:', income);
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
      setSnack({ open: true, message: t('income.incomeAdded'), severity: 'success' });
    }
  };

  const handleDeleteIncome = (incomeId) => {
    deleteIncome(incomeId);
    setSnack({ open: true, message: t('income.incomeDeleted'), severity: 'info' });
  };

  // Calculs pour les graphiques - Utiliser les transactions individuelles
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Fonction pour normaliser les dates (comme dans Home.jsx)
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    
    try {
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn('Date invalide détectée:', dateString, 'remplacée par la date actuelle');
        return new Date();
      }
      
      // Normaliser la date au début du jour pour éviter les problèmes de fuseau horaire
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
      
      return normalizedDate;
    } catch (error) {
      console.error('Erreur dans parseDate:', error);
      return new Date();
    }
  };

  // Fonction pour vérifier si une date correspond au mois actuel
  const isDateInCurrentMonth = (dateString) => {
    if (!dateString) return false;
    
    try {
      const date = parseDate(dateString);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    } catch (error) {
      console.error('Erreur dans isDateInCurrentMonth:', error);
      return false;
    }
  };

  // Calculer les revenus du mois actuel basés sur les transactions individuelles
  const currentMonthIncomeTransactions = incomeTransactions
    .filter(t => isDateInCurrentMonth(t.date))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  // Calculer les revenus par type pour le mois actuel (seulement si pas de transactions individuelles)
  const currentMonthIncomeByType = Object.values(incomes).reduce((sum, arr) => sum + (arr[idx] || 0), 0);

  // Prioriser les transactions individuelles, utiliser les données par type seulement si pas de transactions
  const totalIncome = currentMonthIncomeTransactions > 0 ? currentMonthIncomeTransactions : currentMonthIncomeByType;
  const monthlyIncome = totalIncome;

  // Calculer les totaux par type en priorisant les transactions individuelles
  const typeTotals = {};
  
  // D'abord, traiter les transactions individuelles
  incomeTransactions
    .filter(t => isDateInCurrentMonth(t.date))
    .forEach(t => {
      if (!typeTotals[t.type]) {
        typeTotals[t.type] = 0;
      }
      typeTotals[t.type] += t.amount || 0;
    });
  
  // Ensuite, ajouter les données par type seulement pour les types qui n'ont pas de transactions individuelles
  Object.keys(incomes).forEach(type => {
    if (!typeTotals[type] || typeTotals[type] === 0) {
    typeTotals[type] = incomes[type][idx] || 0;
    }
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
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() - (5 - i));
        
        // Calculer les transactions individuelles pour ce mois
        const monthIncomeTransactions = incomeTransactions
          .filter(t => {
            const date = parseDate(t.date);
            return date.getMonth() === targetDate.getMonth() && 
                   date.getFullYear() === targetDate.getFullYear();
          })
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        // Calculer les revenus par type pour ce mois (seulement si pas de transactions individuelles)
        const monthIncomeByType = Object.values(incomes).reduce((sum, arr) => sum + (arr[monthIndex] || 0), 0);
        
        // Prioriser les transactions individuelles
        return monthIncomeTransactions > 0 ? monthIncomeTransactions : monthIncomeByType;
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
      'Salaire': <Work sx={{ fontSize: 20 }} />,
      'Freelance': <Computer sx={{ fontSize: 20 }} />,
      'Investissements': <TrendingUp sx={{ fontSize: 20 }} />,
      'Location': <Home sx={{ fontSize: 20 }} />,
      'Pension': <Person sx={{ fontSize: 20 }} />,
      'Allocations': <AttachMoney sx={{ fontSize: 20 }} />,
      'Autres': <AttachMoney sx={{ fontSize: 20 }} />
    };
    return icons[type] || <AttachMoney sx={{ fontSize: 20 }} />;
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

  // Historique des transactions de revenus
  const transactions = incomeTransactions.filter(inc => !activeAccount || inc.accountId === activeAccount.id);

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

      <Typography variant="h4" sx={{ 
        mb: 3, 
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        p: 3,
        pt: 4
      }}>
        {t('income.title')}
      </Typography>
      
      {/* AppBar */}
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
            {t('income.title')}
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
                <TrendingUp sx={{ 
                  fontSize: 32, 
                  color: '#4caf50',
                  filter: 'drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3))'
                }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: '#4caf50',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                {t('income.total')}
              </Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 900, 
                color: '#4caf50',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                {totalIncome.toLocaleString()}€
              </Typography>
              <Typography variant="body2" sx={{ 
                opacity: 0.8, 
                fontWeight: 500,
                color: 'rgba(255,255,255,0.9)'
              }}>
                Tous les revenus
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
                  color: '#2196f3',
                  filter: 'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.3))'
                }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: '#2196f3',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                {t('income.thisMonth')}
              </Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 900, 
                color: '#2196f3',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                {monthlyIncome.toLocaleString()}€
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((monthlyIncome / 5000) * 100, 100)} 
                sx={{ 
                  mt: 1, 
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#2196f3',
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
            <Tab label={t('income.tabs.types')} />
            <Tab label={t('income.tabs.history')} />
            <Tab label={t('income.tabs.analytics')} />
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
              {Object.keys(typeTotals).map((type, index) => (
                <React.Fragment key={type}>
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
                          onClick={() => handleEdit(index, typeTotals[type] || 0)}
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
                          primary={
                            <Typography sx={{ 
                              color: 'white',
                              fontWeight: 600,
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                              {type}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ 
                              color: 'rgba(255,255,255,0.8)',
                              fontWeight: 500
                            }}>
                              {`${transactions.filter(inc => inc.type === type).length} transactions`}
                            </Typography>
                          }
                        />
                        <Typography variant="h6" color="#4caf50" sx={{ 
                          fontWeight: 900,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                          {(typeTotals[type] || 0).toLocaleString()}€
                        </Typography>
                      </>
                    )}
                  </ListItem>
                  {index < Object.keys(typeTotals).length - 1 && (
                    <Divider sx={{ 
                      opacity: 0.3,
                      borderColor: 'rgba(255,255,255,0.2)'
                    }} />
                  )}
                  
                  {/* Dialog de confirmation suppression */}
                  <Dialog open={deleteIdx === index} onClose={() => setDeleteIdx(null)}>
                    <DialogTitle>{t('income.confirmDeleteType')}</DialogTitle>
                    <DialogContent>
                      Cette action supprimera le type <b>{type}</b> et toutes ses données.
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setDeleteIdx(null)}>{t('common.cancel')}</Button>
                      <Button color="error" onClick={() => handleDelete(type)}>{t('common.delete')}</Button>
                    </DialogActions>
                  </Dialog>
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {transactions.length === 0 ? (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600,
                  mb: 1
                }}>
                  {t('income.noIncome')}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 500
                }}>
                  {t('income.addFirstIncome')}
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
                  {transactions
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Trier par date décroissante
                    .map((income, index) => {
                      // Formater la date pour l'affichage
                      const displayDate = new Date(income.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                      
                      return (
                    <React.Fragment key={income.id}>
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
                            <Typography sx={{ 
                              color: 'white',
                              fontWeight: 600,
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                              {income.type}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ 
                              color: 'rgba(255,255,255,0.8)',
                              fontWeight: 500
                            }}>
                              {`${displayDate} • ${income.description || 'Aucune description'}`}
                            </Typography>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" color="#4caf50" sx={{ 
                            fontWeight: 900,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}>
                            +{income.amount.toLocaleString()}€
                          </Typography>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteIncome(income.id)}
                            sx={{ color: '#f44336' }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < transactions.length - 1 && (
                        <Divider sx={{ 
                          opacity: 0.3,
                          borderColor: 'rgba(255,255,255,0.2)'
                        }} />
                      )}
                    </React.Fragment>
                      );
                    })}
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
                <Typography variant="h6" gutterBottom sx={{ 
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 2
                }}>
                  Répartition par type
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
                <Typography variant="h6" gutterBottom sx={{ 
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 2
                }}>
                  Évolution des revenus
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={lineData} options={lineOptions} />
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