import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const initialItems = [
  { icon: '🍔', title: 'McD, Point Cook', date: '5 Jan 2021, Food', amount: 5.00 },
  { icon: '🛒', title: 'Woolworths, Tarneit', date: '5 Jan 2021, Groceries', amount: 65.00 }
];

const History = () => {
  const [items, setItems] = useState(initialItems);
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState({ title: '', amount: '' });
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleEdit = (i, item) => {
    setEditIdx(i);
    setEditValue({ title: item.title, amount: item.amount });
  };
  const handleEditSave = (i) => {
    setItems(items => items.map((it, idx) => idx === i ? { ...it, ...editValue, amount: parseFloat(editValue.amount) || 0 } : it));
    setEditIdx(null);
    setSnack({ open: true, message: 'Transaction modifiée', severity: 'success' });
  };
  const handleDelete = (i) => {
    setItems(items => items.filter((_, idx) => idx !== i));
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
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(idx, item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" color="error" onClick={() => setDeleteIdx(idx)}>
                      <DeleteIcon />
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
                    <ListItemText primary={item.title} secondary={item.date} />
                    <Typography>{item.amount.toLocaleString()} €</Typography>
                  </>
                )}
              </ListItem>
              {idx < items.length - 1 && <Divider />}
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
          ))}
        </List>
      </Paper>
      <Paper sx={{ mb: 3, p: 2, height: 200, bgcolor: 'grey.200' }} />
      <Paper sx={{ p: 2 }}>
        <List>
          <ListItem secondaryAction={<Typography>100 €</Typography>}>
            <ListItemText primary="Économies" />
          </ListItem>
          <Divider />
          <ListItem secondaryAction={<Typography>180 €</Typography>}>
            <ListItemText primary="Revenus" />
          </ListItem>
          <Divider />
          <ListItem secondaryAction={<Typography>120 €</Typography>}>
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