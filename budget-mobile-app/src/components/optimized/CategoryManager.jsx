import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../../store';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  Tooltip,
  Fab,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Category,
  ColorLens,
  Image,
  Save,
  Cancel,
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
  LocalGroceryStore,
  LocalBar,
  Movie,
  MusicNote,
  Pets,
  ChildCare,
  Elderly,
  FitnessCenter,
  Spa,
  BeachAccess,
  Park,
  LocalLibrary,
  LocalMall,
  LocalGasStation,
  LocalPharmacy,
  LocalLaundryService,
  LocalTaxi,
  DirectionsBus,
  DirectionsBike,
  DirectionsWalk
} from '@mui/icons-material';

// Icônes disponibles pour les catégories
const AVAILABLE_ICONS = {
  Home: <Home />,
  LocalHospital: <LocalHospital />,
  Restaurant: <Restaurant />,
  DirectionsCar: <DirectionsCar />,
  ShoppingCart: <ShoppingCart />,
  School: <School />,
  SportsEsports: <SportsEsports />,
  AttachMoney: <AttachMoney />,
  Work: <Work />,
  Flight: <Flight />,
  LocalGroceryStore: <LocalGroceryStore />,
  LocalBar: <LocalBar />,
  Movie: <Movie />,
  MusicNote: <MusicNote />,
  Pets: <Pets />,
  ChildCare: <ChildCare />,
  Elderly: <Elderly />,
  FitnessCenter: <FitnessCenter />,
  Spa: <Spa />,
  BeachAccess: <BeachAccess />,
  Park: <Park />,
  LocalLibrary: <LocalLibrary />,
  LocalMall: <LocalMall />,
  LocalGasStation: <LocalGasStation />,
  LocalPharmacy: <LocalPharmacy />,
  LocalLaundryService: <LocalLaundryService />,
  LocalTaxi: <LocalTaxi />,
  DirectionsBus: <DirectionsBus />,
  DirectionsBike: <DirectionsBike />,
  DirectionsWalk: <DirectionsWalk />
};

// Couleurs disponibles
const AVAILABLE_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#000000'
];

const CategoryManager = React.memo(({ type = 'expenses' }) => {
  const { categories, addCategory, updateCategory, removeCategory } = useStore();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Category',
    color: '#2196f3',
    description: ''
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategoryForMenu, setSelectedCategoryForMenu] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filtrer les catégories par type
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.type === type || !cat.type);
  }, [categories, type]);

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setNewCategory({
        name: category.name,
        icon: category.icon || 'Category',
        color: category.color || '#2196f3',
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setNewCategory({
        name: '',
        icon: 'Category',
        color: '#2196f3',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setNewCategory({
      name: '',
      icon: 'Category',
      color: '#2196f3',
      description: ''
    });
  };

  const handleSave = () => {
    if (!newCategory.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Le nom de la catégorie est requis',
        severity: 'error'
      });
      return;
    }

    const categoryData = {
      ...newCategory,
      type: type,
      id: editingCategory ? editingCategory.id : Date.now().toString()
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData);
      setSnackbar({
        open: true,
        message: 'Catégorie mise à jour avec succès',
        severity: 'success'
      });
    } else {
      addCategory(categoryData);
      setSnackbar({
        open: true,
        message: 'Catégorie créée avec succès',
        severity: 'success'
      });
    }

    handleCloseDialog();
  };

  const handleDelete = (category) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      removeCategory(category.id);
      setSnackbar({
        open: true,
        message: 'Catégorie supprimée avec succès',
        severity: 'success'
      });
    }
  };

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategoryForMenu(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCategoryForMenu(null);
  };

  const getCategoryIcon = useCallback((iconName) => {
    return AVAILABLE_ICONS[iconName] || <Category />;
  }, []);

  return (
    <Box>
      {/* En-tête avec bouton d'ajout */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
          Gestion des Catégories
        </Typography>
        <Fab
          color="primary"
          size="small"
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
            }
          }}
        >
          <Add />
        </Fab>
      </Box>

      {/* Liste des catégories */}
      <Card sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3
      }}>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Category sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune catégorie configurée
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Créez votre première catégorie pour organiser vos transactions
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredCategories.map((category, index) => (
                <React.Fragment key={category.id}>
                  <ListItem sx={{
                    borderRadius: 2,
                    mb: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${category.color}20`,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor: category.color,
                        width: 40,
                        height: 40
                      }}>
                        {getCategoryIcon(category.icon)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="600" sx={{ color: 'white' }}>
                          {category.name}
                        </Typography>
                      }
                      secondary={
                        category.description && (
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {category.description}
                          </Typography>
                        )
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuOpen(e, category)}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredCategories.length - 1 && (
                    <Divider sx={{ opacity: 0.3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={() => {
          handleOpenDialog(selectedCategoryForMenu);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Modifier
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDelete(selectedCategoryForMenu);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Supprimer
        </MenuItem>
      </Menu>

      {/* Dialog d'ajout/édition */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
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
          {editingCategory ? 'Modifier la catégorie' : 'Créer une nouvelle catégorie'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de la catégorie"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Ex: Loisirs, Transport, Alimentation..."
                  autoFocus
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (optionnel)"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Description de la catégorie..."
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Icône</InputLabel>
                  <Select
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    label="Icône"
                  >
                    {Object.keys(AVAILABLE_ICONS).map((iconName) => (
                      <MenuItem key={iconName} value={iconName}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: newCategory.color }}>
                            {AVAILABLE_ICONS[iconName]}
                          </Box>
                          {iconName}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Couleur</InputLabel>
                  <Select
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    label="Couleur"
                  >
                    {AVAILABLE_COLORS.map((color) => (
                      <MenuItem key={color} value={color}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              bgcolor: color,
                              border: '2px solid rgba(0,0,0,0.1)'
                            }}
                          />
                          {color}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid rgba(0,0,0,0.1)', 
                  borderRadius: 2,
                  background: 'rgba(0,0,0,0.02)'
                }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Aperçu
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: newCategory.color, width: 40, height: 40 }}>
                      {getCategoryIcon(newCategory.icon)}
                    </Avatar>
                    <Typography variant="body1" fontWeight="600">
                      {newCategory.name || 'Nom de la catégorie'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!newCategory.name.trim()}
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
              }
            }}
          >
            {editingCategory ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

CategoryManager.displayName = 'CategoryManager';

export default CategoryManager; 