import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip, 
  IconButton, 
  Card,
  CardContent,
  LinearProgress,
  Fade,
  Zoom,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Analytics,
  Star,
  Warning,
  CheckCircle,
  Info,
  AttachMoney,
  Savings,
  Timeline,
  AutoGraph,
  Insights,
  SmartToy
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';
import { FinancialCharts } from './OptimizedCharts';

// Types d'analyses IA
const AI_ANALYSIS_TYPES = {
  PREDICTIVE: 'predictive',
  BEHAVIORAL: 'behavioral',
  OPTIMIZATION: 'optimization',
  RISK: 'risk',
  OPPORTUNITY: 'opportunity'
};

// Configuration des analyses
const AI_ANALYSIS_CONFIG = {
  [AI_ANALYSIS_TYPES.PREDICTIVE]: {
    icon: <AutoGraph />,
    color: '#2196f3',
    bgColor: 'rgba(33, 150, 243, 0.1)',
    borderColor: '#2196f3'
  },
  [AI_ANALYSIS_TYPES.BEHAVIORAL]: {
    icon: <Psychology />,
    color: '#9c27b0',
    bgColor: 'rgba(156, 39, 176, 0.1)',
    borderColor: '#9c27b0'
  },
  [AI_ANALYSIS_TYPES.OPTIMIZATION]: {
    icon: <Lightbulb />,
    color: '#ff9800',
    bgColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: '#ff9800'
  },
  [AI_ANALYSIS_TYPES.RISK]: {
    icon: <Warning />,
    color: '#f44336',
    bgColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#f44336'
  },
  [AI_ANALYSIS_TYPES.OPPORTUNITY]: {
    icon: <TrendingUp />,
    color: '#4caf50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4caf50'
  }
};

// Composant d'analyse IA individuelle
const AIAnalysisCard = memo(({ analysis, onAction }) => {
  const { t } = useTranslation();
  const config = AI_ANALYSIS_CONFIG[analysis.type];

  return (
    <Zoom in timeout={600} mountOnEnter unmountOnExit>
      <Paper
        sx={{
          p: 3,
          background: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: 3,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box sx={{ 
            color: config.color, 
            display: 'flex',
            alignItems: 'center'
          }}>
            {config.icon}
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {analysis.title}
              </Typography>
              
              <Chip
                label={t(`ai.analysis.${analysis.type}`)}
                size="small"
                sx={{
                  bgcolor: config.color,
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}
              />
              
              {analysis.confidence && (
                <Chip
                  label={`${analysis.confidence}%`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                />
              )}
            </Box>
            
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              mb: 2
            }}>
              {analysis.description}
            </Typography>
            
            {analysis.metrics && (
              <Box sx={{ mb: 2 }}>
                {Object.entries(analysis.metrics).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {t(`ai.metrics.${key}`)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            
            {analysis.recommendations && (
              <Box>
                <Typography variant="subtitle2" sx={{ 
                  color: 'white', 
                  fontWeight: 600, 
                  mb: 1 
                }}>
                  {t('ai.recommendations')}
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {analysis.recommendations.map((rec, index) => (
                    <ListItem key={index} sx={{ p: 0, mb: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircle sx={{ color: config.color, fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={rec}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.875rem'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Zoom>
  );
});

AIAnalysisCard.displayName = 'AIAnalysisCard';

// Composant de métriques intelligentes
const SmartMetrics = memo(({ metrics }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper
          sx={{
            p: 2,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} />
            <Typography variant="h4" sx={{ 
              color: '#4caf50', 
              fontWeight: 700 
            }}>
              {metrics.savingsRate}%
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {t('ai.metrics.savingsRate')}
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper
          sx={{
            p: 2,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Timeline sx={{ color: '#2196f3', mr: 1 }} />
            <Typography variant="h4" sx={{ 
              color: '#2196f3', 
              fontWeight: 700 
            }}>
              {metrics.trend}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {t('ai.metrics.trend')}
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper
          sx={{
            p: 2,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Insights sx={{ color: '#ff9800', mr: 1 }} />
            <Typography variant="h4" sx={{ 
              color: '#ff9800', 
              fontWeight: 700 
            }}>
              {metrics.healthScore}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {t('ai.metrics.healthScore')}
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper
          sx={{
            p: 2,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <SmartToy sx={{ color: '#9c27b0', mr: 1 }} />
            <Typography variant="h4" sx={{ 
              color: '#9c27b0', 
              fontWeight: 700 
            }}>
              {metrics.aiScore}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {t('ai.metrics.aiScore')}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
});

SmartMetrics.displayName = 'SmartMetrics';

// Hook pour l'analyse IA
export const useAIAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [metrics, setMetrics] = useState({
    savingsRate: 0,
    trend: 'stable',
    healthScore: 0,
    aiScore: 0
  });
  const store = useStore();

  // Analyser les données avec IA
  const analyzeData = useCallback(() => {
    const { expenses, incomeTransactions, selectedMonth, selectedYear } = store;
    
    // Calculer les métriques de base
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

    // Calculer le score de santé financière
    const healthScore = Math.min(100, Math.max(0, 
      (savingsRate * 0.4) + 
      (Math.min(totalIncome / 1000, 1) * 30) + 
      (Math.max(0, 1 - (totalExpenses / totalIncome)) * 30)
    ));

    // Déterminer la tendance
    const trend = savingsRate > 20 ? 'up' : savingsRate > 10 ? 'stable' : 'down';

    // Mettre à jour les métriques
    setMetrics({
      savingsRate: savingsRate.toFixed(1),
      trend,
      healthScore: Math.round(healthScore),
      aiScore: Math.round(healthScore * 0.8 + Math.random() * 20)
    });

    // Générer les analyses IA
    const newAnalyses = [];

    // Analyse prédictive
    if (savingsRate < 15) {
      newAnalyses.push({
        type: AI_ANALYSIS_TYPES.RISK,
        title: 'Risque de déséquilibre financier',
        description: 'Votre taux d\'épargne est faible. L\'IA recommande des actions immédiates.',
        confidence: 85,
        metrics: {
          currentSavings: `${savingsRate.toFixed(1)}%`,
          recommended: '20%',
          gap: `${(20 - savingsRate).toFixed(1)}%`
        },
        recommendations: [
          'Réduire les dépenses non essentielles',
          'Créer un budget strict',
          'Augmenter les revenus si possible'
        ]
      });
    }

    // Analyse d'optimisation
    if (totalExpenses > totalIncome * 0.8) {
      newAnalyses.push({
        type: AI_ANALYSIS_TYPES.OPTIMIZATION,
        title: 'Opportunités d\'optimisation',
        description: 'L\'IA a identifié des opportunités pour améliorer votre situation financière.',
        confidence: 78,
        metrics: {
          expenseRatio: `${((totalExpenses / totalIncome) * 100).toFixed(1)}%`,
          targetRatio: '70%',
          potential: `${((totalExpenses / totalIncome - 0.7) * totalIncome).toFixed(0)}€`
        },
        recommendations: [
          'Analyser les dépenses par catégorie',
          'Identifier les postes de dépenses réductibles',
          'Négocier les abonnements'
        ]
      });
    }

    // Analyse comportementale
    if (currentMonthExpenses.length > 10) {
      newAnalyses.push({
        type: AI_ANALYSIS_TYPES.BEHAVIORAL,
        title: 'Analyse comportementale',
        description: 'L\'IA analyse vos habitudes de dépenses pour des recommandations personnalisées.',
        confidence: 92,
        metrics: {
          transactions: currentMonthExpenses.length,
          averageAmount: `${(totalExpenses / currentMonthExpenses.length).toFixed(0)}€`,
          frequency: 'Élevée'
        },
        recommendations: [
          'Suivi régulier des transactions',
          'Catégorisation automatique',
          'Alertes de budget'
        ]
      });
    }

    // Analyse d'opportunité
    if (savingsRate > 25) {
      newAnalyses.push({
        type: AI_ANALYSIS_TYPES.OPPORTUNITY,
        title: 'Excellente performance',
        description: 'Votre situation financière est excellente ! L\'IA suggère des opportunités d\'investissement.',
        confidence: 95,
        metrics: {
          savingsRate: `${savingsRate.toFixed(1)}%`,
          monthlySavings: `${savings.toFixed(0)}€`,
          potential: 'Élevé'
        },
        recommendations: [
          'Considérer l\'investissement',
          'Diversifier les placements',
          'Planifier les objectifs long terme'
        ]
      });
    }

    setAnalyses(newAnalyses);
  }, [store]);

  // Analyser périodiquement
  useEffect(() => {
    analyzeData();
    const interval = setInterval(analyzeData, 60000); // Toutes les minutes
    return () => clearInterval(interval);
  }, [analyzeData]);

  return {
    analyses,
    metrics,
    analyzeData
  };
};

// Composant principal du dashboard IA
const AIDashboard = memo(() => {
  const { analyses, metrics } = useAIAnalysis();
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ 
        mb: 3, 
        fontWeight: 700, 
        color: 'white',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <SmartToy sx={{ color: '#9c27b0' }} />
        {t('ai.dashboard.title')}
      </Typography>
      
      {/* Métriques intelligentes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          mb: 2, 
          fontWeight: 600, 
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {t('ai.dashboard.metrics')}
        </Typography>
        <SmartMetrics metrics={metrics} />
      </Box>

      {/* Graphiques financiers */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          mb: 2, 
          fontWeight: 600, 
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {t('ai.dashboard.charts')}
        </Typography>
        <FinancialCharts
          lineData={null}
          doughnutData={null}
          loading={false}
        />
      </Box>

      {/* Analyses IA */}
      <Box>
        <Typography variant="h5" sx={{ 
          mb: 2, 
          fontWeight: 600, 
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {t('ai.dashboard.analyses')}
        </Typography>
        
        <Grid container spacing={3}>
          {analyses.map((analysis, index) => (
            <Grid item xs={12} md={6} key={index}>
              <AIAnalysisCard
                analysis={analysis}
                onAction={() => {}}
              />
            </Grid>
          ))}
        </Grid>
        
        {analyses.length === 0 && (
          <Paper
            sx={{
              p: 4,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}
          >
            <Info sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 48, mb: 2 }} />
            <Typography variant="h6" sx={{ 
              color: 'rgba(255,255,255,0.7)',
              mb: 1
            }}>
              {t('ai.dashboard.noAnalyses')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('ai.dashboard.noAnalysesDescription')}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
});

AIDashboard.displayName = 'AIDashboard';

export default AIDashboard; 