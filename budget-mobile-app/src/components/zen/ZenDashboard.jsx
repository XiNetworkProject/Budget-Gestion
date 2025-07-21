import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Fade, 
  Zoom, 
  Fab, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Remove,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  Psychology,
  Lightbulb,
  Menu,
  Close,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useStore } from '../../store';
import { MetricCard, ProgressCard } from '../optimized/MemoizedComponents';
import { useTranslation } from 'react-i18next';

const ZenDashboard = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  
  const {
    data,
    categories,
    revenus,
    incomes,
    expenses,
    savings,
    selectedMonth,
    selectedYear,
    appSettings
  } = useStore();

  // Calculs optimisés pour le mode zen
  const zenMetrics = useMemo(() => {
    const currentMonthIndex = selectedMonth;
    const currentMonthData = categories.map(cat => data[cat]?.[currentMonthIndex] || 0);
    const totalExpenses = currentMonthData.reduce((sum, val) => sum + val, 0);
    const totalIncome = revenus[currentMonthIndex] || 0;
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    return {
      balance,
      totalExpenses,
      totalIncome,
      savingsRate,
      trend: balance > 0 ? 'positive' : 'negative'
    };
  }, [data, categories, revenus, selectedMonth]);

  // Vue d'ensemble zen
  const ZenOverview = () => (
    <Fade in timeout={800}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        {/* Indicateur principal */}
        <Zoom in timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="div" color="primary" gutterBottom>
              {zenMetrics.balance >= 0 ? '+' : ''}{zenMetrics.balance.toFixed(0)}€
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {zenMetrics.balance >= 0 ? 'Solde positif' : 'Solde négatif'}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(Math.abs(zenMetrics.savingsRate), 100)}
              sx={{ 
                mt: 2, 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: zenMetrics.balance >= 0 ? 'success.main' : 'error.main'
                }
              }}
            />
          </Box>
        </Zoom>

        {/* Actions rapides */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Fab 
            color="primary" 
            size="large"
            onClick={() => setCurrentView('add-expense')}
            sx={{ 
              background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
              '&:hover': { background: 'linear-gradient(45deg, #FF5252, #FF7676)' }
            }}
          >
            <Remove />
          </Fab>
          <Fab 
            color="secondary" 
            size="large"
            onClick={() => setCurrentView('add-income')}
            sx={{ 
              background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
              '&:hover': { background: 'linear-gradient(45deg, #26A69A, #00897B)' }
            }}
          >
            <Add />
          </Fab>
        </Box>

        {/* Insight du jour */}
        <Fade in timeout={1200}>
          <Box sx={{ 
            p: 3, 
            borderRadius: 3, 
            bgcolor: 'background.paper',
            boxShadow: 2,
            maxWidth: 400,
            mx: 'auto'
          }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Lightbulb color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Insight du jour</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {zenMetrics.balance >= 0 
                ? "Excellent ! Vous êtes en bonne voie pour atteindre vos objectifs d'épargne."
                : "Pas d'inquiétude, concentrez-vous sur vos priorités ce mois-ci."
              }
            </Typography>
          </Box>
        </Fade>
      </Box>
    </Fade>
  );

  // Vue d'ajout rapide
  const QuickAddView = ({ type }) => (
    <Fade in timeout={600}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            {type === 'expense' ? 'Ajouter une dépense' : 'Ajouter un revenu'}
          </Typography>
          <IconButton onClick={() => setCurrentView('overview')}>
            <Close />
          </IconButton>
        </Box>
        
        {/* Interface d'ajout rapide simplifiée */}
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h2" color="primary" gutterBottom>
            {type === 'expense' ? '-' : '+'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {type === 'expense' ? 'Montant de la dépense' : 'Montant du revenu'}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );

  // Menu latéral zen
  const ZenMenu = () => (
    <Drawer
      anchor="left"
      open={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
      PaperProps={{
        sx: { 
          width: 280,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Menu Zen</Typography>
          <IconButton onClick={() => setIsMenuOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
        
        <List>
          <ListItem button onClick={() => { setCurrentView('overview'); setIsMenuOpen(false); }}>
            <ListItemIcon sx={{ color: 'white' }}>
              <AccountBalance />
            </ListItemIcon>
            <ListItemText primary="Vue d'ensemble" />
          </ListItem>
          
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 1 }} />
          
          <ListItem button onClick={() => { setCurrentView('analytics'); setIsMenuOpen(false); }}>
            <ListItemIcon sx={{ color: 'white' }}>
              <TrendingUp />
            </ListItemIcon>
            <ListItemText primary="Analyses" />
          </ListItem>
          
          <ListItem button onClick={() => { setCurrentView('savings'); setIsMenuOpen(false); }}>
            <ListItemIcon sx={{ color: 'white' }}>
              <Savings />
            </ListItemIcon>
            <ListItemText primary="Épargne" />
          </ListItem>
          
          <ListItem button onClick={() => { setCurrentView('ai'); setIsMenuOpen(false); }}>
            <ListItemIcon sx={{ color: 'white' }}>
              <Psychology />
            </ListItemIcon>
            <ListItemText primary="Conseils IA" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: appSettings.theme === 'dark' 
        ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      position: 'relative'
    }}>
      {/* Header zen */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <IconButton onClick={() => setIsMenuOpen(true)} sx={{ color: 'primary.main' }}>
          <Menu />
        </IconButton>
        
        <Typography variant="h6" color="primary">
          Budget Zen
        </Typography>
        
        <Chip 
          label={zenMetrics.trend === 'positive' ? '✓' : '⚠'} 
          color={zenMetrics.trend === 'positive' ? 'success' : 'warning'}
          size="small"
        />
      </Box>

      {/* Contenu principal */}
      <Box sx={{ flex: 1 }}>
        {currentView === 'overview' && <ZenOverview />}
        {currentView === 'add-expense' && <QuickAddView type="expense" />}
        {currentView === 'add-income' && <QuickAddView type="income" />}
      </Box>

      {/* Menu latéral */}
      <ZenMenu />
    </Box>
  );
};

export default ZenDashboard; 