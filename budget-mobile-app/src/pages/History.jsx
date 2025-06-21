import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { AttachMoney, MoneyOff } from '@mui/icons-material';

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
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        {t('history.title')}
      </Typography>
      <Paper sx={{ mb: 3 }}>
        <List>
          {allTransactions.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary={t('history.noTransactions')} 
                secondary={t('history.addTransactionsToSeeHistory')}
              />
            </ListItem>
          ) : (
            allTransactions.map((item, idx) => (
            <React.Fragment key={item.id || idx}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(idx, item)}>
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" color="error" onClick={() => setDeleteIdx(idx)}>
                      <Delete />
                    </IconButton>
                  </>
                }
              >
                <ListItemAvatar>
                  <Avatar>{item.icon}</Avatar>
                </ListItemAvatar>
                {editIdx === idx ? (
                  <>
                    <TextField
                      value={editValue.title}
                      onChange={e => setEditValue(v => ({ ...v, title: e.target.value }))}
                      size="small"
                      sx={{ mr: 2, width: 180 }}
                      onBlur={() => handleEditSave(idx)}
                      onKeyDown={e => { if (e.key === 'Enter') handleEditSave(idx); }}
                      autoFocus
                    />
                    <TextField
                      type="number"
                      value={editValue.amount}
                      onChange={e => setEditValue(v => ({ ...v, amount: e.target.value }))}
                      size="small"
                      sx={{ width: 80 }}
                      onBlur={() => handleEditSave(idx)}
                      onKeyDown={e => { if (e.key === 'Enter') handleEditSave(idx); }}
                    />
                  </>
                ) : (
                  <>
                    <ListItemText primary={item.title} secondary={item.date instanceof Date ? item.date.toLocaleDateString('fr-FR') : item.date} />
                    <Typography color={item.type === 'income' ? 'success.main' : 'error.main'}>
                      {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()} €
                    </Typography>
                  </>
                )}
              </ListItem>
              {idx < allTransactions.length - 1 && <Divider />}
              {/* Dialog de confirmation suppression */}
              <Dialog open={deleteIdx === idx} onClose={() => setDeleteIdx(null)}>
                  <DialogTitle>{t('history.confirmDelete')}</DialogTitle>
                <DialogContent>
                  Cette action supprimera la transaction <b>{item.title}</b>.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteIdx(null)}>{t('common.cancel')}</Button>
                    <Button color="error" onClick={() => handleDelete(idx)}>{t('common.delete')}</Button>
                </DialogActions>
              </Dialog>
            </React.Fragment>
            ))
          )}
        </List>
      </Paper>
      <Paper sx={{ mb: 3, p: 2, height: 200, bgcolor: 'grey.200' }} />
      <Paper sx={{ p: 2 }}>
        <List>
          <ListItem secondaryAction={
            <Typography color={totalSavings >= 0 ? 'success.main' : 'error.main'}>
              {totalSavings.toLocaleString()} €
            </Typography>
          }>
            <ListItemText primary={t('history.savings')} />
          </ListItem>
          <Divider />
          <ListItem secondaryAction={
            <Typography color="success.main">
              {totalIncome.toLocaleString()} €
            </Typography>
          }>
            <ListItemText primary={t('history.income')} />
          </ListItem>
          <Divider />
          <ListItem secondaryAction={
            <Typography color="error.main">
              {totalExpenses.toLocaleString()} €
            </Typography>
          }>
            <ListItemText primary={t('history.expenses')} />
          </ListItem>
        </List>
      </Paper>
      <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default History; 