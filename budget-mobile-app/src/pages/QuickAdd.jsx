import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Snackbar, 
  Alert,
  Slide,
  IconButton,
  Tabs,
  Tab,
  InputAdornment,
  Chip
} from '@mui/material';
import { Close, Add, Remove } from '@mui/icons-material';

const QuickAdd = () => {
  const { 
    months, 
    categories, 
    incomeTypes,
    setValue, 
    addExpense, 
    addIncome,
    selectedMonth,
    selectedYear
  } = useStore();
  
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = dépense, 1 = revenu
  const [category, setCategory] = useState(categories[0] || '');
  const [incomeType, setIncomeType] = useState(incomeTypes[0] || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const amountRef = useRef();

  // Réinitialiser les valeurs quand la popup s'ouvre
  useEffect(() => {
    if (open) {
      setCategory(categories[0] || '');
      setIncomeType(incomeTypes[0] || '');
      setAmount('');
      setDescription('');
      setTimeout(() => {
        amountRef.current?.focus();
      }, 300);
    }
  }, [open, categories, incomeTypes]);

  const handleAdd = () => {
    const val = parseFloat(amount) || 0;
    
    if (activeTab === 0) {
      // Ajouter une dépense
      const expense = {
        category: category,
        amount: val,
        date: new Date().toISOString(),
        description: description || `${category} - ${new Date().toLocaleDateString('fr-FR')}`
      };
      addExpense(expense);
      setSuccessMessage('Dépense ajoutée !');
    } else {
      // Ajouter un revenu
      const income = {
        type: incomeType,
        amount: val,
        date: new Date().toISOString(),
        description: description || `${incomeType} - ${new Date().toLocaleDateString('fr-FR')}`
      };
      addIncome(income);
      setSuccessMessage('Revenu ajouté !');
    }
    
    setAmount('');
    setDescription('');
    setShowSuccess(true);
    setTimeout(() => {
      setOpen(false);
    }, 1000);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && amount) {
      handleAdd();
    }
  };

  return (
    <>
      {/* Bouton pour ouvrir la popup */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{ 
          position: 'fixed', 
          bottom: 80, 
          right: 16, 
          zIndex: 1000,
          borderRadius: '50px',
          minWidth: 'auto',
          width: 56,
          height: 56
        }}
      >
        <Add />
      </Button>

      {/* Popup QuickAdd */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            p: 3,
            pb: 4,
            maxHeight: '80vh',
            overflow: 'auto'
          }}
          elevation={8}
        >
          {/* En-tête */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Ajout Rapide
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>

          {/* Tabs pour Dépense/Revenu */}
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
            variant="fullWidth"
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Remove color="error" />
                  Dépense
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Add color="success" />
                  Revenu
                </Box>
              } 
            />
          </Tabs>

          {/* Formulaire */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Sélecteur de catégorie/type */}
            <FormControl fullWidth>
              <InputLabel>
                {activeTab === 0 ? 'Catégorie' : 'Type de revenu'}
              </InputLabel>
              <Select
                value={activeTab === 0 ? category : incomeType}
                label={activeTab === 0 ? 'Catégorie' : 'Type de revenu'}
                onChange={(e) => {
                  if (activeTab === 0) {
                    setCategory(e.target.value);
                  } else {
                    setIncomeType(e.target.value);
                  }
                }}
              >
                {(activeTab === 0 ? categories : incomeTypes).map(item => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Montant */}
            <TextField
              fullWidth
              type="number"
              label="Montant (€)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyPress={handleKeyPress}
              inputRef={amountRef}
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
            />

            {/* Description (optionnel) */}
            <TextField
              fullWidth
              label="Description (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Courses, Salaire, etc."
            />

            {/* Bouton d'ajout */}
            <Button
              variant="contained"
              color={activeTab === 0 ? "error" : "success"}
              onClick={handleAdd}
              disabled={!amount || (activeTab === 0 ? !category : !incomeType)}
              size="large"
              sx={{ mt: 2, py: 1.5 }}
            >
              {activeTab === 0 ? 'Ajouter la dépense' : 'Ajouter le revenu'}
            </Button>
          </Box>
        </Paper>
      </Slide>

      {/* Snackbar de succès */}
      <Snackbar 
        open={showSuccess} 
        autoHideDuration={2000} 
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSuccessClose} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuickAdd; 