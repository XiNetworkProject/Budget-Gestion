import React, { useState } from 'react';
import { useStore } from '../store';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Expenses = () => {
  const { months, categories, data, setValue, removeCategory } = useStore();
  const idx = months.length - 1;
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleEdit = (i, val) => {
    setEditIdx(i);
    setEditValue(val);
  };
  const handleEditSave = (cat) => {
    setValue(cat, idx, parseFloat(editValue) || 0);
    setEditIdx(null);
    setSnack({ open: true, message: 'Dépense modifiée', severity: 'success' });
  };
  const handleDelete = (cat) => {
    removeCategory(cat);
    setDeleteIdx(null);
    setSnack({ open: true, message: 'Catégorie supprimée', severity: 'info' });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Dépenses
      </Typography>
      <Paper>
        <List>
          {categories.map((cat, index) => (
            <React.Fragment key={cat}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(index, data[cat]?.[idx] || 0)}>
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
                    onBlur={() => handleEditSave(cat)}
                    onKeyDown={e => { if (e.key === 'Enter') handleEditSave(cat); }}
                    autoFocus
                  />
                ) : (
                  <>
                    <ListItemText primary={cat} />
                    <Typography>{(data[cat]?.[idx] || 0).toLocaleString()} €</Typography>
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
      <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Expenses; 