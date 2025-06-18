import React, { useState } from 'react';
import { useStore } from '../store';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Income = () => {
  const { months, incomeTypes, incomes, setIncome, removeIncomeType } = useStore();
  const idx = months.length - 1;
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleEdit = (i, val) => {
    setEditIdx(i);
    setEditValue(val);
  };
  const handleEditSave = (type) => {
    setIncome(type, idx, parseFloat(editValue) || 0);
    setEditIdx(null);
    setSnack({ open: true, message: 'Revenu modifié', severity: 'success' });
  };
  const handleDelete = (type) => {
    removeIncomeType(type);
    setDeleteIdx(null);
    setSnack({ open: true, message: 'Type de revenu supprimé', severity: 'info' });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Revenus
      </Typography>
      <Paper>
        <List>
          {incomeTypes.map((type, index) => (
            <React.Fragment key={type}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(index, incomes[type]?.[idx] || 0)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" color="error" onClick={() => setDeleteIdx(index)}>
                      <DeleteIcon />
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
                  />
                ) : (
                  <>
                    <ListItemText primary={type} />
                    <Typography>{(incomes[type]?.[idx] || 0).toLocaleString()} €</Typography>
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
      <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Income; 