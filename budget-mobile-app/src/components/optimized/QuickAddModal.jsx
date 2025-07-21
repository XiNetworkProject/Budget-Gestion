import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Slide,
  Fade,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  Close as CloseIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const QuickAddModal = ({ open, onClose, type = 'expense' }) => {
  const { t } = useTranslation();
  const { 
    categories, 
    incomeTypes, 
    addExpense, 
    addIncome,
    getCurrentPlan
  } = useStore();
  
  const currentPlan = getCurrentPlan();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [incomeType, setIncomeType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const amountRef = useRef();
  const descriptionRef = useRef();

  // Réinitialiser les valeurs quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      
      // Focus automatique sur le montant
      setTimeout(() => {
        amountRef.current?.focus();
      }, 100);
    }
  }, [open, type]);

  // Définir les valeurs par défaut pour les catégories/types
  useEffect(() => {
    if (open) {
      if (type === 'expense' && categories.length > 0) {
        setCategory(categories[0]);
      } else if (type === 'income' && incomeTypes.length > 0) {
        setIncomeType(incomeTypes[0]);
      }
    }
  }, [open, type, categories, incomeTypes]);

  const isExpense = type === 'expense';
  const isIncome = type === 'income';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      return;
    }

    const transactionData = {
      amount: amountValue,
      description: description.trim() || (isExpense ? category : incomeType),
      date: new Date(date + 'T12:00:00').toISOString()
    };

    if (isExpense) {
      transactionData.category = category;
      addExpense(transactionData);
    } else {
      transactionData.type = incomeType;
      addIncome(transactionData);
    }

    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && amount) {
      handleSubmit(e);
    }
  };

  const getTitle = () => {
    if (isExpense) return 'Nouvelle Dépense';
    if (isIncome) return 'Nouveau Revenu';
    return 'Nouvelle Transaction';
  };

  const getIcon = () => {
    if (isExpense) return <ExpenseIcon color="error" />;
    if (isIncome) return <IncomeIcon color="success" />;
    return <MoneyIcon />;
  };

  const getColor = () => {
    if (isExpense) return '#ef4444';
    if (isIncome) return '#10b981';
    return '#2563eb';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          {getIcon()}
          <Typography variant="h6" fontWeight="bold">
            {getTitle()}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* Montant */}
          <TextField
            ref={amountRef}
            fullWidth
            label="Montant"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon sx={{ color: getColor() }} />
                </InputAdornment>
              ),
              sx: { 
                fontSize: '1.5rem',
                fontWeight: 'bold',
                '& input': { textAlign: 'center' }
              }
            }}
            sx={{ mb: 3 }}
            autoFocus
          />

          {/* Catégorie/Type */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>
              {isExpense ? 'Catégorie' : 'Type de revenu'}
            </InputLabel>
            <Select
              value={isExpense ? category : incomeType}
              onChange={(e) => isExpense ? setCategory(e.target.value) : setIncomeType(e.target.value)}
              label={isExpense ? 'Catégorie' : 'Type de revenu'}
            >
              {(isExpense ? categories : incomeTypes).map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2, opacity: 0.3 }} />

          {/* Description (optionnelle) */}
          <TextField
            ref={descriptionRef}
            fullWidth
            label="Description (optionnelle)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 3 }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          sx={{ 
            color: 'white', 
            borderColor: 'white',
            '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!amount || parseFloat(amount) <= 0}
          sx={{ 
            backgroundColor: getColor(),
            '&:hover': { backgroundColor: getColor(), opacity: 0.9 },
            px: 4
          }}
        >
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddModal; 