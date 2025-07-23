import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
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
  FormControlLabel,
  Checkbox,
  Alert,
  AlertTitle,
  Grid,
  Chip,
  Avatar,
  Typography,
  Divider,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Add,
  Edit,
  Save,
  Cancel,
  Category,
  CalendarToday,
  Euro,
  Description,
  TrendingUp,
  TrendingDown,
  Schedule,
  Warning,
  CheckCircle,
  Home,
  LocalHospital,
  Restaurant,
  DirectionsCar,
  ShoppingCart,
  School,
  SportsEsports,
  AttachMoney,
  Work,
  Flight,
  Pets,
  LocalGroceryStore,
  LocalPharmacy,
  LocalGasStation,
  LocalLaundryService,
  LocalBarber,
  LocalFlorist,
  LocalPizza,
  LocalCafe,
  LocalConvenienceStore,
  AccountBalance,
  LocalPostOffice
} from '@mui/icons-material';

// Composants optimisés
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';

const TransactionDialog = React.memo(({ 
  open,
  onClose,
  onSave,
  type = 'expense', // 'expense' ou 'income'
  transaction = null, // Pour l'édition
  categories = [],
  title = null
}) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    recurring: false,
    recurringType: 'monthly',
    recurringEndDate: null
  });
  const [errors, setErrors] = useState({});
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Icônes par défaut pour les catégories
  const defaultIcons = {
    'Loyer': <Home />,
    'Électricité': <LocalHospital />,
    'Assurance': <AttachMoney />,
    'Banque': <AccountBalance />,
    'Nourriture': <Restaurant />,
    'Loisirs': <SportsEsports />,
    'Voiture': <DirectionsCar />,
    'Shopping': <ShoppingCart />,
    'Éducation': <School />,
    'Travail': <Work />,
    'Voyage': <Flight />,
    'Animaux': <Pets />,
    'Courses': <LocalGroceryStore />,
    'Pharmacie': <LocalPharmacy />,
    'Essence': <LocalGasStation />,
    'Lavage': <LocalLaundryService />,
    'Coiffeur': <LocalBarber />,
    'Fleurs': <LocalFlorist />,
    'Pizza': <LocalPizza />,
    'Café': <LocalCafe />,
    'Convenience': <LocalConvenienceStore />,
    'Poste': <LocalPostOffice />,
    'Salaire': <Work />,
    'Aides': <AttachMoney />,
    'Freelance': <Work />,
    'Investissements': <AttachMoney />,
    'Cadeaux': <LocalFlorist />,
    'Dons': <AttachMoney />
  };

  // Couleurs par défaut pour les catégories
  const defaultColors = {
    'Loyer': '#FF6384',
    'Électricité': '#36A2EB',
    'Assurance': '#FFCE56',
    'Banque': '#4BC0C0',
    'Nourriture': '#9966FF',
    'Loisirs': '#FF9F40',
    'Voiture': '#FF6384',
    'Shopping': '#C9CBCF',
    'Éducation': '#FF6384',
    'Travail': '#36A2EB',
    'Voyage': '#FFCE56',
    'Animaux': '#4BC0C0',
    'Courses': '#9966FF',
    'Pharmacie': '#FF9F40',
    'Essence': '#FF6384',
    'Lavage': '#C9CBCF',
    'Coiffeur': '#FF6384',
    'Fleurs': '#36A2EB',
    'Pizza': '#FFCE56',
    'Café': '#4BC0C0',
    'Convenience': '#9966FF',
    'Poste': '#FF9F40',
    'Salaire': '#4CAF50',
    'Aides': '#8BC34A',
    'Freelance': '#CDDC39',
    'Investissements': '#FFEB3B',
    'Cadeaux': '#FF9800',
    'Dons': '#FF5722'
  };

  // Initialiser le formulaire avec les données de la transaction (édition)
  useEffect(() => {
    if (transaction) {
      setFormData({
        category: transaction.category || '',
        amount: transaction.amount?.toString() || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: transaction.description || '',
        recurring: transaction.recurring || false,
        recurringType: transaction.recurringType || 'monthly',
        recurringEndDate: transaction.recurringEndDate ? new Date(transaction.recurringEndDate).toISOString().split('T')[0] : null
      });
    } else {
      // Réinitialiser le formulaire pour un nouvel ajout
      setFormData({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        recurring: false,
        recurringType: 'monthly',
        recurringEndDate: null
      });
    }
    setErrors({});
  }, [transaction, open]);

  // Fonction pour obtenir l'icône d'une catégorie
  const getCategoryIcon = useCallback((categoryName) => {
    return defaultIcons[categoryName] || <Category />;
  }, []);

  // Fonction pour obtenir la couleur d'une catégorie
  const getCategoryColor = useCallback((categoryName) => {
    return defaultColors[categoryName] || '#9E9E9E';
  }, []);

  // Validation du formulaire
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'La catégorie est requise';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    }

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }

    if (formData.recurring && formData.recurringEndDate) {
      const startDate = new Date(formData.date);
      const endDate = new Date(formData.recurringEndDate);
      if (endDate <= startDate) {
        newErrors.recurringEndDate = 'La date de fin doit être postérieure à la date de début';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Fonction pour sauvegarder
  const handleSave = useCallback(() => {
    if (!validateForm()) return;

    const transactionData = {
      category: formData.category.trim(),
      amount: parseFloat(formData.amount),
      date: new Date(formData.date + 'T12:00:00').toISOString(),
      description: formData.description.trim(),
      recurring: formData.recurring,
      recurringType: formData.recurringType,
      recurringEndDate: formData.recurringEndDate ? new Date(formData.recurringEndDate + 'T12:00:00').toISOString() : null
    };

    onSave(transactionData);
    onClose();
  }, [formData, validateForm, onSave, onClose]);

  // Fonction pour fermer le dialog
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Fonction pour ajouter une nouvelle catégorie
  const handleAddCategory = useCallback(() => {
    if (newCategory.trim()) {
      // Ici vous pouvez ajouter la logique pour ajouter une catégorie
      // Pour l'instant, on ferme juste le dialog
      setShowCategoryDialog(false);
      setNewCategory('');
    }
  }, [newCategory]);

  const dialogTitle = title || (transaction ? `Modifier ${type === 'expense' ? 'la dépense' : 'le revenu'}` : `Ajouter ${type === 'expense' ? 'une dépense' : 'un revenu'}`);

  return (
    <ErrorBoundary>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {type === 'expense' ? <TrendingDown color="error" /> : <TrendingUp color="success" />}
          {dialogTitle}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Catégorie */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Catégorie *</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Catégorie *"
                  startAdornment={
                    formData.category && (
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                          bgcolor: getCategoryColor(formData.category),
                          width: 24,
                          height: 24,
                          mr: 1
                        }}>
                          {getCategoryIcon(formData.category)}
                        </Avatar>
                      </Box>
                    )
                  }
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ 
                          bgcolor: getCategoryColor(cat),
                          width: 24,
                          height: 24
                        }}>
                          {getCategoryIcon(cat)}
                        </Avatar>
                        {cat}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setShowCategoryDialog(true)}
                sx={{ mt: 1 }}
                startIcon={<Add />}
              >
                Créer une nouvelle catégorie
              </Button>
            </Grid>

            {/* Montant */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Montant *"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>

            {/* Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date *"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description (optionnel)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Courses du week-end, Facture électricité..."
              />
            </Grid>

            {/* Section Récurrence */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Récurrence
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.recurring}
                      onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Transaction récurrente"
                />
              </Box>
              
              {formData.recurring && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Fréquence</InputLabel>
                      <Select
                        value={formData.recurringType}
                        onChange={(e) => setFormData({ ...formData, recurringType: e.target.value })}
                        label="Fréquence"
                      >
                        <MenuItem value="daily">Quotidien</MenuItem>
                        <MenuItem value="weekly">Hebdomadaire</MenuItem>
                        <MenuItem value="monthly">Mensuel</MenuItem>
                        <MenuItem value="yearly">Annuel</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date de fin (optionnel)"
                      type="date"
                      value={formData.recurringEndDate || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        recurringEndDate: e.target.value || null 
                      })}
                      error={!!errors.recurringEndDate}
                      helperText={errors.recurringEndDate || "Laissez vide pour une récurrence illimitée"}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            startIcon={transaction ? <Save /> : <Add />}
            sx={{
              background: type === 'expense' 
                ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
                : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': {
                background: type === 'expense'
                  ? 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)'
                  : 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
              }
            }}
          >
            {transaction ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'ajout de catégorie */}
      <Dialog 
        open={showCategoryDialog} 
        onClose={() => setShowCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Créer une nouvelle catégorie
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Nom de la catégorie"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Ex: Loisirs, Transport, Alimentation..."
            autoFocus
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setShowCategoryDialog(false)} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleAddCategory} 
            variant="contained"
            disabled={!newCategory.trim()}
            startIcon={<Add />}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  );
});

TransactionDialog.displayName = 'TransactionDialog';

export default TransactionDialog; 