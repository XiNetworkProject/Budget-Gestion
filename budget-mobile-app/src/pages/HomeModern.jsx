import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Grid, 
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Add,
  Refresh,
  Star,
  Diamond,
  CardMembership,
  Notifications,
  Psychology,
  SmartToy,
  Assignment,
  History,
  AccountBalance,
  Savings
} from '@mui/icons-material';

// Composants modernes
import ModernPageLayout, { 
  ModernMetricCard, 
  ModernSection, 
  ModernList, 
  QuickActionButton,
  StatusChip 
} from '../components/optimized/ModernPageLayout';
import CurrencyFormatter from '../components/CurrencyFormatter';
import { useOptimizedData } from '../hooks/useOptimizedData';

const HomeModern = () => {
  const { 
    selectedMonth, 
    selectedYear, 
    setSelectedMonth, 
    setSelectedYear,
    isAuthenticated,
    user,
    expenses,
    incomeTransactions,
    savings,
    debts,
    getCurrentPlan,
    isFeatureAvailable
  } = useStore();
  
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Utilisation du hook optimisé pour les données
  const { 
    selectedMonthData, 
    forecast, 
    recommendations, 
    isCalculating, 
    hasData 
  } = useOptimizedData();

  // Fonctions memoizées
  const getMonthName = useCallback((month, year) => {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${monthNames[month]} ${year}`;
  }, []);

  const navigateMonth = useCallback((direction) => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;
    
    if (direction === 'next') {
      newMonth = (newMonth + 1) % 12;
      if (newMonth === 0) newYear++;
    } else {
      newMonth = (newMonth - 1 + 12) % 12;
      if (newMonth === 11) newYear--;
    }
    
    setSelectedMonth(newMonth, newYear);
  }, [selectedMonth, selectedYear, setSelectedMonth]);

  // Calculs memoizés
  const currentMonthStats = useMemo(() => {
    const currentMonth = new Date(selectedYear, selectedMonth);
    const currentMonthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth.getMonth() && 
             expDate.getFullYear() === currentMonth.getFullYear();
    });
    
    const currentMonthIncome = incomeTransactions.filter(inc => {
      const incDate = new Date(inc.date);
      return incDate.getMonth() === currentMonth.getMonth() && 
             incDate.getFullYear() === currentMonth.getFullYear();
    });

    const totalExpenses = currentMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalIncome = currentMonthIncome.reduce((sum, inc) => sum + (inc.amount || 0), 0);
    const balance = totalIncome - totalExpenses;

    return {
      expenses: totalExpenses,
      income: totalIncome,
      balance,
      expenseCount: currentMonthExpenses.length,
      incomeCount: currentMonthIncome.length
    };
  }, [expenses, incomeTransactions, selectedMonth, selectedYear]);

  // Actions rapides
  const quickActions = [
    {
      icon: Add,
      label: 'Ajouter une dépense',
      color: '#f44336',
      onClick: () => navigate('/quick-add')
    },
    {
      icon: TrendingUp,
      label: 'Ajouter un revenu',
      color: '#4caf50',
      onClick: () => navigate('/income')
    },
    {
      icon: Savings,
      label: 'Objectif d\'épargne',
      color: '#9c27b0',
      onClick: () => navigate('/savings')
    },
    {
      icon: AccountBalance,
      label: 'Gérer les dettes',
      color: '#ff5722',
      onClick: () => navigate('/debts')
    }
  ];

  // Fonctionnalités premium
  const premiumFeatures = [
    {
      icon: Psychology,
      label: 'Analyses IA',
      description: 'Prévisions intelligentes et recommandations personnalisées',
      color: '#9c27b0',
      path: '/ai-dashboard'
    },
    {
      icon: Assignment,
      label: 'Plans d\'action',
      description: 'Objectifs personnalisés et suivi des progrès',
      color: '#3f51b5',
      path: '/action-plans'
    },
    {
      icon: SmartToy,
      label: 'Assistant IA',
      description: 'Conseils personnalisés pour optimiser votre budget',
      color: '#00bcd4',
      path: '/ai-assistant'
    }
  ];

  return (
    <ModernPageLayout
      title="Tableau de bord"
      subtitle={`${getMonthName(selectedMonth, selectedYear)} - Vue d'ensemble de vos finances`}
      actions={
        <>
          <Tooltip title="Mois précédent" arrow>
            <IconButton
              onClick={() => navigateMonth('prev')}
              sx={{ color: 'white' }}
            >
              <TrendingDown />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mois suivant" arrow>
            <IconButton
              onClick={() => navigateMonth('next')}
              sx={{ color: 'white' }}
            >
              <TrendingUp />
            </IconButton>
          </Tooltip>
          <Tooltip title="Actualiser" arrow>
            <IconButton
              onClick={() => window.location.reload()}
              sx={{ color: 'white' }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      {/* Métriques principales */}
      <ModernSection title="Métriques du mois" subtitle="Vue d'ensemble de vos finances">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <ModernMetricCard
              title="Revenus"
              value={<CurrencyFormatter amount={currentMonthStats.income} />}
              icon={TrendingUp}
              color="#4caf50"
              subtitle={`${currentMonthStats.incomeCount} transactions`}
              trend={forecast?.incomeTrend}
              trendDirection={forecast?.incomeTrend > 0 ? 'up' : 'down'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ModernMetricCard
              title="Dépenses"
              value={<CurrencyFormatter amount={currentMonthStats.expenses} />}
              icon={TrendingDown}
              color="#f44336"
              subtitle={`${currentMonthStats.expenseCount} transactions`}
              trend={forecast?.expenseTrend}
              trendDirection={forecast?.expenseTrend > 0 ? 'up' : 'down'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ModernMetricCard
              title="Solde"
              value={<CurrencyFormatter amount={currentMonthStats.balance} />}
              icon={currentMonthStats.balance >= 0 ? TrendingUp : TrendingDown}
              color={currentMonthStats.balance >= 0 ? '#4caf50' : '#f44336'}
              subtitle={currentMonthStats.balance >= 0 ? 'Positif' : 'Négatif'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ModernMetricCard
              title="Épargne"
              value={savings?.length || 0}
              icon={Savings}
              color="#9c27b0"
              subtitle="Objectifs actifs"
              badge={savings?.filter(s => s.progress < 100).length || 0}
            />
          </Grid>
        </Grid>
      </ModernSection>

      {/* Actions rapides */}
      <ModernSection title="Actions rapides" subtitle="Accédez rapidement aux fonctionnalités principales">
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {quickActions.map((action, index) => (
            <Zoom in timeout={300 + index * 100} key={action.label}>
              <QuickActionButton
                icon={action.icon}
                label={action.label}
                color={action.color}
                onClick={action.onClick}
              />
            </Zoom>
          ))}
        </Box>
      </ModernSection>

      {/* Recommandations */}
      {recommendations && recommendations.length > 0 && (
        <ModernSection title="Recommandations intelligentes" subtitle="Basées sur vos habitudes">
          <ModernList
            items={recommendations}
            renderItem={(recommendation, index) => (
              <Box
                key={index}
                sx={{
                  p: 3,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      boxShadow: '0 4px 16px rgba(33, 150, 243, 0.3)'
                    }}
                  >
                    <Psychology sx={{ fontSize: 20, color: 'white' }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', mb: 1 }}>
                      {recommendation.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                      {recommendation.description}
                    </Typography>
                    {recommendation.action && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => recommendation.action()}
                        sx={{
                          borderColor: 'rgba(255,255,255,0.3)',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'rgba(255,255,255,0.5)',
                            background: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        {recommendation.actionLabel}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          />
        </ModernSection>
      )}

      {/* Fonctionnalités Premium */}
      {!isFeatureAvailable('aiAnalysis') && (
        <ModernSection 
          title="Débloquez les fonctionnalités Premium" 
          subtitle="Accédez à l'IA et aux analyses avancées"
          action="Voir les plans"
          onActionClick={() => navigate('/subscription')}
        >
          <Grid container spacing={3}>
            {premiumFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={feature.label}>
                <Zoom in timeout={400 + index * 100}>
                  <Box
                    sx={{
                      p: 3,
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => navigate('/subscription')}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`,
                        boxShadow: `0 4px 16px ${feature.color}40`,
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <feature.icon sx={{ fontSize: 28, color: 'white' }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 1 }}>
                      {feature.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      {feature.description}
                    </Typography>
                    <Chip
                      icon={<Star sx={{ fontSize: 16 }} />}
                      label="Premium"
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </ModernSection>
      )}

      {/* Statut de l'abonnement */}
      {isAuthenticated && (
        <Box sx={{ 
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1000
        }}>
          <Tooltip title="Votre abonnement actuel" arrow>
            <Chip
              icon={getCurrentPlan()?.id === 'premium' ? <Star /> : 
                    getCurrentPlan()?.id === 'pro' ? <Diamond /> : <CardMembership />}
              label={getCurrentPlan()?.name || 'Gratuit'}
              sx={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.15)',
                }
              }}
            />
          </Tooltip>
        </Box>
      )}
    </ModernPageLayout>
  );
};

export default HomeModern; 