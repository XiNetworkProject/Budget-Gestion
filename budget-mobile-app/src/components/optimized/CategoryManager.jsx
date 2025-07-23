import React, { useState, useMemo, useCallback } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
  AlertTitle,
  Fade,
  Zoom,
  Tooltip,
  Divider,
  Grid,
  Avatar,
  Fab,
  Snackbar
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
  ContentCut,
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

const CategoryManager = React.memo(({ 
  type = 'expenses', // 'expenses' ou 'income'
  categories = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSelectCategory,
  selectedCategory = null,
  showAddButton = true
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Icônes par défaut pour les catégories
  const defaultIcons = useMemo(() => ({
    'Loyer': Home,
    'Électricité': LocalHospital,
    'Assurance': AttachMoney,
    'Banque': AccountBalance,
    'Nourriture': Restaurant,
    'Loisirs': SportsEsports,
    'Voiture': DirectionsCar,
    'Shopping': ShoppingCart,
    'Éducation': School,
    'Travail': Work,
    'Voyage': Flight,
    'Animaux': Pets,
    'Courses': LocalGroceryStore,
    'Pharmacie': LocalPharmacy,
    'Essence': LocalGasStation,
    'Lavage': LocalLaundryService,
    'Coiffeur': ContentCut,
    'Fleurs': LocalFlorist,
    'Pizza': LocalPizza,
    'Café': LocalCafe,
    'Convenience': LocalConvenienceStore,
    'Poste': LocalPostOffice,
    'Salaire': Work,
    'Aides': AttachMoney,
    'Freelance': Work,
    'Investissements': AttachMoney,
    'Cadeaux': LocalFlorist,
    'Dons': AttachMoney
  }), []);

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

  // Fonction pour obtenir l'icône d'une catégorie
  const getCategoryIcon = useCallback((categoryName) => {
    const IconComponent = defaultIcons[categoryName] || Category;
    return <IconComponent />;
  }, [defaultIcons]);

  // Fonction pour obtenir la couleur d'une catégorie
  const getCategoryColor = useCallback((categoryName) => {
    return defaultColors[categoryName] || '#9E9E9E';
  }, []);

  // Fonction pour ouvrir le dialog d'ajout/édition
  const handleOpenDialog = useCallback((category = null) => {
    if (category) {
      setEditingCategory(category);
      setNewCategory(category);
    } else {
      setEditingCategory(null);
      setNewCategory('');
    }
    setOpenDialog(true);
  }, []);

  // Fonction pour fermer le dialog
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingCategory(null);
    setNewCategory('');
  }, []);

  // Fonction pour sauvegarder une catégorie
  const handleSaveCategory = useCallback(() => {
    if (!newCategory.trim()) return;

    if (editingCategory) {
      // Édition
      onUpdateCategory(editingCategory, newCategory.trim());
      setSnackbar({ open: true, message: 'Catégorie modifiée avec succès', severity: 'success' });
    } else {
      // Ajout
      onAddCategory(newCategory.trim());
      setSnackbar({ open: true, message: 'Catégorie ajoutée avec succès', severity: 'success' });
    }
    
    handleCloseDialog();
  }, [newCategory, editingCategory, onAddCategory, onUpdateCategory, handleCloseDialog]);

  // Fonction pour confirmer la suppression
  const handleDeleteConfirm = useCallback((category) => {
    setDeleteConfirm(category);
  }, []);

  // Fonction pour annuler la suppression
  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  // Fonction pour supprimer une catégorie
  const handleDeleteCategory = useCallback((category) => {
    onDeleteCategory(category);
    setSnackbar({ open: true, message: 'Catégorie supprimée avec succès', severity: 'info' });
    setDeleteConfirm(null);
  }, [onDeleteCategory]);

  // Fonction pour sélectionner une catégorie
  const handleSelectCategory = useCallback((category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  }, [onSelectCategory]);

  return (
    <ErrorBoundary>
      <Box>
        {/* En-tête */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight="bold" color="white">
            Gestion des Catégories
          </Typography>
          {showAddButton && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
                }
              }}
            >
              Ajouter une catégorie
            </Button>
          )}
        </Box>

        {/* Liste des catégories */}
        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 0 }}>
            {categories.length === 0 ? (
              <Box display="flex" alignItems="center" justifyContent="center" py={4}>
                <Category sx={{ fontSize: 48, color: 'text.secondary', mr: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Aucune catégorie configurée
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {categories.map((category, index) => (
                  <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }} key={category}>
                    <ListItem
                      sx={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.05)'
                        },
                        cursor: onSelectCategory ? 'pointer' : 'default'
                      }}
                      onClick={() => handleSelectCategory(category)}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ 
                          bgcolor: getCategoryColor(category),
                          width: 40,
                          height: 40
                        }}>
                          {getCategoryIcon(category)}
                        </Avatar>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Typography 
                            variant="subtitle1" 
                            fontWeight="medium"
                            color={selectedCategory === category ? 'primary.main' : 'white'}
                          >
                            {category}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Catégorie {type === 'expenses' ? 'de dépenses' : 'de revenus'}
                          </Typography>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(category);
                              }}
                              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConfirm(category);
                              }}
                              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Zoom>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

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
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
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
            
            {editingCategory && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Information</AlertTitle>
                La modification d'une catégorie mettra à jour toutes les transactions associées.
              </Alert>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Annuler
            </Button>
            <Button 
              onClick={handleSaveCategory} 
              variant="contained"
              disabled={!newCategory.trim()}
              startIcon={editingCategory ? <Save /> : <Add />}
            >
              {editingCategory ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de confirmation de suppression */}
        <Dialog 
          open={!!deleteConfirm} 
          onClose={handleDeleteCancel}
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
            Confirmer la suppression
          </DialogTitle>
          
          <DialogContent sx={{ pt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Attention</AlertTitle>
              Êtes-vous sûr de vouloir supprimer la catégorie "{deleteConfirm}" ?
              Cette action est irréversible et supprimera toutes les transactions associées.
            </Alert>
            
            <Typography variant="body2" color="text.secondary">
              Cette action ne peut pas être annulée.
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleDeleteCancel} color="inherit">
              Annuler
            </Button>
            <Button 
              onClick={() => handleDeleteCategory(deleteConfirm)} 
              variant="contained"
              color="error"
              startIcon={<Delete />}
            >
              Supprimer définitivement
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
    </ErrorBoundary>
  );
});

CategoryManager.displayName = 'CategoryManager';

export default CategoryManager; 