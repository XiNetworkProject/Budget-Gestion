import React, { useState, useMemo } from 'react';
import { 
  Box, Paper, List, ListItem, ListItemText, ListItemIcon, 
  IconButton, Button, Divider, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Typography, Avatar
} from '@mui/material';
import { Add, Delete, AccountBalance, Edit } from '@mui/icons-material';
import { useStore } from '../../store';
import EmptyState from './EmptyState';
import { showUndoToast } from './UndoToast';

const BankAccountsManager = () => {
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', balance: '' });

  const accounts = useMemo(() => bankAccounts || [], [bankAccounts]);

  const onAddClick = () => {
    setEditing(null);
    setForm({ name: '', balance: '' });
    setOpen(true);
  };

  const onEditClick = (acc) => {
    setEditing(acc);
    setForm({ name: acc.name || '', balance: acc.balance ?? '' });
    setOpen(true);
  };

  const onSave = () => {
    const name = form.name?.trim();
    const balance = Number(form.balance) || 0;
    if (!name) return;
    if (editing) {
      updateBankAccount(editing.id, { name, balance });
    } else {
      addBankAccount({ name, balance });
    }
    setOpen(false);
  };

  const onDelete = (acc) => {
    const backup = { ...acc };
    deleteBankAccount(acc.id);
    showUndoToast('Compte supprimé', () => addBankAccount(backup));
  };

  return (
    <Paper sx={{ 
      mb: 2,
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>Comptes bancaires</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={onAddClick}>Ajouter</Button>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {accounts.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <EmptyState 
              title="Aucun compte" 
              description="Ajoutez votre premier compte bancaire pour suivre vos soldes."
              actionLabel="Ajouter un compte"
              onAction={onAddClick}
            />
          </Box>
        ) : (
          accounts.map((acc) => (
            <ListItem key={acc.id} secondaryAction={
              <Box>
                <IconButton edge="end" sx={{ color: 'rgba(255,255,255,0.8)' }} onClick={() => onEditClick(acc)}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" color="error" onClick={() => onDelete(acc)} sx={{ ml: 1 }}>
                  <Delete />
                </IconButton>
              </Box>
            }>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: 'rgba(33,150,243,0.2)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <AccountBalance sx={{ color: '#90caf9' }} />
                </Avatar>
              </ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ color: 'white', fontWeight: 600 }}>{acc.name || 'Sans nom'}</Typography>}
                secondary={<Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>{(acc.balance || 0).toLocaleString()}€</Typography>}
              />
            </ListItem>
          ))
        )}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#333', fontWeight: 'bold' }}>{editing ? 'Modifier le compte' : 'Nouveau compte'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nom du compte"
            fullWidth
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Solde initial"
            type="number"
            fullWidth
            value={form.balance}
            onChange={(e) => setForm(f => ({ ...f, balance: e.target.value }))}
            InputProps={{ endAdornment: <span>€</span> }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ color: '#666' }}>Annuler</Button>
          <Button variant="contained" onClick={onSave}>{editing ? 'Enregistrer' : 'Ajouter'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BankAccountsManager;


