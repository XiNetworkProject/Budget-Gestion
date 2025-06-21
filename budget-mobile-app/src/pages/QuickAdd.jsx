import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
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
import { Close, Add, Remove, CalendarToday } from '@mui/icons-material';

const QuickAdd = ({ open: externalOpen, onClose: externalOnClose }) => {
  const { 
    months, 
    categories, 
    incomeTypes,
    setValue, 
    addExpense, 
    addIncome,
    selectedMonth,
    selectedYear,
    activeAccount
  } = useStore();
  
  const { t } = useTranslation();
  
  // Assurer que incomeTypes a des valeurs par défaut
  const defaultIncomeTypes = ["Salaire", "Aides", "Freelance", "Investissements", "Autres"];
  const availableIncomeTypes = incomeTypes && incomeTypes.length > 0 ? incomeTypes : defaultIncomeTypes;
  
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = dépense, 1 = revenu
  const [category, setCategory] = useState(categories[0] || '');
  const [incomeType, setIncomeType] = useState(availableIncomeTypes[0] || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Date au format YYYY-MM-DD
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const amountRef = useRef();

  // Utiliser les props externes si fournies (mode popup), sinon utiliser l'état local (mode page)
  const isPopupMode = externalOpen !== undefined;
  const currentOpen = isPopupMode ? externalOpen : open;
  const setCurrentOpen = isPopupMode ? externalOnClose : setOpen;

  // Réinitialiser les valeurs quand la popup s'ouvre
  useEffect(() => {
    if (currentOpen) {
      setCategory(categories[0] || '');
      setIncomeType(availableIncomeTypes[0] || '');
      setAmount('');
      setDescription('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      // Améliorer le focus avec un délai plus long
      setTimeout(() => {
        if (amountRef.current) {
          amountRef.current.focus();
          amountRef.current.select();
        }
      }, 500);
    }
  }, [currentOpen]); // Seulement quand currentOpen change, pas quand categories ou availableIncomeTypes changent

  // Gérer les changements de catégories sans affecter le montant
  useEffect(() => {
    if (currentOpen && categories.length > 0 && !category) {
      setCategory(categories[0]);
    }
  }, [categories, currentOpen, category]);

  useEffect(() => {
    if (currentOpen && availableIncomeTypes.length > 0 && !incomeType) {
      setIncomeType(availableIncomeTypes[0]);
    }
  }, [availableIncomeTypes, currentOpen, incomeType]);

  const handleAdd = () => {
    const val = parseFloat(amount) || 0;
    
    // Convertir la date au format ISO
    const isoDate = new Date(selectedDate + 'T12:00:00').toISOString();
    
    console.log('QuickAdd - Date sélectionnée:', {
      selectedDate,
      isoDate,
      parsedDate: new Date(isoDate),
      month: new Date(isoDate).getMonth(),
      year: new Date(isoDate).getFullYear()
    });
    
    if (activeTab === 0) {
      // Ajouter une dépense
      const expense = {
        category: category,
        amount: val,
        date: isoDate,
        description: description || `${category} - ${new Date(selectedDate).toLocaleDateString('fr-FR')}`
      };
      console.log('QuickAdd - Dépense à ajouter:', expense);
      addExpense(expense);
      setSuccessMessage(t('quickAdd.expenseAdded'));
    } else {
      // Ajouter un revenu
      const income = {
        type: incomeType,
        amount: val,
        date: isoDate,
        description: description || `${incomeType} - ${new Date(selectedDate).toLocaleDateString('fr-FR')}`,
        accountId: activeAccount?.id
      };
      console.log('QuickAdd - Revenu à ajouter:', income);
      addIncome(income);
      setSuccessMessage(t('quickAdd.incomeAdded'));
    }
    
    setAmount('');
    setDescription('');
    setShowSuccess(true);
    setTimeout(() => {
      setCurrentOpen(false);
    }, 1000);
  };

  const handleClose = () => {
    setCurrentOpen(false);
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        {t('quickAdd.quickAddTitle')}
      </Typography>
      {/* Bouton pour ouvrir la popup - seulement en mode page, pas en mode popup */}
      {!isPopupMode && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setCurrentOpen(true)}
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
      )}

      {/* Popup QuickAdd */}
      <Slide direction="up" in={currentOpen} mountOnEnter unmountOnExit>
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
              {t('quickAdd.quickAddTitle')}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>

          {/* Tabs pour Dépense/Revenu */}
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 2 }}
            variant="fullWidth"
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Remove color="error" />
                  {t('quickAdd.expense')}
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Add color="success" />
                  {t('quickAdd.income')}
                </Box>
              } 
            />
          </Tabs>

          {/* Formulaire */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Sélecteur de catégorie/type */}
            <FormControl fullWidth>
              <InputLabel>
                {activeTab === 0 ? t('quickAdd.category') : t('quickAdd.incomeType')}
              </InputLabel>
              <Select
                value={activeTab === 0 ? category : incomeType}
                label={activeTab === 0 ? t('quickAdd.category') : t('quickAdd.incomeType')}
                onChange={(e) => {
                  if (activeTab === 0) {
                    setCategory(e.target.value);
                  } else {
                    setIncomeType(e.target.value);
                  }
                }}
              >
                {activeTab === 0 ? 
                  categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  )) :
                  incomeTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>

            {/* Montant - AMÉLIORÉ */}
            <TextField
              fullWidth
              type="number"
              label={t('quickAdd.amount')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyPress={handleKeyPress}
              inputRef={amountRef}
              autoFocus
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
              inputProps={{
                step: "0.01",
                min: "0"
              }}
            />

            {/* Date */}
            <TextField
              fullWidth
              type="date"
              label={t('quickAdd.date')}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onKeyPress={handleKeyPress}
              InputLabelProps={{ shrink: true }}
            />

            {/* Description (optionnel) */}
            <TextField
              fullWidth
              label={t('quickAdd.description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('quickAdd.descriptionPlaceholder')}
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
              {activeTab === 0 ? t('quickAdd.addExpense') : t('quickAdd.addIncome')}
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
    </Box>
  );
};

export default QuickAdd; 