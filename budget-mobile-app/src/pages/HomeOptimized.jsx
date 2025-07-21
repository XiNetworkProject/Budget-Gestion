import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useStore } from '../store';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import CurrencyFormatter from '../components/CurrencyFormatter';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  IconButton, 
  Chip,
  Alert,
  AlertTitle,
  Collapse,
  Fab,
  Fade,
  Zoom
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Add,
  ArrowBack,
  ArrowForward,
  AccountBalance,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
  CheckCircle,
  Warning,
  Psychology,
  AttachMoney,
  MoneyOff,
  Lightbulb,
  Analytics,
  Logout,
  Assignment,
  Star,
  Diamond,
  CardMembership,
  Notifications,
  Refresh,
  Savings,
  MoreVert,
  Info
} from '@mui/icons-material';

// Composants optimisés
import ErrorBoundary from '../components/optimized/ErrorBoundary';
import LoadingSpinner from '../components/optimized/LoadingSpinner';
import KPICard from '../components/optimized/KPICard';
import { VirtualizedTransactions, VirtualizedRecommendations } from '../components/optimized/VirtualizedList';
import { FinancialCharts } from '../components/optimized/OptimizedCharts';

// Hooks optimisés
import useOptimizedData from '../hooks/useOptimizedData';

// Composants
import QuickAdd from './QuickAdd';

// Configuration
import { ACTIVE_CONFIG } from '../config/environment';
import { PerformanceUtils } from '../config/performance';

// Composant de particules d'arrière-plan optimisé
const BackgroundParticles = React.memo(() => (
  <Box sx={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden'
  }}>
    {[...Array(20)].map((_, index) => (
      <Box
        key={index}
        sx={{
          position: 'absolute',
          width: Math.random() * 4 + 2,
          height: Math.random() * 4 + 2,
          background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, ${Math.random() * 0.3 + 0.1})`,
          borderRadius: '50%',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `floatParticle ${Math.random() * 10 + 10}s linear infinite`,
          animationDelay: `${Math.random() * 5}s`,
          filter: 'blur(0.5px)',
          boxShadow: '0 0 10px rgba(255,255,255,0.3)'
        }}
      />
    ))}
    
    {[...Array(8)].map((_, index) => (
      <Box
        key={`large-${index}`}
        sx={{
          position: 'absolute',
          width: Math.random() * 8 + 4,
          height: Math.random() * 8 + 4,
          background: `rgba(255, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 0.2 + 0.05})`,
          borderRadius: '50%',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `floatParticleLarge ${Math.random() * 15 + 20}s linear infinite`,
          animationDelay: `${Math.random() * 10}s`,
          filter: 'blur(1px)',
          boxShadow: '0 0 20px rgba(255,255,255,0.2)'
        }}
      />
    ))}
  </Box>
));

// Composant d'en-tête optimisé
const HeaderSection = React.memo(({ user, selectedMonth, selectedYear, navigateMonth, getMonthName, getSubscriptionIcon, getSubscriptionText, getSubscriptionColor, serverConnected, logout, t }) => {
  const navigate = useNavigate();

  return (
    <Fade in timeout={1000}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                color: 'white',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                mb: 1
              }}
            >
              {t('home.hello')}{user?.name ? `, ${user.name}` : ''}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 400,
                letterSpacing: '0.5px'
              }}
            >
              {getMonthName(selectedMonth, selectedYear)}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexWrap: 'wrap'
          }}>
            <IconButton
              sx={{
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <Notifications />
            </IconButton>
            <IconButton
              sx={{
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <Refresh />
            </IconButton>
            <IconButton
              onClick={() => navigate('/subscription')}
              sx={{
                color: getSubscriptionColor(),
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease'
                }
              }}
              title={`${t('subscription.currentPlan')}: ${getSubscriptionText()}`}
            >
              {getSubscriptionIcon()}
            </IconButton>
            <IconButton
              sx={{
                color: serverConnected ? '#4caf50' : '#ff9800',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease'
                }
              }}
              title={serverConnected ? t('home.connectedToServer') : t('home.offlineModeData')}
            >
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: 'currentColor',
                animation: serverConnected ? 'none' : 'pulse 2s infinite'
              }} />
            </IconButton>
            <IconButton
              onClick={() => {
                if (window.confirm(t('home.confirmLogout'))) {
                  logout();
                }
              }}
              sx={{
                color: '#f44336',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease'
                }
              }}
              title={t('logout')}
            >
              <Logout />
            </IconButton>
          </Box>
        </Box>

        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          background: 'rgba(255,255,255,0.1)', 
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'white', 
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {getMonthName(selectedMonth, selectedYear)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={() => navigateMonth('prev')}
                sx={{ 
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
              <IconButton 
                onClick={() => navigateMonth('next')}
                sx={{ 
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ArrowForward />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
});

// Composant de solde principal optimisé
const BalanceSection = React.memo(({ selectedMonthSaved, getMonthName, selectedMonth, selectedYear, t }) => (
  <Fade in timeout={1000}>
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
      <Box
        sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          borderRadius: '50%',
          background: selectedMonthSaved >= 0 
            ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
            : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          boxShadow: selectedMonthSaved >= 0
            ? '0 20px 60px rgba(76, 175, 80, 0.4)'
            : '0 20px 60px rgba(244, 67, 54, 0.4)',
          minWidth: { xs: 160, sm: 200, md: 240 },
          minHeight: { xs: 160, sm: 200, md: 240 },
          justifyContent: 'center',
          textAlign: 'center',
          border: selectedMonthSaved >= 0
            ? '4px solid rgba(76, 175, 80, 0.3)'
            : '4px solid rgba(244, 67, 54, 0.3)',
          transition: 'all 0.4s ease',
          animation: 'pulse 3s ease-in-out infinite',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: selectedMonthSaved >= 0
              ? '0 30px 80px rgba(76, 175, 80, 0.6)'
              : '0 30px 80px rgba(244, 67, 54, 0.6)',
          }
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            color: 'white',
            fontSize: {
              xs: selectedMonthSaved >= 1000000 ? '1.8rem' : selectedMonthSaved >= 100000 ? '2.2rem' : '2.6rem',
              sm: selectedMonthSaved >= 1000000 ? '2.2rem' : selectedMonthSaved >= 100000 ? '2.6rem' : '3rem',
              md: selectedMonthSaved >= 1000000 ? '2.6rem' : selectedMonthSaved >= 100000 ? '3rem' : '3.5rem'
            },
            lineHeight: 1.1,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            wordBreak: 'break-word',
            maxWidth: '90%'
          }}
        >
          <CurrencyFormatter amount={selectedMonthSaved} />
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            right: -12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '2px solid white'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.8rem',
              fontWeight: 900,
              color: selectedMonthSaved >= 0 ? '#4caf50' : '#f44336'
            }}
          >
            {selectedMonthSaved >= 0 ? '✓' : '!'}
          </Typography>
        </Box>
      </Box>
    </Box>
  </Fade>
));

// Composant principal optimisé
const HomeOptimized = () => {
  const { 
    selectedMonth, 
    selectedYear, 
    setSelectedMonth, 
    setSelectedYear,
    isAuthenticated,
    user,
    logout,
    serverConnected,
    getCurrentPlan,
    isFeatureAvailable
  } = useStore();
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

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

  const getSubscriptionIcon = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return <CardMembership sx={{ color: '#9E9E9E' }} />;
    
    if (currentPlan.id === 'premium') return <Star sx={{ color: '#FFD700' }} />;
    if (currentPlan.id === 'pro') return <Diamond sx={{ color: '#00D4FF' }} />;
    return <CardMembership sx={{ color: '#9E9E9E' }} />;
  }, [getCurrentPlan]);

  const getSubscriptionText = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return t('subscription.free');
    
    if (currentPlan.id === 'premium') return t('subscription.premium');
    if (currentPlan.id === 'pro') return t('subscription.pro');
    return t('subscription.free');
  }, [getCurrentPlan, t]);

  const getSubscriptionColor = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return '#9E9E9E';
    
    if (currentPlan.id === 'premium') return '#FFD700';
    if (currentPlan.id === 'pro') return '#00D4FF';
    return '#9E9E9E';
  }, [getCurrentPlan]);

  // Données pour les graphiques memoizées
  const chartData = useMemo(() => {
    if (!hasData) return { lineData: null, doughnutData: null };

    // Données pour le graphique en ligne (6 derniers mois)
    const last6Months = [];
    const revenuesByMonth = [];
    const expensesByMonth = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - i, 1);
      last6Months.push(getMonthName(date.getMonth(), date.getFullYear()));
      
      // Données simulées pour l'exemple
      revenuesByMonth.push(Math.random() * 5000 + 2000);
      expensesByMonth.push(Math.random() * 4000 + 1500);
    }

    const lineData = {
      labels: last6Months,
      datasets: [
        {
          label: 'Revenus',
          data: revenuesByMonth,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4
        },
        {
          label: 'Dépenses',
          data: expensesByMonth,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4
        }
      ]
    };

    const doughnutData = {
      labels: ['Alimentation', 'Transport', 'Loisirs', 'Logement', 'Santé', 'Autres'],
      datasets: [{
        data: [30, 20, 15, 25, 5, 5],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    return { lineData, doughnutData };
  }, [hasData, selectedMonth, selectedYear, getMonthName]);

  // Gestion des actions des recommandations
  const handleRecommendationAction = useCallback((recommendation) => {
    switch (recommendation.actionType) {
      case 'review_expenses':
      case 'analyze_expenses':
        navigate('/analytics');
        break;
      case 'create_savings_plan':
      case 'optimize_investment':
        navigate('/action-plans');
        break;
      default:
        console.log('Action non reconnue:', recommendation.actionType);
    }
  }, [navigate]);

  // Si les données ne sont pas encore chargées
  if (!hasData && isCalculating) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LoadingSpinner 
          message="Chargement des données optimisées..." 
          variant="elegant" 
          fullScreen 
        />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <BackgroundParticles />
        
        <style>
          {`
            @keyframes floatParticle {
              0% { 
                transform: translateY(100vh) translateX(0px) rotate(0deg);
                opacity: 0;
              }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { 
                transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
                opacity: 0;
              }
            }
            @keyframes floatParticleLarge {
              0% { 
                transform: translateY(100vh) translateX(0px) rotate(0deg);
                opacity: 0;
              }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { 
                transform: translateY(-100px) translateX(${Math.random() * 300 - 150}px) rotate(720deg);
                opacity: 0;
              }
            }
            @keyframes pulse {
              0% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.05); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}
        </style>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
          {/* Alerte de connexion */}
          {!isAuthenticated && (
            <Fade in timeout={800}>
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <AlertTitle>{t('home.notConnected')}</AlertTitle>
                {t('home.notConnectedMessage')}
                <Button 
                  color="inherit" 
                  size="small" 
                  sx={{ ml: 1, borderRadius: 2 }}
                  onClick={() => window.location.href = '/login'}
                >
                  {t('home.connect')}
                </Button>
              </Alert>
            </Fade>
          )}
          
          {isAuthenticated && !serverConnected && (
            <Fade in timeout={800}>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <AlertTitle>{t('home.offlineMode')}</AlertTitle>
                {t('home.offlineModeMessage')}
              </Alert>
            </Fade>
          )}
          
          {/* En-tête */}
          <HeaderSection 
            user={user}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            navigateMonth={navigateMonth}
            getMonthName={getMonthName}
            getSubscriptionIcon={getSubscriptionIcon}
            getSubscriptionText={getSubscriptionText}
            getSubscriptionColor={getSubscriptionColor}
            serverConnected={serverConnected}
            logout={logout}
            t={t}
          />

          {/* Solde principal */}
          <BalanceSection 
            selectedMonthSaved={selectedMonthData?.saved || 0}
            getMonthName={getMonthName}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            t={t}
          />

          {/* KPIs optimisés */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={6} md={3}>
              <KPICard
                title={t('home.revenues')}
                value={selectedMonthData?.income || 0}
                icon={TrendingUp}
                color="#4caf50"
                subtitle={getMonthName(selectedMonth, selectedYear)}
                variant="elegant"
                loading={isCalculating}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <KPICard
                title={t('home.expenses')}
                value={selectedMonthData?.expenses || 0}
                icon={TrendingDown}
                color="#f44336"
                subtitle={getMonthName(selectedMonth, selectedYear)}
                variant="elegant"
                loading={isCalculating}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <KPICard
                title={t('home.savings')}
                value={selectedMonthData?.saved || 0}
                icon={Savings}
                color="#2196f3"
                subtitle={t('home.thisMonth')}
                progress={selectedMonthData?.income > 0 ? (selectedMonthData.saved / selectedMonthData.income) * 100 : 0}
                variant="elegant"
                loading={isCalculating}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <KPICard
                title={t('home.forecasts')}
                value={forecast?.balance || 0}
                icon={AccountBalance}
                color="#ff9800"
                subtitle={getMonthName((selectedMonth + 1) % 12, selectedMonth === 11 ? selectedYear + 1 : selectedYear)}
                variant="elegant"
                loading={isCalculating}
              />
            </Grid>
          </Grid>

          {/* Actions rapides */}
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            }
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {t('home.quickActions')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button
                  component={RouterLink}
                  to="/action-plans"
                  variant="contained"
                  startIcon={<Assignment />}
                  fullWidth
                  sx={{ 
                    py: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                    }
                  }}
                >
                  Plans d'actions
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={RouterLink}
                  to="/expenses"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    py: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                    boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 35px rgba(244, 67, 54, 0.4)',
                    }
                  }}
                >
                  Dépenses
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={RouterLink}
                  to="/income"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    py: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)',
                    }
                  }}
                >
                  Revenus
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={RouterLink}
                  to="/analytics"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    py: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                    boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)',
                    }
                  }}
                >
                  Analytics
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Graphiques optimisés */}
          <Suspense fallback={<LoadingSpinner message="Chargement des graphiques..." />}>
            <Box sx={{ mb: 4 }}>
              <FinancialCharts
                lineData={chartData.lineData}
                doughnutData={chartData.doughnutData}
                loading={isCalculating}
              />
            </Box>
          </Suspense>

          {/* Recommandations optimisées */}
          {isFeatureAvailable('aiAnalysis') && recommendations && recommendations.length > 0 && (
            <Paper sx={{ 
              p: 3, 
              mb: 4,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  mr: 2,
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                }}>
                  <Lightbulb sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  Recommandations intelligentes
                </Typography>
                <Chip 
                  label={t('home.ai')} 
                  size="small" 
                  sx={{ 
                    ml: 2,
                    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                  }}
                />
              </Box>
              
              <VirtualizedRecommendations
                recommendations={recommendations}
                loading={isCalculating}
                onActionClick={handleRecommendationAction}
              />
            </Paper>
          )}

          {/* Transactions récentes optimisées */}
          {selectedMonthData?.transactions && selectedMonthData.transactions.length > 0 && (
            <Paper sx={{ 
              p: 3, 
              mb: 4,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              }
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 700, 
                mb: 3,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Transactions récentes
              </Typography>
              
              <VirtualizedTransactions
                transactions={selectedMonthData.transactions}
                loading={isCalculating}
              />
            </Paper>
          )}

          {/* Bouton d'ajout rapide */}
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => setShowQuickAdd(true)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                transform: 'scale(1.1)',
                boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)',
              }
            }}
          >
            <Add />
          </Fab>

          {/* Popup QuickAdd */}
          <QuickAdd open={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default React.memo(HomeOptimized); 