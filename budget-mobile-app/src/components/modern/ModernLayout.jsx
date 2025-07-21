import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Fab
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as IncomeIcon,
  BarChart as AnalyticsIcon,
  Savings as SavingsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Close as CloseIcon,
  Add as AddIcon,
  SmartToy as AIIcon,
  Psychology as GamificationIcon,
  History as HistoryIcon,
  Assignment as ActionPlansIcon,
  CardMembership as SubscriptionIcon
} from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import { DESIGN_SYSTEM } from '../../theme/designSystem';
import ModernFloatingMenu from './ModernFloatingMenu';

const DRAWER_WIDTH = 280;

// Configuration de navigation
const NAVIGATION_ITEMS = [
  {
    path: '/home',
    label: 'navigation.home',
    icon: HomeIcon,
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
  },
  {
    path: '/expenses',
    label: 'navigation.expenses',
    icon: MoneyIcon,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  },
  {
    path: '/income',
    label: 'navigation.income',
    icon: IncomeIcon,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    path: '/analytics',
    label: 'navigation.analytics',
    icon: AnalyticsIcon,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  {
    path: '/ai-dashboard',
    label: 'navigation.aiDashboard',
    icon: AIIcon,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  },
  {
    path: '/gamification',
    label: 'navigation.gamification',
    icon: GamificationIcon,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  },
  {
    path: '/savings',
    label: 'navigation.savings',
    icon: SavingsIcon,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  {
    path: '/history',
    label: 'navigation.history',
    icon: HistoryIcon,
    color: '#6b7280',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  },
  {
    path: '/action-plans',
    label: 'navigation.actionPlans',
    icon: ActionPlansIcon,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
  },
  {
    path: '/subscription',
    label: 'navigation.subscription',
    icon: SubscriptionIcon,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  {
    path: '/settings',
    label: 'navigation.settings',
    icon: SettingsIcon,
    color: '#6b7280',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  }
];

// Composant d'en-tête moderne
const ModernHeader = memo(({ onMenuClick, user, notifications }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { subscription, getCurrentPlan } = useStore();

  const currentPlan = getCurrentPlan();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: DESIGN_SYSTEM.shadows.sm,
        zIndex: theme.zIndex.drawer + 1,
      }}
      elevation={0}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{
              display: { md: 'none' },
              color: theme.palette.text.primary,
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            sx={{
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
              color: theme.palette.text.primary,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {t('app.title')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Indicateur d'abonnement */}
          {currentPlan && currentPlan.id !== 'free' && (
            <Chip
              icon={<CardMembership />}
              label={t(`subscription.${currentPlan.id}`)}
              size="small"
              sx={{
                background: DESIGN_SYSTEM.gradients.primary,
                color: 'white',
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                '& .MuiChip-icon': {
                  color: 'white',
                }
              }}
            />
          )}

          {/* Notifications */}
          <IconButton
            color="inherit"
            sx={{ color: theme.palette.text.primary }}
          >
            <Badge badgeContent={notifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Avatar utilisateur */}
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: DESIGN_SYSTEM.gradients.primary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            <AccountIcon />
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

ModernHeader.displayName = 'ModernHeader';

// Composant de navigation latérale
const ModernSidebar = memo(({ open, onClose, currentPath }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = useCallback((path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  }, [navigate, isMobile, onClose]);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* En-tête du drawer */}
      <Box
        sx={{
          p: 3,
          background: DESIGN_SYSTEM.gradients.primary,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
            mb: 1,
          }}
        >
          {t('app.title')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
          }}
        >
          {t('app.subtitle')}
        </Typography>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: DESIGN_SYSTEM.borderRadius.xl,
                  background: isActive ? item.gradient : 'transparent',
                  color: isActive ? 'white' : theme.palette.text.primary,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: isActive ? item.gradient : 'rgba(14, 165, 233, 0.08)',
                    transform: 'translateX(4px)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? 'white' : item.color,
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={t(item.label)}
                  primaryTypographyProps={{
                    fontWeight: isActive 
                      ? DESIGN_SYSTEM.typography.fontWeight.semibold 
                      : DESIGN_SYSTEM.typography.fontWeight.medium,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Footer du drawer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
          }}
        >
          {t('app.version')} v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Meilleure performance sur mobile
      }}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: DESIGN_SYSTEM.shadows.lg,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
});

ModernSidebar.displayName = 'ModernSidebar';

// Composant principal du Layout moderne
const ModernLayout = memo(() => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen]);

  const handleDrawerClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  // Fermer le drawer mobile lors du changement de route
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation latérale */}
      <ModernSidebar
        open={mobileOpen}
        onClose={handleDrawerClose}
        currentPath={location.pathname}
      />

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          background: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {/* En-tête */}
        <ModernHeader
          onMenuClick={handleDrawerToggle}
          notifications={notifications}
        />

        {/* Contenu de la page */}
        <Box
          sx={{
            pt: { xs: 8, md: 9 },
            px: { xs: 2, md: 4 },
            pb: { xs: 10, md: 4 },
            minHeight: '100vh',
          }}
        >
          <Fade in timeout={300}>
            <Box>
              <Outlet />
            </Box>
          </Fade>
        </Box>

        {/* Menu flottant moderne */}
        <ModernFloatingMenu />
      </Box>
    </Box>
  );
});

ModernLayout.displayName = 'ModernLayout';

export default ModernLayout; 