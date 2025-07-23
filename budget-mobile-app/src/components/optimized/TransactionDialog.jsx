import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Grid,
  Alert,
  AlertTitle,
  Chip,
  Avatar,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Add,
  Edit,
  Save,
  Cancel,
  Category,
  Euro,
  CalendarToday,
  Description,
  TrendingUp,
  TrendingDown,
  Schedule,
  Warning,
  CheckCircle,
  ColorLens,
  Palette,
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
  ChildCare,
  Elderly,
  FitnessCenter,
  Spa,
  Movie,
  MusicNote,
  Book,
  Computer,
  Phone,
  Wifi,
  LocalGasStation,
  LocalGroceryStore,
  LocalPharmacy,
  LocalLaundryService,
  LocalTaxi,
  DirectionsBus,
  Train,
  DirectionsBike,
  DirectionsWalk
} from '@mui/icons-material';

// Icônes par défaut pour les catégories
const DEFAULT_ICONS = {
  'Loyer': <Home />,
  'Électricité': <TrendingUp />,
  'Assurance': <AttachMoney />,
  'Banque': <TrendingDown />,
  'Nourriture': <Restaurant />,
  'Loisirs': <SportsEsports />,
  'Voiture': <DirectionsCar />,
  'Santé': <LocalHospital />,
  'Shopping': <ShoppingCart />,
  'Éducation': <School />,
  'Travail': <Work />,
  'Voyage': <Flight />,
  'Animaux': <Pets />,
  'Enfants': <ChildCare />,
  'Personnes âgées': <Elderly />,
  'Sport': <FitnessCenter />,
  'Bien-être': <Spa />,
  'Cinéma': <Movie />,
  'Musique': <MusicNote />,
  'Livres': <Book />,
  'Informatique': <Computer />,
  'Téléphone': <Phone />,
  'Internet': <Wifi />,
  'Carburant': <LocalGasStation />,
  'Épicerie': <LocalGroceryStore />,
  'Pharmacie': <LocalPharmacy />,
  'Blanchisserie': <LocalLaundryService />,
  'Taxi': <LocalTaxi />,
  'Bus': <DirectionsBus />,
  'Train': <Train />,
  'Vélo': <DirectionsBike />,
  'Marche': <DirectionsWalk />
};

// Couleurs par défaut
const DEFAULT_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#FF6B6B', '#4ECDC4',
  '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
];

const TransactionDialog = React.memo(({
  open = false,
  onClose,
  onSave,
  transaction = null, // Pour l'édition
  categories = [],
  type = 'expenses', // 'expenses' ou 'income'
  onAddCategory
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
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Category',
    color: DEFAULT_COLORS[0],
    description: ''
  });

  // Initialiser le formulaire avec les données de la transaction à éditer
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
    const iconName = categoryName in DEFAULT_ICONS ? categoryName : 'Category';
    return DEFAULT_ICONS[iconName] || <Category />;
  }, []);

  // Fonction pour obtenir la couleur d'une catégorie
  const getCategoryColor = useCallback((categoryName) => {
    const index = categories.findIndex(cat => cat.name === categoryName);
    return index >= 0 ? DEFAULT_COLORS[index % DEFAULT_COLORS.length] : DEFAULT_COLORS[0];
  }, [categories]);

  // Validation du formulaire
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'La catégorie est requise';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Le montant est requis';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Le montant doit être un nombre positif';
    }

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }

    if (formData.recurring && formData.recurringEndDate && new Date(formData.recurringEndDate) <= new Date(formData.date)) {
      newErrors.recurringEndDate = 'La date de fin doit être postérieure à la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Gestion de la sauvegarde
  const handleSave = useCallback(() => {
    if (!validateForm()) {
      return;
    }

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

  // Gestion de l'ajout de catégorie
  const handleAddCategory = useCallback(() => {
    if (!newCategory.name.trim()) {
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
      return;
    }

    onAddCategory({
      name: newCategory.name.trim(),
      icon: newCategory.icon,
      color: newCategory.color,
      description: newCategory.description.trim()
    });

    setFormData(prev => ({ ...prev, category: newCategory.name.trim() }));
    setNewCategory({
      name: '',
      icon: 'Category',
      color: DEFAULT_COLORS[0],
      description: ''
    });
    setShowCategoryDialog(false);
  }, [newCategory, categories, onAddCategory]);

  // Icônes disponibles pour les nouvelles catégories
  const availableIcons = useMemo(() => [
    { name: 'Category', icon: <Category /> },
    { name: 'Home', icon: <Home /> },
    { name: 'LocalHospital', icon: <LocalHospital /> },
    { name: 'Restaurant', icon: <Restaurant /> },
    { name: 'DirectionsCar', icon: <DirectionsCar /> },
    { name: 'ShoppingCart', icon: <ShoppingCart /> },
    { name: 'School', icon: <School /> },
    { name: 'SportsEsports', icon: <SportsEsports /> },
    { name: 'AttachMoney', icon: <AttachMoney /> },
    { name: 'Work', icon: <Work /> },
    { name: 'Flight', icon: <Flight /> },
    { name: 'Pets', icon: <Pets /> },
    { name: 'ChildCare', icon: <ChildCare /> },
    { name: 'Elderly', icon: <Elderly /> },
    { name: 'FitnessCenter', icon: <FitnessCenter /> },
    { name: 'Spa', icon: <Spa /> },
    { name: 'Movie', icon: <Movie /> },
    { name: 'MusicNote', icon: <MusicNote /> },
    { name: 'Book', icon: <Book /> },
    { name: 'Computer', icon: <Computer /> },
    { name: 'Phone', icon: <Phone /> },
    { name: 'Wifi', icon: <Wifi /> },
    { name: 'LocalGasStation', icon: <LocalGasStation /> },
    { name: 'LocalGroceryStore', icon: <LocalGroceryStore /> },
    { name: 'LocalPharmacy', icon: <LocalPharmacy /> },
    { name: 'LocalLaundryService', icon: <LocalLaundryService /> },
    { name: 'LocalTaxi', icon: <LocalTaxi /> },
    { name: 'DirectionsBus', icon: <DirectionsBus /> },
    { name: 'Train', icon: <Train /> },
    { name: 'DirectionsBike', icon: <DirectionsBike /> },
    { name: 'DirectionsWalk', icon: <DirectionsWalk /> }
  ], []);

  return (
    <>
      {/* Dialog principal */}
      <Dialog 
        open={open} 
        onClose={onClose}
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
          gap: 2
        }}>
          {transaction ? <Edit sx={{ color: 'primary.main' }} /> : <Add sx={{ color: 'primary.main' }} />}
          {transaction ? 'Modifier' : 'Ajouter'} {type === 'expenses' ? 'une dépense' : 'un revenu'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Formulaire principal */}
            <Grid item xs={12} md={8}>
              <Box>
                {/* Catégorie */}
                <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.category}>
                  <InputLabel>Catégorie *</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Catégorie *"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.name} value={cat.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ 
                            bgcolor: cat.color || getCategoryColor(cat.name),
                            width: 24,
                            height: 24
                          }}>
                            {getCategoryIcon(cat.name)}
                          </Avatar>
                          <Typography>{cat.name}</Typography>
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

                {/* Bouton pour ajouter une catégorie */}
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setShowCategoryDialog(true)}
                  sx={{ mb: 2 }}
                  startIcon={<Add />}
                >
                  Créer une nouvelle catégorie
                </Button>

                <Grid container spacing={2}>
                  {/* Montant */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Montant *"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      error={!!errors.amount}
                      helperText={errors.amount}
                      InputProps={{
                        startAdornment: <Euro sx={{ color: 'text.secondary', mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  {/* Date */}
                  <Grid item xs={12} sm={6}>
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
                </Grid>

                {/* Description */}
                <TextField
                  fullWidth
                  label="Description (optionnel)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  sx={{ mt: 2, mb: 2 }}
                  multiline
                  rows={2}
                  placeholder="Description détaillée de la transaction..."
                />

                {/* Section Récurrence */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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

                {formData.recurring && (
                  <Fade in={true}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
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
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Date de fin (optionnel)"
                            type="date"
                            value={formData.recurringEndDate || ''}
                            onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                            error={!!errors.recurringEndDate}
                            helperText={errors.recurringEndDate || "Laissez vide pour une récurrence illimitée"}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Grid>

            {/* Aperçu et informations */}
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 3,
                background: type === 'expenses' 
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                  : 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                color: 'white',
                height: 'fit-content'
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Aperçu
                </Typography>
                
                {formData.category && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Catégorie
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 24,
                        height: 24
                      }}>
                        {getCategoryIcon(formData.category)}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {formData.category}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {formData.amount && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Montant
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {parseFloat(formData.amount).toLocaleString()}€
                    </Typography>
                  </Box>
                )}

                {formData.date && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Date
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {new Date(formData.date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                )}

                {formData.recurring && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Récurrence
                    </Typography>
                    <Chip 
                      label={formData.recurringType === 'daily' ? 'Quotidien' :
                             formData.recurringType === 'weekly' ? 'Hebdomadaire' :
                             formData.recurringType === 'monthly' ? 'Mensuel' : 'Annuel'}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        mt: 0.5
                      }}
                    />
                  </Box>
                )}

                <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
                  {type === 'expenses' 
                    ? 'Cette transaction sera ajoutée à vos dépenses'
                    : 'Cette transaction sera ajoutée à vos revenus'
                  }
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} variant="outlined">
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.category || !formData.amount}
            sx={{
              background: type === 'expenses' 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                : 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
              '&:hover': {
                background: type === 'expenses' 
                  ? 'linear-gradient(135deg, #ee5a52 0%, #d63031 100%)'
                  : 'linear-gradient(135deg, #44a08d 0%, #2d3436 100%)'
              }
            }}
          >
            {transaction ? 'Sauvegarder' : 'Ajouter'}
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
          Nouvelle catégorie
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nom de la catégorie"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="Ex: Loisirs, Transport, Alimentation..."
              autoFocus
            />
            
            <TextField
              fullWidth
              label="Description (optionnel)"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="Description de la catégorie..."
              multiline
              rows={2}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Icône</InputLabel>
                  <Select
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    label="Icône"
                  >
                    {availableIcons.map((iconOption) => (
                      <MenuItem key={iconOption.name} value={iconOption.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {iconOption.icon}
                          {iconOption.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Couleur</InputLabel>
                  <Select
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    label="Couleur"
                  >
                    {DEFAULT_COLORS.map((color) => (
                      <MenuItem key={color} value={color}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: color,
                            border: '1px solid rgba(0,0,0,0.1)'
                          }} />
                          {color}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowCategoryDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleAddCategory} 
            variant="contained"
            disabled={!newCategory.name.trim()}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

TransactionDialog.displayName = 'TransactionDialog';

export default TransactionDialog; 