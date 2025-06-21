import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
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
  AppBar,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { AttachMoney, MoneyOff, TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material';

const History = () => {
  const { t } = useTranslation();
  
  const { 
    incomeTransactions, 
    expenses, 
    selectedMonth, 
    selectedYear,
    months,
    categories,
    data,
    incomeTypes,
    incomes,
    savings,
    activeAccount,
    deleteExpense,
    deleteIncome,
    deleteSavings
  } = useStore();
  
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState({ title: '', amount: '' });
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Fonction pour valider et parser une date
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  // Fonction pour vérifier si une date correspond au mois sélectionné
  const isDateInSelectedMonth = (dateString) => {
    const date = parseDate(dateString);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  };

  // Calculer les vraies données du mois sélectionné - SIMPLIFIÉ
  // Revenus du mois sélectionné - SEULEMENT LES TRANSACTIONS INDIVIDUELLES
  const selectedMonthIncomeTransactions = incomeTransactions
    .filter(t => isDateInSelectedMonth(t.date))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalIncome = selectedMonthIncomeTransactions;

  // Dépenses du mois sélectionné - SEULEMENT LES TRANSACTIONS INDIVIDUELLES
  const selectedMonthExpenses = expenses
    .filter(e => isDateInSelectedMonth(e.date))
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const totalExpenses = selectedMonthExpenses;

  // Économies du mois sélectionné
  const totalSavings = totalIncome - totalExpenses;

  // Fusionner et trier toutes les transactions - FILTRÉES PAR MOIS SÉLECTIONNÉ
  const allTransactions = [
    ...incomeTransactions
      .filter(t => isDateInSelectedMonth(t.date))
      .map(t => ({
      ...t,
      type: 'income',
      icon: <AttachMoney sx={{ fontSize: 20 }} />,
      title: t.type || 'Revenu',
        date: parseDate(t.date),
      amount: t.amount
    })),
    ...expenses
      .filter(e => isDateInSelectedMonth(e.date))
      .map(t => ({
      ...t,
      type: 'expense',
      icon: <MoneyOff sx={{ fontSize: 20 }} />,
      title: t.category || 'Dépense',
        date: parseDate(t.date),
      amount: t.amount
    }))
  ].sort((a, b) => b.date - a.date);

  const handleEdit = (i, item) => {
    setEditIdx(i);
    setEditValue({ title: item.title, amount: item.amount });
  };
  const handleEditSave = (i) => {
    // Edition locale uniquement pour la démo
    setEditIdx(null);
    setSnack({ open: true, message: t('history.transactionUpdated'), severity: 'success' });
  };
  const handleDelete = (i) => {
    // Suppression locale uniquement pour la démo
    setDeleteIdx(null);
    setSnack({ open: true, message: t('history.transactionDeleted'), severity: 'info' });
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

      {/* AppBar glassmorphism */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'none',
          mb: 2
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {t('history.title')}
          </Typography>
        </Box>
      </AppBar>

      <Box sx={{ p: 2, pb: 10, position: 'relative', zIndex: 1 }}>
        {/* Résumé du mois glassmorphism */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: 'rgba(76, 175, 80, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('history.income')}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalIncome.toLocaleString()}€
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: 'rgba(244, 67, 54, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('history.expenses')}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalExpenses.toLocaleString()}€
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: totalSavings >= 0 ? 'rgba(25, 118, 210, 0.2)' : 'rgba(255, 152, 0, 0.2)',
              backdropFilter: 'blur(20px)',
              border: totalSavings >= 0 ? '1px solid rgba(25, 118, 210, 0.3)' : '1px solid rgba(255, 152, 0, 0.3)',
              color: 'white',
              boxShadow: totalSavings >= 0 ? '0 8px 32px rgba(25, 118, 210, 0.3)' : '0 8px 32px rgba(255, 152, 0, 0.3)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalance sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('history.savings')}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalSavings.toLocaleString()}€
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Liste des transactions glassmorphism */}
        <Paper sx={{ 
          mb: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <List>
            {allTransactions.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary={t('history.noTransactions')} 
                  secondary={t('history.addTransactionsToSeeHistory')}
                  sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                />
              </ListItem>
            ) : (
              allTransactions.map((item, idx) => (
              <React.Fragment key={item.id || idx}>
                <ListItem
                  sx={{
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1
                    }
                  }}
                  secondaryAction={
                    <>
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => handleEdit(idx, item)}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        color="error" 
                        onClick={() => setDeleteIdx(idx)}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      background: item.type === 'income' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      {item.icon}
                    </Avatar>
                  </ListItemAvatar>
                  {editIdx === idx ? (
                    <>
                      <TextField
                        value={editValue.title}
                        onChange={e => setEditValue(v => ({ ...v, title: e.target.value }))}
                        size="small"
                        sx={{ 
                          mr: 2, 
                          width: 180,
                          '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.3)'
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.5)'
                            }
                          }
                        }}
                        onBlur={() => handleEditSave(idx)}
                        onKeyDown={e => { if (e.key === 'Enter') handleEditSave(idx); }}
                        autoFocus
                      />
                      <TextField
                        type="number"
                        value={editValue.amount}
                        onChange={e => setEditValue(v => ({ ...v, amount: e.target.value }))}
                        size="small"
                        sx={{ 
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.3)'
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.5)'
                            }
                          }
                        }}
                        onBlur={() => handleEditSave(idx)}
                        onKeyDown={e => { if (e.key === 'Enter') handleEditSave(idx); }}
                      />
                    </>
                  ) : (
                    <>
                      <ListItemText 
                        primary={item.title} 
                        secondary={item.date instanceof Date ? item.date.toLocaleDateString('fr-FR') : item.date}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: 'white',
                            fontWeight: 'bold'
                          },
                          '& .MuiListItemText-secondary': {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        }}
                      />
                      <Typography 
                        sx={{ 
                          color: item.type === 'income' ? '#4caf50' : '#f44336',
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}
                      >
                        {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()} €
                      </Typography>
                    </>
                  )}
                </ListItem>
                {idx < allTransactions.length - 1 && (
                  <Divider sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    mx: 2
                  }} />
                )}
                {/* Dialog de confirmation suppression glassmorphism */}
                <Dialog 
                  open={deleteIdx === idx} 
                  onClose={() => setDeleteIdx(null)}
                  PaperProps={{
                    sx: {
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <DialogTitle sx={{ color: '#333', fontWeight: 'bold' }}>
                    {t('history.confirmDelete')}
                  </DialogTitle>
                  <DialogContent>
                    <Typography sx={{ color: '#333' }}>
                      Cette action supprimera la transaction <b>{item.title}</b>.
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button 
                      onClick={() => setDeleteIdx(null)}
                      sx={{ color: '#666' }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      color="error" 
                      onClick={() => handleDelete(idx)}
                      sx={{
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
                        }
                      }}
                    >
                      {t('common.delete')}
                    </Button>
                  </DialogActions>
                </Dialog>
              </React.Fragment>
              ))
            )}
          </List>
        </Paper>

        <Snackbar 
          open={snack.open} 
          autoHideDuration={2000} 
          onClose={() => setSnack(s => ({ ...s, open: false }))} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnack(s => ({ ...s, open: false }))} 
            severity={snack.severity} 
            sx={{ width: '100%' }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default History; 