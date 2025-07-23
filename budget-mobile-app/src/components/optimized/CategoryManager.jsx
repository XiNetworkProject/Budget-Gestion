import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Alert,
  AlertTitle,
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Fade,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Category,
  Save,
  Cancel,
  Warning,
  CheckCircle,
  ColorLens,
  Palette,
  TrendingUp,
  TrendingDown,
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
  LocalBus,
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
  'Bus': <LocalBus />,
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

const CategoryManager = React.memo(({ 
  categories = [], 
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory,
  type = 'expenses', // 'expenses' ou 'income'
  open = false,
  onClose
}) => {
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Category',
    color: DEFAULT_COLORS[0],
    description: ''
  });
  
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [error, setError] = useState('');

  // Icônes disponibles
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
    { name: 'LocalBus', icon: <LocalBus /> },
    { name: 'Train', icon: <Train /> },
    { name: 'DirectionsBike', icon: <DirectionsBike /> },
    { name: 'DirectionsWalk', icon: <DirectionsWalk /> }
  ], []);

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

  // Gestion de l'ajout de catégorie
  const handleAddCategory = useCallback(() => {
    if (!newCategory.name.trim()) {
      setError('Le nom de la catégorie est requis');
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
      setError('Une catégorie avec ce nom existe déjà');
      return;
    }

    onAddCategory({
      name: newCategory.name.trim(),
      icon: newCategory.icon,
      color: newCategory.color,
      description: newCategory.description.trim()
    });

    setNewCategory({
      name: '',
      icon: 'Category',
      color: DEFAULT_COLORS[0],
      description: ''
    });
    setShowAddDialog(false);
    setError('');
  }, [newCategory, categories, onAddCategory]);

  // Gestion de la modification de catégorie
  const handleUpdateCategory = useCallback(() => {
    if (!editingCategory.name.trim()) {
      setError('Le nom de la catégorie est requis');
      return;
    }

    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === editingCategory.name.toLowerCase() && 
      cat.name !== editingCategory.originalName
    );

    if (existingCategory) {
      setError('Une catégorie avec ce nom existe déjà');
      return;
    }

    onUpdateCategory(editingCategory.originalName, {
      name: editingCategory.name.trim(),
      icon: editingCategory.icon,
      color: editingCategory.color,
      description: editingCategory.description.trim()
    });

    setEditingCategory(null);
    setShowEditDialog(false);
    setError('');
  }, [editingCategory, categories, onUpdateCategory]);

  // Gestion de la suppression de catégorie
  const handleDeleteCategory = useCallback(() => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
      setCategoryToDelete(null);
      setShowDeleteDialog(false);
    }
  }, [categoryToDelete, onDeleteCategory]);

  // Ouvrir le dialogue d'édition
  const openEditDialog = useCallback((category) => {
    setEditingCategory({
      ...category,
      originalName: category.name
    });
    setShowEditDialog(true);
    setError('');
  }, []);

  // Ouvrir le dialogue de suppression
  const openDeleteDialog = useCallback((category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  }, []);

  // Réinitialiser le formulaire d'ajout
  const resetAddForm = useCallback(() => {
    setNewCategory({
      name: '',
      icon: 'Category',
      color: DEFAULT_COLORS[0],
      description: ''
    });
    setError('');
  }, []);

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
          <Category sx={{ color: 'primary.main' }} />
          Gestion des Catégories - {type === 'expenses' ? 'Dépenses' : 'Revenus'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Liste des catégories existantes */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Catégories existantes ({categories.length})
              </Typography>
              
              {categories.length === 0 ? (
                <Card sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: 'rgba(0, 0, 0, 0.02)',
                  border: '2px dashed rgba(0, 0, 0, 0.1)'
                }}>
                  <Category sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucune catégorie configurée
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Créez votre première catégorie pour commencer à organiser vos {type === 'expenses' ? 'dépenses' : 'revenus'}
                  </Typography>
                </Card>
              ) : (
                <List sx={{ p: 0 }}>
                  {categories.map((category, index) => (
                    <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }} key={category.name}>
                      <Card sx={{ 
                        mb: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                        }
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ 
                                bgcolor: category.color || getCategoryColor(category.name),
                                width: 40,
                                height: 40
                              }}>
                                {getCategoryIcon(category.name)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {category.name}
                                </Typography>
                                {category.description && (
                                  <Typography variant="body2" color="text.secondary">
                                    {category.description}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            
                            <Box display="flex" gap={1}>
                              <Tooltip title="Modifier">
                                <IconButton 
                                  size="small"
                                  onClick={() => openEditDialog(category)}
                                  sx={{ color: 'primary.main' }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton 
                                  size="small"
                                  onClick={() => openDeleteDialog(category)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Zoom>
                  ))}
                </List>
              )}
            </Grid>

            {/* Actions rapides */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                p: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                height: 'fit-content'
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Actions rapides
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => setShowAddDialog(true)}
                  sx={{ 
                    mb: 2,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Nouvelle catégorie
                </Button>

                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Gérez vos catégories pour mieux organiser vos {type === 'expenses' ? 'dépenses' : 'revenus'} et obtenir des analyses plus précises.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'ajout de catégorie */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => {
          setShowAddDialog(false);
          resetAddForm();
        }}
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
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
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
          <Button 
            onClick={() => {
              setShowAddDialog(false);
              resetAddForm();
            }}
          >
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

      {/* Dialog d'édition de catégorie */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => {
          setShowEditDialog(false);
          setEditingCategory(null);
          setError('');
        }}
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
          Modifier la catégorie
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Nom de la catégorie"
              value={editingCategory?.name || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Description (optionnel)"
              value={editingCategory?.description || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
              sx={{ mb: 2 }}
              multiline
              rows={2}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Icône</InputLabel>
                  <Select
                    value={editingCategory?.icon || 'Category'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
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
                    value={editingCategory?.color || DEFAULT_COLORS[0]}
                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
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
          <Button 
            onClick={() => {
              setShowEditDialog(false);
              setEditingCategory(null);
              setError('');
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleUpdateCategory} 
            variant="contained"
            disabled={!editingCategory?.name?.trim()}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)}
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
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning />
            Confirmer la suppression
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Attention !</AlertTitle>
            Êtes-vous sûr de vouloir supprimer la catégorie <strong>"{categoryToDelete?.name}"</strong> ?
          </Alert>
          
          <Typography variant="body2" color="text.secondary">
            Cette action est irréversible. Toutes les {type === 'expenses' ? 'dépenses' : 'revenus'} associées à cette catégorie devront être reclassées.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteDialog(false)}
            variant="outlined"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteCategory} 
            variant="contained"
            color="error"
          >
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

CategoryManager.displayName = 'CategoryManager';

export default CategoryManager; 