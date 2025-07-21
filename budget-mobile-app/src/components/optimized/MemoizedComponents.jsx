import React, { memo, useMemo, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import CurrencyFormatter from '../CurrencyFormatter';

// Composant de carte optimisé
export const OptimizedCard = memo(({ children, ...props }) => (
  <Card 
    elevation={2}
    sx={{ 
      borderRadius: 2,
      transition: 'all 0.2s ease-in-out',
      '&:hover': { 
        elevation: 4,
        transform: 'translateY(-2px)'
      }
    }}
    {...props}
  >
    {children}
  </Card>
));

// Composant de métrique optimisé
export const MetricCard = memo(({ title, value, trend, color, icon, subtitle }) => {
  const trendIcon = useMemo(() => {
    if (trend > 0) return <TrendingUp color="success" />;
    if (trend < 0) return <TrendingDown color="error" />;
    return <Remove color="action" />;
  }, [trend]);

  const trendColor = useMemo(() => {
    if (trend > 0) return 'success.main';
    if (trend < 0) return 'error.main';
    return 'text.secondary';
  }, [trend]);

  return (
    <OptimizedCard>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {icon}
        </Box>
        
        <Typography variant="h6" component="div" color={color} mb={0.5}>
          <CurrencyFormatter value={value} />
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        
        {trend !== undefined && (
          <Box display="flex" alignItems="center" mt={1}>
            {trendIcon}
            <Typography 
              variant="caption" 
              color={trendColor}
              ml={0.5}
            >
              {Math.abs(trend)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </OptimizedCard>
  );
});

// Composant de progression optimisé
export const ProgressCard = memo(({ title, current, target, color, showPercentage = true }) => {
  const progress = useMemo(() => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  }, [current, target]);

  const percentage = useMemo(() => {
    if (target === 0) return 0;
    return Math.round((current / target) * 100);
  }, [current, target]);

  return (
    <OptimizedCard>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {showPercentage && (
            <Chip 
              label={`${percentage}%`}
              size="small"
              color={progress >= 100 ? "success" : "default"}
            />
          )}
        </Box>
        
        <Typography variant="h6" color={color} mb={1}>
          <CurrencyFormatter value={current} />
          <Typography component="span" variant="body2" color="text.secondary">
            {' '}/ <CurrencyFormatter value={target} />
          </Typography>
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={progress}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: color
            }
          }}
        />
      </CardContent>
    </OptimizedCard>
  );
});

// Hook personnalisé pour les calculs coûteux
export const useMemoizedCalculations = (data, categories, months) => {
  return useMemo(() => {
    const totals = {};
    const trends = {};
    
    categories.forEach(category => {
      const values = data[category] || [];
      totals[category] = values.reduce((sum, val) => sum + (val || 0), 0);
      
      if (values.length >= 2) {
        const current = values[values.length - 1] || 0;
        const previous = values[values.length - 2] || 0;
        trends[category] = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      }
    });
    
    return { totals, trends };
  }, [data, categories, months]);
};

// Hook pour les actions optimisées
export const useOptimizedActions = () => {
  const handleQuickAdd = useCallback((type, amount) => {
    // Logique d'ajout rapide optimisée
    console.log(`Ajout rapide: ${type} - ${amount}`);
  }, []);

  const handleCategoryEdit = useCallback((category, newValue) => {
    // Logique d'édition optimisée
    console.log(`Édition catégorie: ${category} - ${newValue}`);
  }, []);

  return { handleQuickAdd, handleCategoryEdit };
}; 