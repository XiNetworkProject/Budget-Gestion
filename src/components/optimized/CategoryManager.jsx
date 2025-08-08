import React, { useState, memo, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  Fab,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  DialogContentText
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Category,
  ColorLens,
  Palette,
  CheckCircle,
  Warning,
  MoreVert,
  TrendingDown,
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  Restaurant,
  DirectionsCar,
  Home,
  School,
  SportsEsports,
  LocalHospital,
  Work,
  Business,
  AccountBalance,
  Computer,
  Person,
  MonetizationOn
} from '@mui/icons-material';

// Import des sélecteurs
import IconSelector from './IconSelector';
import ColorSelector from './ColorSelector';

// Icônes par défaut pour les catégories
const DEFAULT_ICONS = {
  expenses: [
    { icon: ShoppingCart, label: 'Shopping', color: '#FF6B6B' },
    { icon: Restaurant, label: 'Restaurant', color: '#4ECDC4' },
    { icon: DirectionsCar, label: 'Transport', color: '#45B7D1' },
    { icon: Home, label: 'Logement', color: '#96CEB4' },
    { icon: School, label: 'Éducation', color: '#FFEAA7' },
    { icon: SportsEsports, label: 'Loisirs', color: '#DDA0DD' },
    { icon: LocalHospital, label: 'Santé', color: '#FF8A80' },
    { icon: AttachMoney, label: 'Autres', color: '#90A4AE' }
  ],
  income: [
    { icon: Work, label: 'Salaire', color: '#4CAF50' },
    { icon: Business, label: 'Freelance', color: '#2196F3' },
    { icon: AccountBalance, label: 'Investissements', color: '#FF9800' },
    { icon: Computer, label: 'Technologie', color: '#9C27B0' },
    { icon: Person, label: 'Services', color: '#607D8B' },
    { icon: MonetizationOn, label: 'Autres', color: '#795548' }
  ]
};

const CategoryManager = memo(({ 
  type = 'expenses',
  categories = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSelectCategory,
  selectedCategory,
  t
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'category',
    color: '#2196f3',
    budget: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategoryForMenu, setSelectedCategoryForMenu] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [mounted, setMounted] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [showColorSelector, setShowColorSelector] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteWithData, setDeleteWithData] = useState(false);

  // Éviter les erreurs de rendu avant le montage
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Convertir les catégories du store (chaînes) en objets avec les propriétés nécessaires
  const processedCategories = useMemo(() => {
    return categories.map((category, index) => {
      // Si c'est déjà un objet, l'utiliser tel quel
      if (typeof category === 'object' && category !== null) {
        return category;
      }
      
      // Sinon, créer un objet à partir de la chaîne
      const colors = ['#FF6B6B', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B', '#795548', '#E91E63'];
      const icons = ['category', 'home', 'restaurant', 'directions_car', 'shopping_cart', 'movie', 'sports_soccer', 'school'];
      
      return {
        id: `category-${index}`,
        name: category,
        icon: icons[index % icons.length],
        color: colors[index % colors.length],
        budget: 0
      };
    });
  }, [categories]);

  const defaultIcons = DEFAULT_ICONS[type] || DEFAULT_ICONS.expenses;

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setNewCategory({
        name: category.name,
        icon: category.icon || 'Category',
        color: category.color || '#4CAF50',
        budget: category.budget || 0
      });
    } else {
      setEditingCategory(null);
      setNewCategory({
        name: '',
        icon: 'Category',
        color: '#4CAF50',
        budget: 0
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
      color: '#4CAF50',
      budget: 0
    });
  };

  const handleSave = () => {
    if (!newCategory.name.trim()) {
      setSnackbar({
        open: true,
        message: t('categoryManager.nameRequired'),
        severity: 'error'
      });
      return;
    }

    if (editingCategory) {
      // Utiliser le nom de la catégorie au lieu de l'ID pour la mise à jour
      onUpdateCategory(editingCategory.name, newCategory);
      setSnackbar({
        open: true,
        message: t('categoryManager.updated'),
        severity: 'success'
      });
    } else {
      onAddCategory(newCategory);
      setSnackbar({
        open: true,
        message: t('categoryManager.added'),
        severity: 'success'
      });
    }
    handleCloseDialog();
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
    setAnchorEl(null);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      // Utiliser l'ID de la catégorie pour la suppression
      // Le store peut gérer les IDs d'objets et les noms de chaînes
      const categoryIdentifier = categoryToDelete.id || categoryToDelete.name;
      onDeleteCategory(categoryIdentifier, deleteWithData);
      setSnackbar({
        open: true,
        message: `Catégorie "${categoryToDelete.name}" supprimée${deleteWithData ? ' avec toutes ses données' : ''}`,
        severity: 'success'
      });
    }
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
    setDeleteWithData(false);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
    setDeleteWithData(false);
  };

  const handleIconSelect = (iconName) => {
    setNewCategory({ ...newCategory, icon: iconName });
    setShowIconSelector(false);
  };

  const handleColorSelect = (color) => {
    setNewCategory({ ...newCategory, color: color });
    setShowColorSelector(false);
  };

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategoryForMenu(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCategoryForMenu(null);
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      Category, TrendingDown, TrendingUp, AttachMoney, ShoppingCart,
      Restaurant, DirectionsCar, Home, School, SportsEsports,
      LocalHospital, Work, Business, AccountBalance, Computer,
      Person, MonetizationOn
    };
    return iconMap[iconName] || Category;
  };

  return (
    <Box>
      {/* Header simple */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
          {type === 'expenses' ? t('categoryManager.expenseCategories') : t('categoryManager.incomeCategories')}
        </Typography>
        <Chip 
          label={`${categories.length} ${t('categoryManager.categories')}`}
          color="primary"
          variant="outlined"
          sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
        />
      </Box>

      {/* Liste des catégories */}
      <Grid container spacing={2}>
        {processedCategories.map((category, index) => {
          const IconComponent = getIconComponent(category.icon);
          const isSelected = selectedCategory?.id === category.id;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card sx={{
                background: isSelected 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: isSelected 
                  ? `2px solid ${category.color}` 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: isSelected 
                  ? `0 8px 32px rgba(0, 0, 0, 0.2)` 
                  : '0 4px 16px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                animation: mounted ? `fadeInUp 0.6s ease ${index * 0.1}s both` : 'none',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                  background: 'rgba(255, 255, 255, 0.15)'
                },
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(20px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                },
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0
                  },
                  '100%': {
                    opacity: 1
                  }
                }
              }} onClick={() => onSelectCategory(category)}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ 
                      bgcolor: category.color, 
                      mr: 2,
                      width: 40,
                      height: 40
                    }}>
                      <IconComponent />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: 'white',
                        mb: 0.5
                      }}>
                        {category.name}
                      </Typography>
                      {category.budget > 0 && (
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 500
                        }}>
                          Budget: {category.budget}€
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, category);
                      }}
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  {isSelected && (
                    <Box sx={{ 
                      mt: 1, 
                      p: 1, 
                      bgcolor: 'rgba(255, 255, 255, 0.1)', 
                      borderRadius: 1,
                      border: `1px solid ${category.color}`,
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      <Typography variant="caption" sx={{ color: 'white' }}>
                        ✓ {t('categoryManager.selected')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Bouton d'ajout flottant */}
      <Fab
        color="primary"
        aria-label="add category"
        onClick={() => handleOpenDialog()}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
            transform: 'scale(1.1)',
            boxShadow: '0 12px 35px rgba(76, 175, 80, 0.6)',
          }
        }}
      >
        <Add />
      </Fab>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        
      >
        <MenuItem onClick={() => {
          handleOpenDialog(selectedCategoryForMenu);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          {t('categoryManager.edit')}
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedCategoryForMenu)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          {t('categoryManager.delete')}
        </MenuItem>
      </Menu>

      {/* Dialog d'ajout/édition */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          {editingCategory ? t('categoryManager.editCategory') : t('categoryManager.addCategory')}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('categoryManager.name')}
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Icône"
                  value={newCategory.icon}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          component={getIconComponent(newCategory.icon)}
                          sx={{ 
                            color: newCategory.color,
                            fontSize: 20
                          }}
                        />
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => setShowIconSelector(true)}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Choisir
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Couleur"
                  value={newCategory.color}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: newCategory.color,
                          border: '1px solid rgba(0, 0, 0, 0.2)'
                        }} />
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => setShowColorSelector(true)}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Choisir
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('categoryManager.budget')}
                type="number"
                value={newCategory.budget}
                onChange={(e) => setNewCategory({ ...newCategory, budget: parseFloat(e.target.value) || 0 })}
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>
                }}
                helperText={t('categoryManager.budgetHelper')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
              }
            }}
          >
            {editingCategory ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sélecteur d'icônes */}
      <IconSelector
        open={showIconSelector}
        onClose={() => setShowIconSelector(false)}
        onSelect={handleIconSelect}
        currentIcon={newCategory.icon}
      />

      {/* Sélecteur de couleurs */}
      <ColorSelector
        open={showColorSelector}
        onClose={() => setShowColorSelector(false)}
        onSelect={handleColorSelect}
        currentColor={newCategory.color}
      />

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={showDeleteDialog}
        onClose={cancelDelete}
        
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer la catégorie "{categoryToDelete?.name}" ?
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox
                checked={deleteWithData}
                onChange={(e) => setDeleteWithData(e.target.checked)}
                color="error"
              />
            }
            label="Supprimer également toutes les transactions associées à cette catégorie"
          />
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Attention :</strong> Cette action est irréversible !
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={cancelDelete} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained"
            color="error"
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
              }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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