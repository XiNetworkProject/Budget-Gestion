import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Fade,
  Slide,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Savings as SavingsIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { useStore } from '../store';
import MinimalistDashboard from '../components/optimized/MinimalistDashboard';
import QuickAddModal from '../components/optimized/QuickAddModal';
import FloatingActionButton from '../components/optimized/FloatingActionButton';

const HomeOptimized = () => {
  const { 
    user,
    getCurrentPlan,
    isFeatureAvailable,
    appSettings
  } = useStore();

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState('expense');
  const [showFAB, setShowFAB] = useState(true);

  const currentPlan = getCurrentPlan();

  // Masquer le FAB lors du scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowFAB(currentScrollY < lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickAdd = (type) => {
    setQuickAddType(type);
    setQuickAddOpen(true);
  };

  const handleCloseQuickAdd = () => {
    setQuickAddOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) {
      return user?.email?.charAt(0).toUpperCase() || 'U';
    }
    return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: appSettings.theme === 'dark' 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* AppBar minimaliste */}
      <Slide direction="down" in timeout={300}>
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            color: 'text.primary'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton edge="start" color="inherit" aria-label="menu">
                <MenuIcon />
              </IconButton>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {getGreeting()}, {user?.firstName || 'Utilisateur'}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  Budget Gestion
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                {getUserInitials()}
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      </Slide>

      {/* Dashboard minimaliste */}
      <Fade in timeout={500}>
        <Box>
          <MinimalistDashboard />
        </Box>
      </Fade>

      {/* Floating Action Button */}
      <Fade in={showFAB} timeout={300}>
        <Box>
          <FloatingActionButton onAction={handleQuickAdd} />
        </Box>
      </Fade>

      {/* Modal Quick Add */}
      <QuickAddModal 
        open={quickAddOpen}
        onClose={handleCloseQuickAdd}
        type={quickAddType}
      />

      {/* Indicateur de plan */}
      {currentPlan.name !== 'subscription.free' && (
        <Slide direction="up" in timeout={1000}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 80,
              left: 16,
              zIndex: 999,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 2,
              fontSize: '0.8rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
            }}
          >
            {currentPlan.name === 'subscription.premium' ? 'Premium' : 'Pro'}
          </Box>
        </Slide>
      )}

      {/* Espace pour la navigation bottom */}
      <Box sx={{ height: 80 }} />
    </Box>
  );
};

export default HomeOptimized; 