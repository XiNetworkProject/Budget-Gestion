import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { useStore } from '../store';

const History = () => {
  const { 
    incomeTransactions, 
    expenses, 
    selectedMonth, 
    selectedYear,
    months,
    categories,
    data,
    incomeTypes,
    incomes
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

  // Calculer les vraies données du mois sélectionné
  const selectedMonthIdx = months.length - 1; // Dernier mois par défaut

  // Revenus du mois sélectionné
  const selectedMonthIncomeByType = Object.values(incomes).reduce((sum, arr) => sum + (arr[selectedMonthIdx] || 0), 0);
  const selectedMonthIncomeTransactions = incomeTransactions
    .filter(t => isDateInSelectedMonth(t.date))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalIncome = selectedMonthIncomeByType + selectedMonthIncomeTransactions;

  // Dépenses du mois sélectionné
  const selectedMonthExpenses = expenses
    .filter(e => isDateInSelectedMonth(e.date))
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const selectedMonthExpensesByCategory = Object.entries(data).reduce((sum, [category, arr]) => {
    const hasIndividualTransactions = expenses.some(e => 
      e.category === category && isDateInSelectedMonth(e.date)
    );
    
    if (!hasIndividualTransactions) {
      return sum + (arr[selectedMonthIdx] || 0);
    }
    return sum;
  }, 0);
  
  const totalExpenses = selectedMonthExpenses + selectedMonthExpensesByCategory;

  // Économies du mois sélectionné
  const totalSavings = totalIncome - totalExpenses;

  // Fusionner et trier toutes les transactions
  const allTransactions = [
    ...incomeTransactions
      .filter(t => isDateInSelectedMonth(t.date))
      .map(t => ({
        ...t,
        type: 'income',
        icon: '💰',
        title: t.type || 'Revenu',
        date: parseDate(t.date),
        amount: t.amount
      })),
    ...expenses
      .filter(e => isDateInSelectedMonth(e.date))
      .map(t => ({
        ...t,
        type: 'expense',
        icon: '💸',
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
    setSnack({ open: true, message: 'Transaction modifiée', severity: 'success' });
  };
  const handleDelete = (i) => {
    // Suppression locale uniquement pour la démo
    setDeleteIdx(null);
    setSnack({ open: true, message: 'Transaction supprimée', severity: 'info' });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Activité Récente
      </Typography>
      <Paper sx={{ mb: 3 }}>
        <List>
          {allTransactions.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="Aucune transaction" 
                secondary="Ajoutez des dépenses ou revenus pour voir l'historique"
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
                  <DialogTitle>Supprimer la transaction ?</DialogTitle>
                  <DialogContent>
                    Cette action supprimera la transaction <b>{item.title}</b>.
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setDeleteIdx(null)}>Annuler</Button>
                    <Button color="error" onClick={() => handleDelete(idx)}>Supprimer</Button>
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
            <ListItemText primary="Économies" />
          </ListItem>
          <Divider />
          <ListItem secondaryAction={
            <Typography color="success.main">
              {totalIncome.toLocaleString()} €
            </Typography>
          }>
            <ListItemText primary="Revenus" />
          </ListItem>
          <Divider />
          <ListItem secondaryAction={
            <Typography color="error.main">
              {totalExpenses.toLocaleString()} €
            </Typography>
          }>
            <ListItemText primary="Dépenses" />
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