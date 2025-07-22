import React, { useState, memo } from 'react';
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
  Fade,
  Zoom,
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
  InputAdornment
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
  type = 'expenses', // 'expenses' ou 'income'
  categories = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSelectCategory,
  selectedCategory = null,
  t
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Category',
    color: '#4CAF50',
    budget: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategoryForMenu, setSelectedCategoryForMenu] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      onUpdateCategory(editingCategory.id, newCategory);
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
    onDeleteCategory(category.id);
    setSnackbar({
      open: true,
      message: t('categoryManager.deleted'),
      severity: 'success'
    });
    setAnchorEl(null);
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
      {/* Header avec statistiques */}
      <Paper sx={{
        p: 3,
        mb: 3,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                {categories.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('categoryManager.totalCategories')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                {categories.filter(c => c.budget > 0).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('categoryManager.withBudget')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                {categories.filter(c => !c.budget || c.budget === 0).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('categoryManager.withoutBudget')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Liste des catégories */}
      <Grid container spacing={2}>
        {categories.map((category, index) => {
          const IconComponent = getIconComponent(category.icon);
          const isSelected = selectedCategory?.id === category.id;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Zoom in timeout={800 + index * 100}>
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
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                    background: 'rgba(255, 255, 255, 0.15)'
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
                      <Fade in timeout={300}>
                        <Box sx={{ 
                          mt: 1, 
                          p: 1, 
                          bgcolor: 'rgba(255, 255, 255, 0.1)', 
                          borderRadius: 1,
                          border: `1px solid ${category.color}`
                        }}>
                          <Typography variant="caption" sx={{ color: 'white' }}>
                            ✓ {t('categoryManager.selected')}
                          </Typography>
                        </Box>
                      </Fade>
                    )}
                  </CardContent>
                </Card>
              </Zoom>
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
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
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
              <FormControl fullWidth>
                <InputLabel>{t('categoryManager.icon')}</InputLabel>
                <Select
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  label={t('categoryManager.icon')}
                >
                  {defaultIcons.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <MenuItem key={iconOption.label} value={iconOption.icon.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconComponent sx={{ mr: 1, color: iconOption.color }} />
                          {iconOption.label}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('categoryManager.color')}
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                variant="outlined"
                InputProps={{
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