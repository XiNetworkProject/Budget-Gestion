import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  IconButton, 
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  useTheme,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Savings,
  AccountBalance,
  Notifications,
  Add,
  MoreVert,
  Star,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
  CheckCircle,
  Warning,
  Info,
  SmartToy,
  Psychology
} from '@mui/icons-material';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import CurrencyFormatter from '../components/CurrencyFormatter';
import { DESIGN_SYSTEM } from '../theme/designSystem';
import { FinancialCharts } from '../components/optimized/OptimizedCharts';
import useOptimizedData from '../hooks/useOptimizedData';

// Composant de carte de métrique moderne
const ModernMetricCard = memo(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  gradient, 
  trend, 
  trendValue, 
  onClick 
}) => {
  const theme = useTheme();

  return (
    <Zoom in timeout={600}>
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          background: gradient || theme.palette.background.paper,
          borderRadius: DESIGN_SYSTEM.borderRadius['2xl'],
          boxShadow: DESIGN_SYSTEM.shadows.md,
          border: `1px solid ${theme.palette.divider}`,
          cursor: onClick ? 'pointer' : 'default',
          transition: `all ${DESIGN_SYSTEM.transitions.duration.normal} ${DESIGN_SYSTEM.transitions.easing.ease}`,
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: DESIGN_SYSTEM.shadows.xl,
          },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: color,
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: gradient ? 'white' : theme.palette.text.secondary,
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                  mb: 1,
                  opacity: 0.8,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
                  color: gradient ? 'white' : theme.palette.text.primary,
                  mb: 1,
                }}
              >
                {value}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: gradient ? 'rgba(255,255,255,0.8)' : theme.palette.text.secondary,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: gradient ? 'rgba(255,255,255,0.2)' : color,
                color: gradient ? 'white' : 'white',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Icon />
            </Avatar>
          </Box>

          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {trend === 'up' ? (
                <TrendingUpIcon sx={{ color: '#10b981', fontSize: 20 }} />
              ) : trend === 'down' ? (
                <TrendingDownIcon sx={{ color: '#ef4444', fontSize: 20 }} />
              ) : (
                <RemoveIcon sx={{ color: '#6b7280', fontSize: 20 }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: gradient ? 'rgba(255,255,255,0.9)' : theme.palette.text.secondary,
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                }}
              >
                {trendValue}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
});

ModernMetricCard.displayName = 'ModernMetricCard';

// Composant de carte d'action rapide
const QuickActionCard = memo(({ title, description, icon: Icon, color, gradient, onClick }) => {
  const theme = useTheme();

  return (
    <Slide direction="up" in timeout={800}>
      <Card
        onClick={onClick}
        sx={{
          background: gradient || theme.palette.background.paper,
          borderRadius: DESIGN_SYSTEM.borderRadius.xl,
          boxShadow: DESIGN_SYSTEM.shadows.md,
          border: `1px solid ${theme.palette.divider}`,
          cursor: 'pointer',
          transition: `all ${DESIGN_SYSTEM.transitions.duration.normal} ${DESIGN_SYSTEM.transitions.easing.ease}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: DESIGN_SYSTEM.shadows.lg,
          },
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              background: gradient || color,
              color: 'white',
              mx: 'auto',
              mb: 2,
              boxShadow: DESIGN_SYSTEM.shadows.md,
            }}
          >
            <Icon />
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
              color: gradient ? 'white' : theme.palette.text.primary,
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: gradient ? 'rgba(255,255,255,0.8)' : theme.palette.text.secondary,
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Slide>
  );
});

QuickActionCard.displayName = 'QuickActionCard';

// Composant de transaction récente
const RecentTransaction = memo(({ transaction }) => {
  const theme = useTheme();
  const isExpense = transaction.type === 'expense';

  return (
    <ListItem sx={{ px: 0, py: 1 }}>
      <ListItemAvatar>
        <Avatar
          sx={{
            background: isExpense 
              ? DESIGN_SYSTEM.gradients.error 
              : DESIGN_SYSTEM.gradients.success,
            color: 'white',
          }}
        >
          {isExpense ? <TrendingDown /> : <TrendingUp />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={transaction.description}
        secondary={transaction.category}
        primaryTypographyProps={{
          fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
          color: theme.palette.text.primary,
        }}
        secondaryTypographyProps={{
          color: theme.palette.text.secondary,
        }}
      />
      <ListItemSecondaryAction>
        <Typography
          variant="body1"
          sx={{
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
            color: isExpense ? '#ef4444' : '#10b981',
          }}
        >
          {isExpense ? '-' : '+'}
          <CurrencyFormatter value={transaction.amount} />
        </Typography>
      </ListItemSecondaryAction>
    </ListItem>
  );
});

RecentTransaction.displayName = 'RecentTransaction';

// Composant principal de la page Home moderne
const HomeOptimized = memo(() => {
  const theme = useTheme();
  const { t } = useTranslation();
  const store = useStore();
  const optimizedData = useOptimizedData();

  const {
    user,
    selectedMonth,
    selectedYear,
    expenses,
    incomeTransactions,
    selectedMonthSaved,
    serverConnected,
    logout,
    getMonthName,
    getSubscriptionIcon,
    getSubscriptionText,
    getSubscriptionColor,
    navigateMonth
  } = store;

  // Calculer les métriques
  const metrics = useMemo(() => {
    const currentMonthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
    });

    const currentMonthIncome = incomeTransactions.filter(i => {
      const incomeDate = new Date(i.date);
      return incomeDate.getMonth() === selectedMonth && incomeDate.getFullYear() === selectedYear;
    });

    const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = currentMonthIncome.reduce((sum, i) => sum + i.amount, 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
      transactionsCount: currentMonthExpenses.length + currentMonthIncome.length
    };
  }, [expenses, incomeTransactions, selectedMonth, selectedYear]);

  // Actions rapides
  const quickActions = [
    {
      title: t('home.quickActions.addExpense'),
      description: t('home.quickActions.addExpenseDesc'),
      icon: TrendingDown,
      color: '#ef4444',
      gradient: DESIGN_SYSTEM.gradients.error,
      action: () => console.log('Add Expense')
    },
    {
      title: t('home.quickActions.addIncome'),
      description: t('home.quickActions.addIncomeDesc'),
      icon: TrendingUp,
      color: '#10b981',
      gradient: DESIGN_SYSTEM.gradients.success,
      action: () => console.log('Add Income')
    },
    {
      title: t('home.quickActions.aiAnalysis'),
      description: t('home.quickActions.aiAnalysisDesc'),
      icon: SmartToy,
      color: '#8b5cf6',
      gradient: DESIGN_SYSTEM.gradients.secondary,
      action: () => console.log('AI Analysis')
    },
    {
      title: t('home.quickActions.gamification'),
      description: t('home.quickActions.gamificationDesc'),
      icon: Psychology,
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      action: () => console.log('Gamification')
    }
  ];

  // Transactions récentes
  const recentTransactions = useMemo(() => {
    const allTransactions = [
      ...expenses.map(e => ({ ...e, type: 'expense' })),
      ...incomeTransactions.map(i => ({ ...i, type: 'income' }))
    ];
    
    return allTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [expenses, incomeTransactions]);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* En-tête avec informations utilisateur */}
      <Fade in timeout={300}>
        <Card
          sx={{
            mb: 4,
            background: DESIGN_SYSTEM.gradients.primary,
            borderRadius: DESIGN_SYSTEM.borderRadius['2xl'],
            boxShadow: DESIGN_SYSTEM.shadows.lg,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
                    mb: 1,
                  }}
                >
                  {t('home.welcome')}, {user?.name || 'Utilisateur'}!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.9,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                  }}
                >
                  {getMonthName(selectedMonth)} {selectedYear}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {serverConnected && (
                  <Chip
                    icon={<CheckCircle />}
                    label={t('home.connected')}
                    size="small"
                    sx={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#10b981',
                      fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                    }}
                  />
                )}
                <IconButton
                  sx={{
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  <Notifications />
                </IconButton>
              </Box>
            </Box>

            {/* Solde principal */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <CurrencyFormatter value={selectedMonthSaved} />
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                }}
              >
                {t('home.savings')} {t('home.thisMonth')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Métriques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ModernMetricCard
            title={t('home.revenues')}
            value={<CurrencyFormatter value={metrics.totalIncome} />}
            subtitle={t('home.thisMonth')}
            icon={TrendingUp}
            color="#10b981"
            gradient={DESIGN_SYSTEM.gradients.success}
            trend="up"
            trendValue="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernMetricCard
            title={t('home.expenses')}
            value={<CurrencyFormatter value={metrics.totalExpenses} />}
            subtitle={t('home.thisMonth')}
            icon={TrendingDown}
            color="#ef4444"
            gradient={DESIGN_SYSTEM.gradients.error}
            trend="down"
            trendValue="-8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernMetricCard
            title={t('home.savings')}
            value={<CurrencyFormatter value={metrics.savings} />}
            subtitle={`${metrics.savingsRate.toFixed(1)}% ${t('home.savingsRate')}`}
            icon={Savings}
            color="#3b82f6"
            gradient={DESIGN_SYSTEM.gradients.primary}
            trend={metrics.savingsRate > 20 ? "up" : "down"}
            trendValue={metrics.savingsRate > 20 ? "Excellent" : "À améliorer"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernMetricCard
            title={t('home.transactions')}
            value={metrics.transactionsCount}
            subtitle={t('home.thisMonth')}
            icon={AccountBalance}
            color="#8b5cf6"
            gradient={DESIGN_SYSTEM.gradients.secondary}
            trend="up"
            trendValue="+5"
          />
        </Grid>
      </Grid>

      {/* Actions rapides */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
          mb: 3,
          color: theme.palette.text.primary,
        }}
      >
        {t('home.quickActions')}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <QuickActionCard
              title={action.title}
              description={action.description}
              icon={action.icon}
              color={action.color}
              gradient={action.gradient}
              onClick={action.action}
            />
          </Grid>
        ))}
      </Grid>

      {/* Graphiques et transactions récentes */}
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: DESIGN_SYSTEM.borderRadius['2xl'],
              boxShadow: DESIGN_SYSTEM.shadows.md,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                {t('home.financialEvolution')}
              </Typography>
              <FinancialCharts
                lineData={null}
                doughnutData={null}
                loading={false}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              borderRadius: DESIGN_SYSTEM.borderRadius['2xl'],
              boxShadow: DESIGN_SYSTEM.shadows.md,
              border: `1px solid ${theme.palette.divider}`,
              height: 'fit-content',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                {t('home.recentTransactions')}
              </Typography>
              
              {recentTransactions.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recentTransactions.map((transaction, index) => (
                    <React.Fragment key={transaction.id || index}>
                      <RecentTransaction transaction={transaction} />
                      {index < recentTransactions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Info sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                    }}
                  >
                    {t('home.noTransactions')}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{
                      mt: 2,
                      background: DESIGN_SYSTEM.gradients.primary,
                      '&:hover': {
                        background: DESIGN_SYSTEM.gradients.primary,
                      }
                    }}
                  >
                    {t('home.addFirstTransaction')}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
});

HomeOptimized.displayName = 'HomeOptimized';

export default HomeOptimized; 