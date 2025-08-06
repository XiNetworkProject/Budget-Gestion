import React, { memo, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Chip,
  Tooltip,
  Zoom,
  Fade
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  AccountBalance
} from '@mui/icons-material';
import CurrencyFormatter from '../CurrencyFormatter';

const AnimatedBalance = memo(({ value, trend, currency = "EUR" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const startValue = displayValue;
    const endValue = value;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setDisplayValue(Math.round(currentValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp sx={{ color: '#4caf50' }} />;
    if (trend < 0) return <TrendingDown sx={{ color: '#f44336' }} />;
    return null;
  };

  const getTrendColor = () => {
    if (trend > 0) return '#4caf50';
    if (trend < 0) return '#f44336';
    return '#ff9800';
  };

  return (
    <Box sx={{ textAlign: 'center', mb: 2 }}>
      <Typography 
        variant="h2" 
        sx={{ 
          fontWeight: 900,
          fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
          color: 'white',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          mb: 1,
          transition: 'all 0.3s ease',
          transform: isAnimating ? 'scale(1.05)' : 'scale(1)'
        }}
      >
        <CurrencyFormatter amount={displayValue} />
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
        {getTrendIcon() && (
          <Tooltip title={`Tendance: ${trend > 0 ? '+' : ''}${trend}%`} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getTrendIcon()}
            </Box>
          </Tooltip>
        )}
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500
          }}
        >
          Solde {trend > 0 ? 'positif' : trend < 0 ? 'négatif' : 'stable'}
        </Typography>
      </Box>
    </Box>
  );
});

const PerformanceIndicator = memo(({ label, value, target, color = "#4caf50" }) => {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const isGood = percentage >= 80;
  const isWarning = percentage >= 60 && percentage < 80;
  const isPoor = percentage < 60;

  const getStatusIcon = () => {
    if (isGood) return <CheckCircle sx={{ color: '#4caf50' }} />;
    if (isWarning) return <Warning sx={{ color: '#ff9800' }} />;
    return <Warning sx={{ color: '#f44336' }} />;
  };

  const getStatusColor = () => {
    if (isGood) return '#4caf50';
    if (isWarning) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 500
          }}
        >
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getStatusIcon()}
          <Typography 
            variant="body2" 
            sx={{ 
              color: getStatusColor(),
              fontWeight: 600
            }}
          >
            {Math.round(percentage)}%
          </Typography>
        </Box>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        sx={{ 
          height: 6,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.2)',
          '& .MuiLinearProgress-bar': { 
            bgcolor: getStatusColor(),
            borderRadius: 3
          }
        }}
      />
    </Box>
  );
});

const BalanceCard = memo(({ 
  selectedMonthSaved, 
  getMonthName, 
  selectedMonth, 
  selectedYear,
  income = 0,
  expenses = 0,
  savingsRate = 0,
  budgetRespect = 0,
  t 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const balanceTrend = selectedMonthSaved > 0 ? 5 : selectedMonthSaved < 0 ? -3 : 0;
  const savingsRatePercentage = income > 0 ? (selectedMonthSaved / income) * 100 : 0;

  return (
    <Fade in={isVisible} timeout={1000}>
      <Box sx={{ 
        p: 4, 
        mb: 4,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
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
        {/* Titre de la section */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 1
            }}
          >
            Solde Principal
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontStyle: 'italic'
            }}
          >
            {getMonthName(selectedMonth, selectedYear)}
          </Typography>
        </Box>

        {/* Solde animé */}
        <AnimatedBalance 
          value={selectedMonthSaved}
          trend={balanceTrend}
          currency="EUR"
        />

        {/* Indicateurs de performance */}
        <Box sx={{ mt: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'white',
              mb: 2,
              textAlign: 'center'
            }}
          >
            Indicateurs de Performance
          </Typography>
          
          <PerformanceIndicator 
            label="Taux d'épargne"
            value={savingsRatePercentage}
            target={20}
            color="#4caf50"
          />
          
          <PerformanceIndicator 
            label="Respect du budget"
            value={budgetRespect}
            target={100}
            color="#2196f3"
          />
        </Box>

        {/* Statut global */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3 
        }}>
          <Chip
            icon={selectedMonthSaved >= 0 ? <CheckCircle /> : <Warning />}
            label={selectedMonthSaved >= 0 ? 'Finances saines' : 'Attention requise'}
            sx={{
              bgcolor: selectedMonthSaved >= 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              fontWeight: 600
            }}
          />
        </Box>
      </Box>
    </Fade>
  );
});

AnimatedBalance.displayName = 'AnimatedBalance';
PerformanceIndicator.displayName = 'PerformanceIndicator';
BalanceCard.displayName = 'BalanceCard';

export default BalanceCard; 