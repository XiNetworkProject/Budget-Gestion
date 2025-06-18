import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert, Fab, Menu, MenuItem, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';

const Bank = () => {
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Compte courant', balance: 1250.00, type: 'current' },
    { id: 2, name: 'Épargne', balance: 5300.50, type: 'savings' },
    { id: 3, name: 'Carte de crédit', balance: -250.75, type: 'credit' }
  ]);
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState({ name: '', balance: '' });
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [addDialog, setAddDialog] = useState(false);
  const [transferDialog, setTransferDialog] = useState(false);
  const [transferData, setTransferData] = useState({ from: '', to: '', amount: '' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const getAccountIcon = (type) => {
    switch(type) {
      case 'current': return <AccountBalanceIcon />;
      case 'savings': return <SavingsIcon />;
      case 'credit': return <CreditCardIcon />;
      default: return <AccountBalanceIcon />;
    }
  };

  const getAccountColor = (type) => {
    switch(type) {
      case 'current': return 'primary';
      case 'savings': return 'success';
      case 'credit': return 'warning';
      default: return 'default';
    }
  };

  const handleEdit = (i, account) => {
    setEditIdx(i);
    setEditValue({ name: account.name, balance: account.balance });
  };

  const handleEditSave = (i) => {
    setAccounts(accounts => accounts.map((acc, idx) => 
      idx === i ? { ...acc, ...editValue, balance: parseFloat(editValue.balance) || 0 } : acc
    ));
    setEditIdx(null);
    setSnack({ open: true, message: 'Compte modifié', severity: 'success' });
  };

  const handleDelete = (i) => {
    setAccounts(accounts => accounts.filter((_, idx) => idx !== i));
    setDeleteIdx(null);
    setSnack({ open: true, message: 'Compte supprimé', severity: 'info' });
  };

  const handleAddAccount = () => {
    const newAccount = {
      id: Date.now(),
      name: editValue.name,
      balance: parseFloat(editValue.balance) || 0,
      type: 'current'
    };
    setAccounts(accounts => [...accounts, newAccount]);
    setAddDialog(false);
    setEditValue({ name: '', balance: '' });
    setSnack({ open: true, message: 'Compte ajouté', severity: 'success' });
  };

  const handleTransfer = () => {
    const fromIdx = accounts.findIndex(acc => acc.id === transferData.from);
    const toIdx = accounts.findIndex(acc => acc.id === transferData.to);
    const amount = parseFloat(transferData.amount);

    if (fromIdx !== -1 && toIdx !== -1 && amount > 0) {
      setAccounts(accounts => accounts.map((acc, idx) => {
        if (idx === fromIdx) return { ...acc, balance: acc.balance - amount };
        if (idx === toIdx) return { ...acc, balance: acc.balance + amount };
        return acc;
      }));
      setTransferDialog(false);
      setTransferData({ from: '', to: '', amount: '' });
      setSnack({ open: true, message: 'Transfert effectué', severity: 'success' });
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Banque
      </Typography>
      
      {/* Solde total */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" gutterBottom>Solde Total</Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {totalBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
        </Typography>
      </Paper>

      <Paper>
        <List>
          {accounts.map((account, idx) => (
            <React.Fragment key={account.id}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(idx, account)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" color="error" onClick={() => setDeleteIdx(idx)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <Box sx={{ mr: 2, color: `${getAccountColor(account.type)}.main` }}>
                  {getAccountIcon(account.type)}
                </Box>
                {editIdx === idx ? (
                  <>
                    <TextField
                      value={editValue.name}
                      onChange={e => setEditValue(v => ({ ...v, name: e.target.value }))}
                      size="small"
                      sx={{ mr: 2, width: 150 }}
                      onBlur={() => handleEditSave(idx)}
                      onKeyDown={e => { if (e.key === 'Enter') handleEditSave(idx); }}
                      autoFocus
                    />
                    <TextField
                      type="number"
                      value={editValue.balance}
                      onChange={e => setEditValue(v => ({ ...v, balance: e.target.value }))}
                      size="small"
                      sx={{ width: 100 }}
                      onBlur={() => handleEditSave(idx)}
                      onKeyDown={e => { if (e.key === 'Enter') handleEditSave(idx); }}
                    />
                  </>
                ) : (
                  <>
                    <ListItemText 
                      primary={account.name}
                      secondary={
                        <Chip 
                          label={account.type === 'current' ? 'Courant' : account.type === 'savings' ? 'Épargne' : 'Crédit'}
                          size="small"
                          color={getAccountColor(account.type)}
                          variant="outlined"
                        />
                      }
                    />
                    <Typography 
                      variant="h6" 
                      color={account.balance >= 0 ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {account.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </Typography>
                  </>
                )}
              </ListItem>
              {idx < accounts.length - 1 && <Divider />}
              
              {/* Dialog de confirmation suppression */}
              <Dialog open={deleteIdx === idx} onClose={() => setDeleteIdx(null)}>
                <DialogTitle>Supprimer le compte ?</DialogTitle>
                <DialogContent>
                  Cette action supprimera le compte <b>{account.name}</b>.
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDeleteIdx(null)}>Annuler</Button>
                  <Button color="error" onClick={() => handleDelete(idx)}>Supprimer</Button>
                </DialogActions>
              </Dialog>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* FAB pour ajouter un compte */}
      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => setAddDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Dialog d'ajout de compte */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)}>
        <DialogTitle>Ajouter un compte</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du compte"
            fullWidth
            variant="outlined"
            value={editValue.name}
            onChange={e => setEditValue(v => ({ ...v, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Solde initial"
            type="number"
            fullWidth
            variant="outlined"
            value={editValue.balance}
            onChange={e => setEditValue(v => ({ ...v, balance: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Annuler</Button>
          <Button onClick={handleAddAccount} disabled={!editValue.name}>Ajouter</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de transfert */}
      <Dialog open={transferDialog} onClose={() => setTransferDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Effectuer un transfert</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="De"
            fullWidth
            variant="outlined"
            value={transferData.from}
            onChange={e => setTransferData(v => ({ ...v, from: e.target.value }))}
            sx={{ mb: 2 }}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.name} ({account.balance.toFixed(2)} €)
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Vers"
            fullWidth
            variant="outlined"
            value={transferData.to}
            onChange={e => setTransferData(v => ({ ...v, to: e.target.value }))}
            sx={{ mb: 2 }}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.name} ({account.balance.toFixed(2)} €)
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Montant"
            type="number"
            fullWidth
            variant="outlined"
            value={transferData.amount}
            onChange={e => setTransferData(v => ({ ...v, amount: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleTransfer} 
            disabled={!transferData.from || !transferData.to || !transferData.amount || transferData.from === transferData.to}
          >
            Transférer
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

export default Bank; 