import React, { useState } from 'react';
import { useStore } from '../store';
import { Paper, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const QuickAdd = () => {
  const { months, categories, setValue } = useStore();
  const [category, setCategory] = useState(categories[0] || '');
  const [amount, setAmount] = useState('');
  const idx = months.length - 1;

  const handleAdd = () => {
    const val = parseFloat(amount) || 0;
    setValue(category, idx, val);
    setAmount('');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, mb: 2 }}> 
        <Typography variant="h5" gutterBottom>
          Ajout Rapide
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="select-category-label">Catégorie</InputLabel>
          <Select
            labelId="select-category-label"
            value={category}
            label="Catégorie"
            onChange={e => setCategory(e.target.value)}
          >
            {categories.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          type="number"
          label="Montant (€)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleAdd} fullWidth>
          Ajouter
        </Button>
      </Paper>
    </Box>
  );
};

export default QuickAdd; 