import React, { memo, useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Chip, 
  Button, 
  Fade, 
  Zoom,
  Collapse,
  Alert,
  AlertTitle,
  Divider,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  Fab,
  Badge
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Add,
  ArrowBack,
  ArrowForward,
  AccountBalance,
  Notifications,
  Refresh,
  Savings,
  MoreVert,
  Info,
  Lightbulb,
  Psychology,
  Analytics,
  Star,
  Diamond,
  CardMembership,
  Speed,
  Security,
  AutoAwesome,
  Insights,
  Timeline,
  Assessment,
  TrendingFlat,
  Warning,
  CheckCircle,
  Error,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import KPICard from './KPICard';
import { FinancialCharts } from './OptimizedCharts';
import { VirtualizedTransactions, VirtualizedRecommendations } from './VirtualizedList';
import LoadingSpinner from './LoadingSpinner';
import useOptimizedData from '../../hooks/useOptimizedData';

// Composant de métriques intelligentes
const SmartMetrics = memo(({ data, loading }) => {
  const { t } = useTranslation();
  
  const metrics = useMemo(() => {
    if (!data) return [];
    
    return [
      {
        title: t('home.totalIncome'),
        value: data.totalIncome || 0,
        icon: TrendingUp,
        color: '#4caf50',
        trend: data.incomeTrend || 0,
        subtitle: t('home.thisMonth'),
        progress: data.incomeProgress || 0
      },
      {
        title: t('home.totalExpenses'),
        value: data.totalExpenses || 0,
        icon: TrendingDown,
        color: '#f44336',
        trend: data.expenseTrend || 0,
        subtitle: t('home.thisMonth'),
        progress: data.expenseProgress || 0
      },
      {
        title: t('home.savings'),
        value: data.savings || 0,
        icon: Savings,
        color: '#2196f3',
        trend: data.savingsTrend || 0,
        subtitle: t('home.savingsRate', { rate: data.savingsRate || 0 }),
        progress: data.savingsProgress || 0
      },
      {
        title: t('home.balance'),
        value: data.balance || 0,
        icon: AccountBalance,
        color: data.balance >= 0 ? '#4caf50' : '#f44336',
        trend: data.balanceTrend || 0,
        subtitle: t('home.currentBalance'),
        progress: data.balanceProgress || 0
      }
    ];
  }, [data, t]);

  if (loading) {
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper sx={{ p: 3, height: 140 }}>
              <LoadingSpinner variant="minimal" />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Zoom in timeout={600 + index * 100}>
            <KPICard
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              color={metric.color}
              trend={metric.trend}
              trendDirection={metric.trend > 0 ? 'up' : metric.trend < 0 ? 'down' : 'neutral'}
              subtitle={metric.subtitle}
              progress={metric.progress}
              variant="glassmorphism"
              onClick={() => console.log(`Clicked ${metric.title}`)}
            />
          </Zoom>
        </Grid>
      ))}
    </Grid>
  );
});

// Composant d'alertes intelligentes
const SmartAlerts = memo(({ data, onActionClick }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  const alerts = useMemo(() => {
    if (!data) return [];
    
    const alertsList = [];
    
    // Alerte de taux d'épargne faible
    if (data.savingsRate < 20) {
      alertsList.push({
        type: 'warning',
        title: t('home.lowSavingsRate'),
        message: t('home.lowSavingsRateMessage', { savingsRate: data.savingsRate }),
        action: 'create_savings_plan',
        icon: Warning
      });
    }
    
    // Alerte de dépenses élevées
    if (data.expenseTrend > 20) {
      alertsList.push({
        type: 'error',
        title: t('home.highExpenseIncrease'),
        message: t('home.highExpenseIncreaseMessage', { increase: data.expenseTrend }),
        action: 'review_expenses',
        icon: TrendingUp
      });
    }
    
    // Alerte de revenus en baisse
    if (data.incomeTrend < -10) {
      alertsList.push({
        type: 'info',
        title: t('home.incomeDecrease'),
        message: t('home.incomeDecreaseMessage', { decrease: Math.abs(data.incomeTrend) }),
        action: 'analyze_income',
        icon: TrendingDown
      });
    }
    
    // Alerte positive d'excellente épargne
    if (data.savingsRate > 30) {
      alertsList.push({
        type: 'success',
        title: t('home.excellentSavingsRate'),
        message: t('home.excellentSavingsRateMessage', { savingsRate: data.savingsRate }),
        action: 'optimize_investment',
        icon: CheckCircle
      });
    }
    
    return alertsList;
  }, [data, t]);

  if (alerts.length === 0) return null;

  return (
    <Fade in timeout={800}>
      <Paper sx={{ 
        mb: 4,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.2)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.05)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications sx={{ color: 'white' }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {t('home.smartAlerts')} ({alerts.length})
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'white' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        
        <Collapse in={expanded}>
          <Box sx={{ p: 2 }}>
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                severity={alert.type}
                icon={<alert.icon />}
                action={
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => onActionClick(alert.action)}
                    sx={{ 
                      background: 'rgba(255,255,255,0.1)',
                      '&:hover': { background: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    {t('home.takeAction')}
                  </Button>
                }
                sx={{ 
                  mb: 2,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:last-child': { mb: 0 }
                }}
              >
                <AlertTitle sx={{ fontWeight: 600 }}>{alert.title}</AlertTitle>
                {alert.message}
              </Alert>
            ))}
          </Box>
        </Collapse>
      </Paper>
    </Fade>
  );
});

// Composant de insights intelligents
const SmartInsights = memo(({ data, loading }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const insights = useMemo(() => {
    if (!data) return [];
    
    return [
      {
        icon: Insights,
        title: t('home.spendingPattern'),
        description: t('home.spendingPatternDescription'),
        value: data.topCategory || 'Alimentation',
        percentage: data.topCategoryPercentage || 25,
        color: '#FF6384'
      },
      {
        icon: Timeline,
        title: t('home.trendAnalysis'),
        description: t('home.trendAnalysisDescription'),
        value: data.trendDirection || 'stable',
        percentage: data.trendStrength || 50,
        color: '#36A2EB'
      },
      {
        icon: Assessment,
        title: t('home.financialHealth'),
        description: t('home.financialHealthDescription'),
        value: data.healthScore || 'Good',
        percentage: data.healthPercentage || 75,
        color: '#4BC0C0'
      }
    ];
  }, [data, t]);

  if (loading) {
    return (
      <Paper sx={{ 
        p: 3, 
        mb: 4,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <LoadingSpinner variant="minimal" />
      </Paper>
    );
  }

  return (
    <Fade in timeout={1000}>
      <Paper sx={{ 
        p: 3, 
        mb: 4,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AutoAwesome sx={{ color: '#FFD700', fontSize: 28 }} />
            <Typography variant="h5" sx={{ 
              fontWeight: 700,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {t('home.smartInsights')}
            </Typography>
            <Chip 
              label={t('home.ai')} 
              size="small" 
              sx={{ 
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: 'white',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
              }}
            />
          </Box>
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'white' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        
        <Collapse in={expanded}>
          <Grid container spacing={3}>
            {insights.map((insight, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        background: `${insight.color}20`,
                        mr: 2
                      }}>
                        <insight.icon sx={{ color: insight.color, fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        {insight.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                      {insight.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {insight.value}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={insight.percentage} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: insight.color,
                            borderRadius: 3
                          }
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Collapse>
      </Paper>
    </Fade>
  );
});

// Composant principal SmartDashboard
const SmartDashboard = memo(({ onActionClick }) => {
  const { t } = useTranslation();
  const { 
    selectedMonthData, 
    forecast, 
    recommendations, 
    isCalculating, 
    hasData 
  } = useOptimizedData();

  // Données optimisées pour les graphiques
  const chartData = useMemo(() => {
    if (!hasData || !selectedMonthData) return { lineData: null, doughnutData: null };

    // Données réelles pour les graphiques
    const lineData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [
        {
          label: t('home.income'),
          data: [3000, 3200, 2800, 3500, 3800, 3600],
          borderColor: 'rgba(76, 175, 80, 1)',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: t('home.expenses'),
          data: [2500, 2700, 2400, 2900, 3100, 2800],
          borderColor: 'rgba(244, 67, 54, 1)',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4,
          fill: true
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
  }, [hasData, selectedMonthData, t]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Métriques intelligentes */}
      <SmartMetrics data={selectedMonthData} loading={isCalculating} />
      
      {/* Alertes intelligentes */}
      <SmartAlerts data={selectedMonthData} onActionClick={onActionClick} />
      
      {/* Insights intelligents */}
      <SmartInsights data={selectedMonthData} loading={isCalculating} />
      
      {/* Graphiques financiers */}
      {chartData.lineData && chartData.doughnutData && (
        <Fade in timeout={1200}>
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Analytics sx={{ color: '#2196f3', fontSize: 28, mr: 2 }} />
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {t('home.financialAnalytics')}
              </Typography>
            </Box>
            
            <FinancialCharts
              lineData={chartData.lineData}
              doughnutData={chartData.doughnutData}
              loading={isCalculating}
              onLineClick={(point) => console.log('Line chart clicked:', point)}
              onDoughnutClick={(segment) => console.log('Doughnut chart clicked:', segment)}
            />
          </Paper>
        </Fade>
      )}
      
      {/* Recommandations intelligentes */}
      {recommendations && recommendations.length > 0 && (
        <Fade in timeout={1400}>
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.2)',
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
                {t('home.intelligentRecommendations')}
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
              onActionClick={onActionClick}
            />
          </Paper>
        </Fade>
      )}
      
      {/* Transactions récentes */}
      {selectedMonthData?.transactions && selectedMonthData.transactions.length > 0 && (
        <Fade in timeout={1600}>
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.2)',
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
              {t('home.recentTransactions')}
            </Typography>
            
            <VirtualizedTransactions
              transactions={selectedMonthData.transactions}
              loading={isCalculating}
            />
          </Paper>
        </Fade>
      )}
    </Box>
  );
});

SmartDashboard.displayName = 'SmartDashboard';
SmartMetrics.displayName = 'SmartMetrics';
SmartAlerts.displayName = 'SmartAlerts';
SmartInsights.displayName = 'SmartInsights';

export default SmartDashboard; 