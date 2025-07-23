import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  // Icônes de base
  Category,
  AttachMoney,
  ShoppingCart,
  Restaurant,
  DirectionsCar,
  Home,
  Work,
  School,
  LocalHospital,
  SportsEsports,
  
  // Icônes de services
  LocalGroceryStore,
  LocalDining,
  LocalGasStation,
  LocalPharmacy,
  FitnessCenter,
  LocalCafe,
  LocalBar,
  LocalMovies,
  MusicNote,
  Park,
  MoreHoriz
} from '@mui/icons-material';

// Liste des icônes disponibles avec leurs noms d'affichage
const availableIcons = [
  { name: 'Category', label: 'Catégorie', icon: Category },
  { name: 'AttachMoney', label: 'Argent', icon: AttachMoney },
  { name: 'ShoppingCart', label: 'Shopping', icon: ShoppingCart },
  { name: 'Restaurant', label: 'Restaurant', icon: Restaurant },
  { name: 'DirectionsCar', label: 'Voiture', icon: DirectionsCar },
  { name: 'Home', label: 'Maison', icon: Home },
  { name: 'Work', label: 'Travail', icon: Work },
  { name: 'School', label: 'École', icon: School },
  { name: 'LocalHospital', label: 'Santé', icon: LocalHospital },
  { name: 'SportsEsports', label: 'Loisirs', icon: SportsEsports },
  { name: 'LocalGroceryStore', label: 'Épicerie', icon: LocalGroceryStore },
  { name: 'LocalDining', label: 'Repas', icon: LocalDining },
  { name: 'LocalGasStation', label: 'Essence', icon: LocalGasStation },
  { name: 'LocalPharmacy', label: 'Pharmacie', icon: LocalPharmacy },
  { name: 'FitnessCenter', label: 'Sport', icon: FitnessCenter },
  { name: 'LocalCafe', label: 'Café', icon: LocalCafe },
  { name: 'LocalBar', label: 'Bar', icon: LocalBar },
  { name: 'LocalMovies', label: 'Cinéma', icon: LocalMovies },
  { name: 'MusicNote', label: 'Musique', icon: MusicNote },
  { name: 'Park', label: 'Parc', icon: Park },
  { name: 'MoreHoriz', label: 'Autre', icon: MoreHoriz }
];

const IconSelector = ({ open, onClose, onSelect, currentIcon = 'Category' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleIconSelect = (iconName) => {
    onSelect(iconName);
    onClose();
  };

  const filteredIcons = availableIcons.filter(icon =>
    icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Sélectionner une icône</Typography>
          <IconButton onClick={onClose} size="small">
            <Button variant="outlined" size="small">Fermer</Button>
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher une icône..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Category />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <Grid container spacing={1}>
          {filteredIcons.map((icon) => {
            const IconComponent = icon.icon;
            const isSelected = currentIcon === icon.name;
            
            return (
              <Grid item xs={3} sm={2} key={icon.name}>
                <Box
                  onClick={() => handleIconSelect(icon.name)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 1,
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                    backgroundColor: isSelected ? 'primary.light' : 'transparent',
                  }}
                >
                  <IconComponent 
                    sx={{ 
                      fontSize: 24, 
                      color: isSelected ? 'primary.contrastText' : 'text.primary',
                      mb: 0.5 
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      textAlign: 'center',
                      color: isSelected ? 'primary.contrastText' : 'text.secondary',
                      fontSize: '0.7rem'
                    }}
                  >
                    {icon.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
        
        {filteredIcons.length === 0 && (
          <Box textAlign="center" py={3}>
            <Typography variant="body2" color="text.secondary">
              Aucune icône trouvée pour "{searchTerm}"
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IconSelector; 