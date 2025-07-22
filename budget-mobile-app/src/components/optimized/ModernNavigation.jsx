import React, { useState, useCallback, memo } from 'react';
import { 
  Box, 
  BottomNavigation, 
  BottomNavigationAction, 
  Drawer, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Chip, 
  Tooltip, 
  Fab, 
  Zoom, 
  Fade,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Badge
} from '@mui/material';
import {
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as IncomeIcon,
  BarChart as AnalyticsIcon,
  MoreVert as MoreIcon,
  Savings as SavingsIcon,
  AccountBalance as DebtsIcon,
  History as HistoryIcon,
  Assignment as ActionPlansIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Star as StarIcon,
  Diamond as DiamondIcon,
  CardMembership as CardMembershipIcon,
  Notifications as NotificationsIcon,
  Psychology as PsychologyIcon,
  SmartToy as SmartToyIcon,
  TrendingUp as TrendingUpIcon,
  AccountCircle as AccountCircleIcon,
  Help as HelpIcon,
  Feedback as FeedbackIcon,
  BugReport as BugReportIcon,
  School as SchoolIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
  VpnKey as VpnKeyIcon,
  Fingerprint as FingerprintIcon,
  Shield as ShieldIcon,
  PrivacyTip as PrivacyTipIcon,
  Analytics as AnalyticsIcon2,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Palette as PaletteIcon,
  Smartphone as SmartphoneIcon,
  Computer as ComputerIcon,
  Language as LanguageIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Category as CategoryIcon,
  DataUsage as DataUsageIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon2,
  Backup as BackupIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

// Composant pour les cartes d'action dans le menu "Plus"
const ActionCard = memo(({ icon: Icon, label, description, onClick, color = '#2196f3', badge, premium = false }) => (
  <Zoom in timeout={300}>
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          background: 'rgba(255,255,255,0.15)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
        {badge && (
          <Badge
            badgeContent={badge}
            color="error"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              '& .MuiBadge-badge': {
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
              }
            }}
          >
            <Box />
          </Badge>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 1,
          position: 'relative'
        }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
              boxShadow: `0 4px 16px ${color}40`,
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: `0 6px 20px ${color}60`,
              }
            }}
          >
            <Icon sx={{ fontSize: 24, color: 'white' }} />
          </Avatar>
          
          {premium && (
            <Box sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
            }}>
              <StarIcon sx={{ fontSize: 12, color: 'white' }} />
            </Box>
          )}
        </Box>
        
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {label}
        </Typography>
        
        {description && (
          <Typography variant="caption" sx={{ 
            color: 'rgba(255,255,255,0.7)',
            display: 'block',
            lineHeight: 1.2
          }}>
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  </Zoom>
));

// Composant pour les éléments de liste dans le menu "Plus"
const ListAction = memo(({ icon: Icon, label, description, onClick, color = '#2196f3', badge, premium = false }) => (
  <Fade in timeout={300}>
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: 2,
        mb: 1,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'rgba(255,255,255,0.1)',
          transform: 'translateX(4px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }
      }}
    >
      <ListItemIcon>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            boxShadow: `0 2px 8px ${color}40`
          }}
        >
          <Icon sx={{ fontSize: 20, color: 'white' }} />
        </Avatar>
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
            {premium && (
              <StarIcon sx={{ fontSize: 16, color: '#FFD700' }} />
            )}
            {badge && (
              <Chip
                label={badge}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            )}
          </Box>
        }
        secondary={
          description && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {description}
            </Typography>
          )
        }
      />
    </ListItemButton>
  </Fade>
));

const ModernNavigation = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [value, setValue] = useState(0);
  
  const { 
    user, 
    isAuthenticated,
    getCurrentPlan,
    isFeatureAvailable,
    subscription,
    expenses,
    incomeTransactions,
    savings,
    debts,
    tutorialCompleted,
    onboardingCompleted
  } = useStore();

  // Navigation principale
  const primaryNavigation = [
    { path: '/home', icon: HomeIcon, label: t('navigation.home'), color: '#2196f3' },
    { path: '/expenses', icon: MoneyIcon, label: t('navigation.expenses'), color: '#f44336' },
    { path: '/income', icon: IncomeIcon, label: t('navigation.income'), color: '#4caf50' },
    { path: '/analytics', icon: AnalyticsIcon, label: t('navigation.analytics'), color: '#ff9800' },
    { path: 'more', icon: MoreIcon, label: 'Plus', color: '#607d8b' }
  ];

  // Menu "Plus" - Section Principale
  const mainActions = [
    {
      icon: SavingsIcon,
      label: t('navigation.savings'),
      description: t('savings.description', 'Gérer vos objectifs d\'épargne'),
      path: '/savings',
      color: '#9c27b0',
      badge: savings?.length || 0
    },
    {
      icon: DebtsIcon,
      label: 'Dettes',
      description: 'Suivre vos remboursements',
      path: '/debts',
      color: '#ff5722',
      badge: debts?.length || 0
    },
    {
      icon: HistoryIcon,
      label: 'Historique',
      description: 'Voir toutes vos transactions',
      path: '/history',
      color: '#795548'
    },
    {
      icon: ActionPlansIcon,
      label: 'Plans d\'action',
      description: 'Objectifs et recommandations',
      path: '/action-plans',
      color: '#3f51b5',
      premium: true
    }
  ];

  // Menu "Plus" - Section Paramètres
  const settingsActions = [
    {
      icon: SettingsIcon,
      label: t('navigation.settings'),
      description: 'Personnaliser votre expérience',
      path: '/settings',
      color: '#607d8b'
    }
  ];

  // Menu "Plus" - Section Abonnement
  const subscriptionActions = [
    {
      icon: CardMembershipIcon,
      label: 'Abonnement',
      description: 'Gérer votre plan',
      path: '/subscription',
      color: '#ffd700',
      premium: true
    }
  ];

  // Gestion de la navigation
  const handleNavigation = useCallback((path) => {
    if (path === 'more') {
      setShowMoreMenu(true);
    } else {
      navigate(path);
    }
  }, [navigate]);

  // Mise à jour de la valeur active
  React.useEffect(() => {
    const currentIndex = primaryNavigation.findIndex(nav => nav.path === location.pathname);
    setValue(currentIndex !== -1 ? currentIndex : 0);
  }, [location.pathname]);

  // Fonction pour obtenir l'icône d'abonnement
  const getSubscriptionIcon = useCallback(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return <CardMembershipIcon sx={{ color: '#9E9E9E' }} />;
    
    if (currentPlan.id === 'premium') return <StarIcon sx={{ color: '#FFD700' }} />;
    if (currentPlan.id === 'pro') return <DiamondIcon sx={{ color: '#00D4FF' }} />;
    return <CardMembershipIcon sx={{ color: '#9E9E9E' }} />;
  }, [getCurrentPlan]);

  return (
    <>
      {/* Navigation principale */}
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          handleNavigation(primaryNavigation[newValue].path);
        }}
        showLabels
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          height: 70
        }}
      >
        {primaryNavigation.map((nav, index) => (
          <BottomNavigationAction
            key={nav.path}
            label={nav.label}
            icon={<nav.icon />}
            sx={{ 
              '&.Mui-selected': { 
                color: nav.color,
                '& .MuiBottomNavigationAction-label': {
                  color: nav.color,
                  fontWeight: 600
                }
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 500
              }
            }}
          />
        ))}
      </BottomNavigation>

      {/* Bouton d'action rapide */}
      <Zoom in timeout={300}>
        <Fab
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 16,
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)',
            }
          }}
          onClick={() => navigate('/quick-add')}
        >
          <AddIcon sx={{ color: 'white' }} />
        </Fab>
      </Zoom>

      {/* Menu "Plus" avec Drawer */}
      <Drawer
        anchor="bottom"
        open={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '80vh',
            minHeight: '60vh'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              Plus d'options
            </Typography>
            <IconButton
              onClick={() => setShowMoreMenu(false)}
              sx={{ color: 'white' }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>

          {/* Section Principale */}
          <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>
            Fonctionnalités principales
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {mainActions.map((action) => (
              <Grid item xs={6} key={action.path}>
                <ActionCard
                  icon={action.icon}
                  label={action.label}
                  description={action.description}
                  color={action.color}
                  badge={action.badge}
                  premium={action.premium}
                  onClick={() => {
                    navigate(action.path);
                    setShowMoreMenu(false);
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

          {/* Section Paramètres */}
          <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>
            Paramètres et compte
          </Typography>
          <List sx={{ mb: 3 }}>
            {settingsActions.map((action) => (
              <ListAction
                key={action.path}
                icon={action.icon}
                label={action.label}
                description={action.description}
                color={action.color}
                onClick={() => {
                  navigate(action.path);
                  setShowMoreMenu(false);
                }}
              />
            ))}
            {subscriptionActions.map((action) => (
              <ListAction
                key={action.path}
                icon={action.icon}
                label={action.label}
                description={action.description}
                color={action.color}
                premium={action.premium}
                onClick={() => {
                  navigate(action.path);
                  setShowMoreMenu(false);
                }}
              />
            ))}
          </List>

          {/* Indicateur d'abonnement */}
          {isAuthenticated && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 2,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Tooltip title="Votre abonnement actuel" arrow>
                <Chip
                  icon={getSubscriptionIcon()}
                  label={getCurrentPlan()?.name || 'Gratuit'}
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                    }
                  }}
                />
              </Tooltip>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
});

ModernNavigation.displayName = 'ModernNavigation';

export default ModernNavigation; 