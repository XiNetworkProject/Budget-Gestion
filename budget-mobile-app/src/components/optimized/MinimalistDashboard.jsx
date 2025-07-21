import React, { useMemo, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress,
  Chip,
  IconButton,
  Fade,
  Zoom,
  Slide,
  Avatar,
  Divider
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
  Savings as SavingsIcon,
  Psychology as AIIcon,
  Star as StarIcon,
  Diamond as DiamondIcon
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';
import CurrencyFormatter from '../CurrencyFormatter';
import AIAssistant from './AIAssistant';
import Gamification from './Gamification';

const MinimalistDashboard = () => {
  const { t } = useTranslation();
  const {
    data,
    months,
    selectedMonth,
    selectedYear,
    revenus,
    expenses,
    incomeTransactions,
    savings,
    debts,
    getCurrentPlan,
    getSelectedMonthIndex,
    isFeatureAvailable
  } = useStore();

  const currentPlan = getCurrentPlan();
  const selectedMonthIndex = getSelectedMonthIndex();

  // Calculs optimisés avec useMemo
  const dashboardData = useMemo(() => {
    const currentMonth = selectedMonthIndex;
    
    // Revenus du mois
    const monthlyIncome = revenus[currentMonth] || 0;
    
    // Dépenses du mois (depuis les transactions)
    const monthlyExpenses = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === selectedMonth && 
               expDate.getFullYear() === selectedYear;
      })
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    // Revenus du mois (depuis les transactions)
    const monthlyIncomeTransactions = incomeTransactions
      .filter(inc => {
        const incDate = new Date(inc.date);
        return incDate.getMonth() === selectedMonth && 
               incDate.getFullYear() === selectedYear;
      })
      .reduce((sum, inc) => sum + (inc.amount || 0), 0);
    
    // Total des revenus
    const totalIncome = monthlyIncome + monthlyIncomeTransactions;
    
    // Solde
    const balance = totalIncome - monthlyExpenses;
    
    // Pourcentage d'épargne
    const savingsPercentage = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    
    // Épargne totale
    const totalSavings = savings.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
    
    // Dettes totales
    const totalDebts = debts.reduce((sum, debt) => sum + (debt.amount - (debt.paidAmount || 0)), 0);
    
    return {
      income: totalIncome,
      expenses: monthlyExpenses,
      balance,
      savingsPercentage,
      totalSavings,
      totalDebts,
      trend: balance > 0 ? 'up' : 'down'
    };
  }, [selectedMonthIndex, selectedMonth, selectedYear, revenus, expenses, incomeTransactions, savings, debts]);

  const [hoveredCard, setHoveredCard] = useState(null);

  const getMonthName = (month, year) => {
    const date = new Date(year, month);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const getBalanceColor = () => {
    if (dashboardData.balance > 0) return '#10b981';
    if (dashboardData.balance < 0) return '#ef4444';
    return '#6b7280';
  };

  const getBalanceIcon = () => {
    if (dashboardData.balance > 0) return <TrendingUpIcon />;
    if (dashboardData.balance < 0) return <TrendingDownIcon />;
    return <BalanceIcon />;
  };

  const cards = [
    {
      id: 'balance',
      title: 'Solde du mois',
      value: dashboardData.balance,
      icon: getBalanceIcon(),
      color: getBalanceColor(),
      trend: dashboardData.trend,
      showCurrency: true
    },
    {
      id: 'income',
      title: 'Revenus',
      value: dashboardData.income,
      icon: <TrendingUpIcon />,
      color: '#10b981',
      showCurrency: true
    },
    {
      id: 'expenses',
      title: 'Dépenses',
      value: dashboardData.expenses,
      icon: <TrendingDownIcon />,
      color: '#ef4444',
      showCurrency: true
    },
    {
      id: 'savings',
      title: 'Épargne',
      value: dashboardData.totalSavings,
      icon: <SavingsIcon />,
      color: '#3b82f6',
      showCurrency: true,
      premium: true
    }
  ];

  const availableCards = cards.filter(card => 
    !card.premium || isFeatureAvailable('multipleAccounts')
  );

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      {/* En-tête avec mois */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {getMonthName(selectedMonth, selectedYear)}
          </Typography>
          <Chip 
            label={`${currentPlan.name === 'subscription.free' ? 'Gratuit' : currentPlan.name === 'subscription.premium' ? 'Premium' : 'Pro'}`}
            icon={currentPlan.name === 'subscription.free' ? <StarIcon /> : <DiamondIcon />}
            color={currentPlan.name === 'subscription.free' ? 'default' : 'primary'}
            size="small"
          />
        </Box>
      </Fade>

      {/* Cartes principales */}
      <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
        {availableCards.map((card, index) => (
          <Zoom in timeout={300 + index * 100} key={card.id}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
                border: `1px solid ${card.color}30`,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: hoveredCard === card.id ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  boxShadow: `0 8px 32px ${card.color}20`,
                  borderColor: card.color
                }
              }}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: card.color, width: 40, height: 40 }}>
                      {card.icon}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                  {card.trend && (
                    <Chip
                      label={card.trend === 'up' ? '↑' : '↓'}
                      size="small"
                      sx={{ 
                        bgcolor: card.trend === 'up' ? '#10b981' : '#ef4444',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                </Box>
                
                <Typography variant="h4" fontWeight="bold" sx={{ color: card.color, mb: 1 }}>
                  {card.showCurrency ? (
                    <CurrencyFormatter value={card.value} />
                  ) : (
                    `${card.value}%`
                  )}
                </Typography>
                
                {card.id === 'balance' && (
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(Math.max(dashboardData.savingsPercentage, 0), 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: `${card.color}20`,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: card.color,
                        borderRadius: 3
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Zoom>
        ))}
      </Box>

      {/* Assistant IA */}
      <AIAssistant />

      {/* Gamification */}
      <Gamification />

      {/* Dettes (si présentes) */}
      {dashboardData.totalDebts > 0 && (
        <Slide direction="up" in timeout={900}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ef444415 0%, #dc262605 100%)',
            border: '1px solid #ef444430',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ef4444', width: 40, height: 40 }}>
                  <TrendingDownIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Dettes en cours
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="#ef4444">
                    <CurrencyFormatter value={dashboardData.totalDebts} />
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Slide>
      )}
    </Box>
  );
};

export default MinimalistDashboard; 