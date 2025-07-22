import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Close,
  Add,
  TrendingUp,
  TrendingDown,
  Category,
  Euro,
  CalendarToday
} from '@mui/icons-material';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

const QuickAddModal = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { 
    data, 
    addExpense, 
    addIncomeTransaction,
    selectedMonth,
    selectedYear
  } = useStore();

  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Obtenir les catégories selon le type de transaction
  const getCategories = () => {
    if (transactionType === 'expense') {
      return Object.keys(data).filter(cat => cat !== 'Revenus');
    } else {
      return ['Salaire', 'Freelance', 'Investissement', 'Autre'];
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Gérer la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        amount: parseFloat(amount),
        category,
        description,
        date,
        type: transactionType
      };

      if (transactionType === 'expense') {
        await addExpense(transactionData);
      } else {
        await addIncomeTransaction(transactionData);
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de l\'ajout de la transaction');
    } finally {
      setLoading(false);
    }
  };

  // Gérer la fermeture
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            p: 1,
            borderRadius: 2,
            background: transactionType === 'expense' ? 
              'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' :
              'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white'
          }}>
            {transactionType === 'expense' ? <TrendingDown /> : <TrendingUp />}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {transactionType === 'expense' ? 'Nouvelle Dépense' : 'Nouveau Revenu'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <form onSubmit={handleSubmit}>
          {/* Type de transaction */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Type de transaction
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<TrendingDown />}
                label="Dépense"
                onClick={() => setTransactionType('expense')}
                color={transactionType === 'expense' ? 'error' : 'default'}
                variant={transactionType === 'expense' ? 'filled' : 'outlined'}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              />
              <Chip
                icon={<TrendingUp />}
                label="Revenu"
                onClick={() => setTransactionType('income')}
                color={transactionType === 'income' ? 'success' : 'default'}
                variant={transactionType === 'income' ? 'filled' : 'outlined'}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              />
            </Box>
          </Box>

          {/* Montant */}
          <TextField
            fullWidth
            label="Montant (€)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <Euro sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          {/* Catégorie */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              startAdornment={<Category sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              {getCategories().map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            multiline
            rows={2}
            sx={{ mb: 3 }}
          />

          {/* Date */}
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            InputProps={{
              startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !amount || !category || !description}
          startIcon={<Add />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: transactionType === 'expense' ? 
              'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' :
              'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            '&:hover': {
              background: transactionType === 'expense' ? 
                'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)' :
                'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            }
          }}
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddModal; 