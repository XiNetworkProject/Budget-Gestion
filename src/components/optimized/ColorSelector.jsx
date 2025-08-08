import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton
} from '@mui/material';
import { Cancel, CheckCircle } from '@mui/icons-material';

// Palette de couleurs prédéfinies
const COLOR_PALETTE = {
  'Rouges': [
    '#FF0000', '#FF1744', '#F44336', '#E53935', '#D32F2F',
    '#C62828', '#B71C1C', '#FF5722', '#FF7043', '#FF8A65'
  ],
  'Oranges': [
    '#FF9800', '#FFB74D', '#FFCC02', '#FFA726', '#FF7043',
    '#FF5722', '#E64A19', '#D84315', '#BF360C', '#FF6F00'
  ],
  'Jaunes': [
    '#FFEB3B', '#FFF176', '#FFF59D', '#FFF9C4', '#FFFDE7',
    '#FFC107', '#FFB300', '#FF8F00', '#FF6F00', '#FFD600'
  ],
  'Verts': [
    '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9',
    '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A'
  ],
  'Bleus': [
    '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB',
    '#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6'
  ],
  'Violets': [
    '#9C27B0', '#BA68C8', '#CE93D8', '#E1BEE7', '#F3E5F5',
    '#7B1FA2', '#8E24AA', '#9C27B0', '#BA68C8', '#CE93D8'
  ],
  'Roses': [
    '#E91E63', '#F06292', '#F48FB1', '#F8BBD9', '#FCE4EC',
    '#C2185B', '#D81B60', '#E91E63', '#F06292', '#F48FB1'
  ],
  'Gris': [
    '#9E9E9E', '#BDBDBD', '#D5D5D5', '#EEEEEE', '#F5F5F5',
    '#616161', '#757575', '#9E9E9E', '#BDBDBD', '#D5D5D5'
  ],
  'Marron': [
    '#795548', '#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8',
    '#5D4037', '#6D4C41', '#795548', '#8D6E63', '#A1887F'
  ],
  'Noir/Blanc': [
    '#000000', '#212121', '#424242', '#616161', '#757575',
    '#9E9E9E', '#BDBDBD', '#E0E0E0', '#F5F5F5', '#FFFFFF'
  ]
};

const ColorSelector = ({ open, onClose, onSelect, currentColor = '#2196f3' }) => {
  const [selectedCategory, setSelectedCategory] = useState('Bleus');
  const [customColor, setCustomColor] = useState(currentColor);
  const [searchTerm, setSearchTerm] = useState('');

  const handleColorSelect = (color) => {
    onSelect(color);
    onClose();
  };

  const handleCustomColorChange = (color) => {
    setCustomColor(color);
  };

  const handleCustomColorSelect = () => {
    if (customColor) {
      handleColorSelect(customColor);
    }
  };

  const filteredCategories = Object.keys(COLOR_PALETTE).filter(cat =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredColors = COLOR_PALETTE[selectedCategory] || [];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        fontWeight: 700,
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Sélectionner une couleur
        <Button onClick={onClose} color="inherit">
          <Cancel />
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        {/* Couleur personnalisée */}
        <Box sx={{ mb: 3, p: 2, border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Couleur personnalisée
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              type="color"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              sx={{ width: 60, height: 40 }}
              InputProps={{
                style: { padding: 0, height: 40 }
              }}
            />
            <TextField
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#000000"
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">#</InputAdornment>
              }}
            />
            <Button
              variant="contained"
              onClick={handleCustomColorSelect}
              sx={{ 
                backgroundColor: customColor,
                color: 'white',
                '&:hover': {
                  backgroundColor: customColor,
                  opacity: 0.8
                }
              }}
            >
              <CheckCircle />
            </Button>
          </Box>
        </Box>

        {/* Barre de recherche */}
        <TextField
          fullWidth
          label="Rechercher une couleur"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: <InputAdornment position="start">🎨</InputAdornment>
          }}
        />

        {/* Catégories de couleurs */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Catégories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filteredCategories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setSelectedCategory(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>

        {/* Grille de couleurs */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {selectedCategory}
          </Typography>
          <Grid container spacing={2}>
            {filteredColors.map((color, index) => {
              const isSelected = currentColor === color;
              
              return (
                <Grid item xs={6} sm={4} md={3} key={`${color}-${index}`}>
                  <Box
                    sx={{
                      p: 2,
                      border: isSelected ? '3px solid #2196f3' : '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: 2,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      backgroundColor: color,
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }
                    }}
                    onClick={() => handleColorSelect(color)}
                  >
                    {isSelected && (
                      <CheckCircle 
                        sx={{ 
                          color: 'white',
                          fontSize: 24,
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                        }} 
                      />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        mt: isSelected ? 1 : 0
                      }}
                    >
                      {color}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ColorSelector; 