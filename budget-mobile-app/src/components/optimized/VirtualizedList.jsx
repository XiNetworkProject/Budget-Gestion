import React, { useState, useCallback, useMemo } from 'react';
import { Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Skeleton } from '@mui/material';
import { FixedSizeList as VirtualList } from 'react-window';

const VirtualizedList = ({ 
  items = [], 
  height = 400, 
  itemHeight = 60,
  renderItem,
  loading = false,
  emptyMessage = "Aucun élément à afficher",
  showSkeleton = true
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Fonction pour rendre un élément de la liste
  const renderListItem = useCallback(({ index, style }) => {
    const item = items[index];
    
    if (!item) {
      return (
        <div style={style}>
          <Skeleton variant="rectangular" height={itemHeight - 16} sx={{ mx: 2, my: 1, borderRadius: 2 }} />
        </div>
      );
    }

    return (
      <div style={style}>
        <Box
          sx={{
            mx: 2,
            my: 1,
            p: 2,
            borderRadius: 2,
            background: hoveredIndex === index 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              background: 'rgba(255,255,255,0.15)',
              transform: 'translateX(4px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {renderItem ? renderItem(item, index) : (
            <ListItem disablePadding>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {item.icon || item.name?.charAt(0) || '?'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={item.title || item.name || 'Sans titre'}
                secondary={item.description || item.amount ? `${item.amount}€` : ''}
                primaryTypographyProps={{
                  sx: { 
                    fontWeight: 600,
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }
                }}
                secondaryTypographyProps={{
                  sx: { 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </ListItem>
          )}
        </Box>
      </div>
    );
  }, [items, hoveredIndex, renderItem]);

  // État de chargement
  if (loading && showSkeleton) {
    return (
      <Box sx={{ height, overflow: 'hidden' }}>
        {[...Array(10)].map((_, index) => (
          <Skeleton 
            key={index}
            variant="rectangular" 
            height={itemHeight - 16} 
            sx={{ mx: 2, my: 1, borderRadius: 2 }} 
          />
        ))}
      </Box>
    );
  }

  // État vide
  if (items.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'rgba(255,255,255,0.6)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Aucun élément à afficher pour le moment
        </Typography>
      </Box>
    );
  }

  // Liste virtualisée
  return (
    <Box sx={{ height, overflow: 'hidden' }}>
      <VirtualList
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        width="100%"
        itemData={items}
      >
        {renderListItem}
      </VirtualList>
    </Box>
  );
};

// Composant optimisé pour les transactions
export const VirtualizedTransactions = ({ transactions = [], loading = false }) => {
  const renderTransaction = useCallback((transaction, index) => {
    const isIncome = transaction.type === 'income';
    const color = isIncome ? '#4caf50' : '#f44336';
    const icon = isIncome ? '💰' : '💸';
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box sx={{ 
            mr: 2, 
            fontSize: '1.5rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ 
              fontWeight: 600,
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              {transaction.category || transaction.type}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255,255,255,0.7)',
              display: 'block'
            }}>
              {new Date(transaction.date).toLocaleDateString('fr-FR')}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" sx={{ 
          fontWeight: 700,
          color: color,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {isIncome ? '+' : '-'}{transaction.amount?.toLocaleString()}€
        </Typography>
      </Box>
    );
  }, []);

  return (
    <VirtualizedList
      items={transactions}
      height={400}
      itemHeight={70}
      renderItem={renderTransaction}
      loading={loading}
      emptyMessage="Aucune transaction"
    />
  );
};

// Composant optimisé pour les recommandations
export const VirtualizedRecommendations = ({ recommendations = [], loading = false, onActionClick }) => {
  const renderRecommendation = useCallback((recommendation, index) => {
    const getColor = (type) => {
      switch (type) {
        case 'success': return '#4caf50';
        case 'warning': return '#ff9800';
        case 'error': return '#f44336';
        default: return '#2196f3';
      }
    };

    const getIcon = (type) => {
      switch (type) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'error': return '🚨';
        default: return '💡';
      }
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ fontSize: '1.2rem' }}>
            {getIcon(recommendation.type)}
          </Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            flex: 1
          }}>
            {recommendation.title}
          </Typography>
          <Box sx={{ 
            px: 1, 
            py: 0.5, 
            borderRadius: 1, 
            bgcolor: getColor(recommendation.type),
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'white'
          }}>
            {recommendation.priority}
          </Box>
        </Box>
        <Typography variant="body2" sx={{ 
          color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.4
        }}>
          {recommendation.message}
        </Typography>
        {recommendation.action && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box
              component="button"
              onClick={() => onActionClick?.(recommendation)}
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 2,
                bgcolor: getColor(recommendation.type),
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }
              }}
            >
              {recommendation.action}
            </Box>
          </Box>
        )}
      </Box>
    );
  }, [onActionClick]);

  return (
    <VirtualizedList
      items={recommendations}
      height={400}
      itemHeight={120}
      renderItem={renderRecommendation}
      loading={loading}
      emptyMessage="Aucune recommandation"
    />
  );
};

export default VirtualizedList; 