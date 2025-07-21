import React, { useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip,
  Avatar,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import { 
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Savings as SavingsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';
import CurrencyFormatter from '../CurrencyFormatter';

const AIAssistant = () => {
  const { t } = useTranslation();
  const {
    expenses,
    incomeTransactions,
    savings,
    debts,
    revenus,
    selectedMonth,
    selectedYear,
    getSelectedMonthIndex,
    isFeatureAvailable,
    getCurrentPlan
  } = useStore();

  const [expanded, setExpanded] = useState(false);
  const currentPlan = getCurrentPlan();
  const selectedMonthIndex = getSelectedMonthIndex();

  // Calculs pour l'analyse IA
  const analysis = useMemo(() => {
    const currentMonth = selectedMonthIndex;
    
    // Dépenses du mois
    const monthlyExpenses = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === selectedMonth && 
               expDate.getFullYear() === selectedYear;
      })
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    // Revenus du mois
    const monthlyIncome = revenus[currentMonth] || 0;
    const monthlyIncomeTransactions = incomeTransactions
      .filter(inc => {
        const incDate = new Date(inc.date);
        return incDate.getMonth() === selectedMonth && 
               incDate.getFullYear() === selectedYear;
      })
      .reduce((sum, inc) => sum + (inc.amount || 0), 0);
    
    const totalIncome = monthlyIncome + monthlyIncomeTransactions;
    const balance = totalIncome - monthlyExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    
    // Analyse des catégories de dépenses
    const expenseCategories = {};
    expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === selectedMonth && 
               expDate.getFullYear() === selectedYear;
      })
      .forEach(exp => {
        expenseCategories[exp.category] = (expenseCategories[exp.category] || 0) + exp.amount;
      });
    
    const topExpenseCategory = Object.entries(expenseCategories)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Dettes totales
    const totalDebts = debts.reduce((sum, debt) => sum + (debt.amount - (debt.paidAmount || 0)), 0);
    
    // Épargne totale
    const totalSavings = savings.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
    
    return {
      monthlyExpenses,
      totalIncome,
      balance,
      savingsRate,
      topExpenseCategory,
      totalDebts,
      totalSavings,
      expenseCategories
    };
  }, [selectedMonthIndex, selectedMonth, selectedYear, expenses, incomeTransactions, revenus, debts, savings]);

  // Génération des recommandations IA
  const recommendations = useMemo(() => {
    const recs = [];
    
    // Recommandation basée sur le solde
    if (analysis.balance < 0) {
      recs.push({
        type: 'warning',
        icon: <WarningIcon color="warning" />,
        title: 'Déficit budgétaire',
        description: `Vous avez dépensé ${Math.abs(analysis.balance)}€ de plus que vos revenus ce mois-ci.`,
        action: 'Réduire les dépenses non essentielles',
        priority: 'high'
      });
    } else if (analysis.balance > 0) {
      recs.push({
        type: 'success',
        icon: <CheckCircleIcon color="success" />,
        title: 'Excellent !',
        description: `Vous avez économisé ${analysis.balance}€ ce mois-ci.`,
        action: 'Continuez sur cette lancée !',
        priority: 'low'
      });
    }
    
    // Recommandation basée sur le taux d'épargne
    if (analysis.savingsRate < 10 && analysis.totalIncome > 0) {
      recs.push({
        type: 'info',
        icon: <SavingsIcon color="info" />,
        title: 'Taux d\'épargne faible',
        description: `Votre taux d'épargne est de ${analysis.savingsRate.toFixed(1)}%.`,
        action: 'Visez au moins 10% de vos revenus',
        priority: 'medium'
      });
    }
    
    // Recommandation basée sur les dettes
    if (analysis.totalDebts > 0) {
      recs.push({
        type: 'warning',
        icon: <TrendingDownIcon color="error" />,
        title: 'Dettes en cours',
        description: `Vous avez ${analysis.totalDebts}€ de dettes restantes.`,
        action: 'Priorisez le remboursement des dettes',
        priority: 'high'
      });
    }
    
    // Recommandation basée sur la catégorie de dépenses la plus élevée
    if (analysis.topExpenseCategory) {
      const [category, amount] = analysis.topExpenseCategory;
      const percentage = (amount / analysis.totalIncome) * 100;
      
      if (percentage > 30) {
        recs.push({
          type: 'info',
          icon: <LightbulbIcon color="primary" />,
          title: 'Catégorie dominante',
          description: `${category} représente ${percentage.toFixed(1)}% de vos revenus.`,
          action: 'Envisagez de réduire cette catégorie',
          priority: 'medium'
        });
      }
    }
    
    // Recommandation pour l'épargne
    if (analysis.totalSavings === 0 && analysis.balance > 0) {
      recs.push({
        type: 'info',
        icon: <SavingsIcon color="primary" />,
        title: 'Pas d\'objectif d\'épargne',
        description: 'Vous pourriez créer un objectif d\'épargne.',
        action: 'Créer un objectif d\'épargne',
        priority: 'low'
      });
    }
    
    return recs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [analysis]);

  const handleToggleExpand = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  // Ne pas afficher si l'IA n'est pas disponible
  if (!isFeatureAvailable('aiAnalysis')) {
    return null;
  }

  const hasRecommendations = recommendations.length > 0;
  const topRecommendation = recommendations[0];

  return (
    <Fade in timeout={800}>
      <Card sx={{ 
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba205 100%)',
        border: '1px solid #667eea30',
        borderRadius: 3,
        mb: 2
      }}>
        <CardContent sx={{ p: 3 }}>
          {/* En-tête */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#667eea', width: 40, height: 40 }}>
                <AIIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  IA Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Conseils personnalisés
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentPlan.name !== 'subscription.free' && (
                <Chip 
                  label={currentPlan.name === 'subscription.premium' ? 'Premium' : 'Pro'}
                  icon={<StarIcon />}
                  size="small"
                  color="primary"
                />
              )}
              <IconButton onClick={handleToggleExpand} size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Recommandation principale */}
          {hasRecommendations && (
            <Zoom in timeout={300}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {topRecommendation.icon}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {topRecommendation.title}
                  </Typography>
                  <Chip 
                    label={topRecommendation.priority === 'high' ? 'Important' : topRecommendation.priority === 'medium' ? 'Conseil' : 'Info'}
                    size="small"
                    color={topRecommendation.priority === 'high' ? 'error' : topRecommendation.priority === 'medium' ? 'warning' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {topRecommendation.description}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ borderColor: '#667eea', color: '#667eea' }}
                >
                  {topRecommendation.action}
                </Button>
              </Box>
            </Zoom>
          )}

          {/* Toutes les recommandations (expandable) */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 2 }} />
            <List dense>
              {recommendations.slice(1).map((rec, index) => (
                <Slide direction="up" in timeout={400 + index * 100} key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {rec.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={rec.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {rec.description}
                          </Typography>
                          <Button 
                            variant="text" 
                            size="small"
                            sx={{ mt: 0.5, p: 0, minWidth: 'auto' }}
                          >
                            {rec.action}
                          </Button>
                        </Box>
                      }
                    />
                  </ListItem>
                </Slide>
              ))}
            </List>
          </Collapse>

          {/* Statistiques rapides */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {analysis.savingsRate.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Taux d'épargne
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {Object.keys(analysis.expenseCategories).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Catégories utilisées
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default AIAssistant; 