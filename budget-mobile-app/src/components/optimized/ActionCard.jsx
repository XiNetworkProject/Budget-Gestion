import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Fade,
  Tooltip,
  Badge
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Savings,
  Analytics,
  Category,
  AttachMoney,
  Settings,
  Star,
  Diamond,
  CardMembership,
  NewReleases,
  Update,
  Speed,
  Psychology,
  BarChart,
  PieChart,
  Timeline,
  Assessment,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance,
  Work,
  Business,
  School,
  SportsEsports,
  LocalHospital,
  DirectionsCar,
  Restaurant,
  ShoppingCart,
  Home,
  MonetizationOn,
  Computer,
  Person
} from '@mui/icons-material';

// Composant Zoom sécurisé
import SafeZoom from './SafeZoom';

// Actions rapides avec intégration des nouvelles pages
const QuickActionsSection = memo(({ actions, t }) => {
  const navigate = useNavigate();

  const defaultActions = [
    {
      id: 'expenses',
      title: t('quickActions.manageExpenses'),
      subtitle: t('quickActions.expensesSubtitle'),
      icon: TrendingDown,
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
      route: '/expenses',
      badge: 'Nouveau',
      badgeColor: '#FF9800',
      description: t('quickActions.expensesDescription'),
      features: ['Gestion avancée', 'Catégories personnalisées', 'Analytics détaillées'],
      priority: 'high'
    },
    {
      id: 'income',
      title: t('quickActions.manageIncome'),
      subtitle: t('quickActions.incomeSubtitle'),
      icon: TrendingUp,
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
      route: '/income',
      badge: 'Nouveau',
      badgeColor: '#FF9800',
      description: t('quickActions.incomeDescription'),
      features: ['Types de revenus', 'Suivi détaillé', 'Prévisions intelligentes'],
      priority: 'high'
    },
    {
      id: 'savings',
      title: t('quickActions.savings'),
      subtitle: t('quickActions.savingsSubtitle'),
      icon: Savings,
      color: '#2196f3',
      gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
      route: '/savings',
      description: t('quickActions.savingsDescription'),
      features: ['Objectifs d\'épargne', 'Suivi automatique', 'Recommandations'],
      priority: 'medium'
    },
    {
      id: 'analytics',
      title: t('quickActions.analytics'),
      subtitle: t('quickActions.analyticsSubtitle'),
      icon: Analytics,
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
      route: '/analytics',
      description: t('quickActions.analyticsDescription'),
      features: ['Graphiques interactifs', 'Tendances détaillées', 'Insights IA'],
      priority: 'medium'
    },
    {
      id: 'categories',
      title: t('quickActions.categories'),
      subtitle: t('quickActions.categoriesSubtitle'),
      icon: Category,
      color: '#ff9800',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
      route: '/expenses',
      badge: 'Optimisé',
      badgeColor: '#4CAF50',
      description: t('quickActions.categoriesDescription'),
      features: ['Gestion moderne', 'Icônes personnalisées', 'Budgets par catégorie'],
      priority: 'medium'
    },
    {
      id: 'settings',
      title: t('quickActions.settings'),
      subtitle: t('quickActions.settingsSubtitle'),
      icon: Settings,
      color: '#607d8b',
      gradient: 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)',
      route: '/settings',
      description: t('quickActions.settingsDescription'),
      features: ['Personnalisation', 'Sécurité', 'Préférences'],
      priority: 'low'
    }
  ];

  const actionsToShow = actions || defaultActions;

  const handleActionClick = (action) => {
    if (action.route) {
      navigate(action.route);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      TrendingUp, TrendingDown, Savings, Analytics, Category, AttachMoney,
      Settings, Star, Diamond, CardMembership, NewReleases, Update, Speed,
      Psychology, BarChart, PieChart, Timeline, Assessment, TrendingUpIcon,
      TrendingDownIcon, AccountBalance, Work, Business, School, SportsEsports,
      LocalHospital, DirectionsCar, Restaurant, ShoppingCart, Home,
      MonetizationOn, Computer, Person
    };
    return iconMap[iconName] || AttachMoney;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 700, 
          mb: 3,
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Speed sx={{ color: '#4CAF50' }} />
        {t('quickActions.title')}
      </Typography>

      <Grid container spacing={2}>
        {actionsToShow.map((action, index) => {
          const IconComponent = getIconComponent(action.icon);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={action.id}>
              <SafeZoom in timeout={800 + index * 100}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    '& .action-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    }
                  }
                }}>
                  {/* Badge pour les nouvelles fonctionnalités */}
                  {action.badge && (
                    <Chip
                      label={action.badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: 16,
                        zIndex: 2,
                        background: action.badgeColor,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                    />
                  )}

                  <CardActionArea 
                    onClick={() => handleActionClick(action)}
                    sx={{ p: 3, height: '100%' }}
                  >
                    <CardContent sx={{ p: 0, textAlign: 'center' }}>
                      {/* Icône avec animation */}
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        position: 'relative'
                      }}>
                        <Box
                          className="action-icon"
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: action.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 8px 32px ${action.color}40`,
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: -2,
                              left: -2,
                              right: -2,
                              bottom: -2,
                              borderRadius: '50%',
                              background: action.gradient,
                              opacity: 0.3,
                              zIndex: -1,
                              animation: 'pulse 2s infinite'
                            }
                          }}
                        >
                          <IconComponent sx={{ 
                            fontSize: 36, 
                            color: 'white',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                          }} />
                        </Box>
                      </Box>

                      {/* Titre */}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          color: 'white',
                          mb: 1,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        {action.title}
                      </Typography>

                      {/* Sous-titre */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          mb: 2,
                          fontWeight: 500
                        }}
                      >
                        {action.subtitle}
                      </Typography>

                      {/* Description */}
                      {action.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            mb: 2,
                            fontSize: '0.85rem',
                            lineHeight: 1.4
                          }}
                        >
                          {action.description}
                        </Typography>
                      )}

                      {/* Fonctionnalités */}
                      {action.features && (
                        <Box sx={{ mt: 2 }}>
                          {action.features.map((feature, idx) => (
                            <Chip
                              key={idx}
                              label={feature}
                              size="small"
                              sx={{
                                mr: 0.5,
                                mb: 0.5,
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                fontSize: '0.7rem',
                                '&:hover': {
                                  background: 'rgba(255, 255, 255, 0.2)',
                                }
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Indicateur de priorité */}
                      {action.priority === 'high' && (
                        <Box sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#FF6B6B',
                          boxShadow: '0 0 8px rgba(255, 107, 107, 0.6)',
                          animation: 'pulse 2s infinite'
                        }} />
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </SafeZoom>
            </Grid>
          );
        })}
      </Grid>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Box>
  );
});

QuickActionsSection.displayName = 'QuickActionsSection';

export { QuickActionsSection }; 