import React, { useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
  Slide,
  Zoom,
  Tooltip
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalFireDepartment as FireIcon,
  Diamond as DiamondIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';

const Gamification = () => {
  const { t } = useTranslation();
  const {
    expenses,
    incomeTransactions,
    savings,
    debts,
    revenus,
    selectedMonth,
    selectedYear,
    getSelectedMonthIndex,
    user
  } = useStore();

  const [expanded, setExpanded] = useState(false);
  const selectedMonthIndex = getSelectedMonthIndex();

  // Calculs pour la gamification
  const gamificationData = useMemo(() => {
    const currentMonth = selectedMonthIndex;
    
    // Dépenses du mois
    const monthlyExpenses = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === selectedMonth && 
               expDate.getFullYear() === selectedYear;
      })
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    // Revenus du mois
    const monthlyIncome = revenus[currentMonth] || 0;
    const monthlyIncomeTransactions = incomeTransactions
      .filter(inc => {
        const incDate = new Date(inc.date);
        return incDate.getMonth() === selectedMonth && 
               incDate.getFullYear() === selectedYear;
      })
      .reduce((sum, inc) => sum + (inc.amount || 0), 0);
    
    const totalIncome = monthlyIncome + monthlyIncomeTransactions;
    const balance = totalIncome - monthlyExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    
    // Calcul du niveau et XP
    let xp = 0;
    let level = 1;
    
    // XP basé sur l'épargne
    if (balance > 0) {
      xp += Math.floor(balance / 10); // 1 XP par 10€ épargnés
    }
    
    // XP basé sur le taux d'épargne
    if (savingsRate >= 10) {
      xp += 50; // Bonus pour 10% d'épargne
    }
    if (savingsRate >= 20) {
      xp += 100; // Bonus pour 20% d'épargne
    }
    
    // XP basé sur le nombre de transactions
    const transactionCount = expenses.length + incomeTransactions.length;
    xp += Math.floor(transactionCount / 5); // 1 XP par 5 transactions
    
    // XP basé sur les objectifs d'épargne
    const savingsGoals = savings.length;
    xp += savingsGoals * 25; // 25 XP par objectif d'épargne
    
    // Calcul du niveau (100 XP par niveau)
    level = Math.floor(xp / 100) + 1;
    const xpInCurrentLevel = xp % 100;
    const xpForNextLevel = 100 - xpInCurrentLevel;
    
    // Streak (jours consécutifs d'utilisation)
    const today = new Date();
    const lastTransaction = [...expenses, ...incomeTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    let streak = 0;
    if (lastTransaction) {
      const lastDate = new Date(lastTransaction.date);
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        streak = 1; // Au moins une transaction aujourd'hui ou hier
      }
    }
    
    return {
      xp,
      level,
      xpInCurrentLevel,
      xpForNextLevel,
      balance,
      savingsRate,
      transactionCount,
      savingsGoals,
      streak
    };
  }, [selectedMonthIndex, selectedMonth, selectedYear, expenses, incomeTransactions, revenus, savings]);

  // Génération des badges
  const badges = useMemo(() => {
    const badgesList = [];
    
    // Badge d'épargne
    if (gamificationData.balance > 0) {
      badgesList.push({
        id: 'saver',
        name: 'Épargnant',
        description: 'A économisé de l\'argent ce mois-ci',
        icon: <SavingsIcon color="success" />,
        color: '#10b981',
        unlocked: true
      });
    }
    
    // Badge de taux d'épargne
    if (gamificationData.savingsRate >= 10) {
      badgesList.push({
        id: 'smart_saver',
        name: 'Épargnant Intelligent',
        description: 'Taux d\'épargne de 10% ou plus',
        icon: <BrainIcon color="primary" />,
        color: '#3b82f6',
        unlocked: true
      });
    }
    
    if (gamificationData.savingsRate >= 20) {
      badgesList.push({
        id: 'expert_saver',
        name: 'Expert Épargnant',
        description: 'Taux d\'épargne de 20% ou plus',
        icon: <DiamondIcon color="primary" />,
        color: '#8b5cf6',
        unlocked: true
      });
    }
    
    // Badge de transactions
    if (gamificationData.transactionCount >= 10) {
      badgesList.push({
        id: 'active_user',
        name: 'Utilisateur Actif',
        description: '10 transactions ou plus',
        icon: <TrendingUpIcon color="info" />,
        color: '#06b6d4',
        unlocked: true
      });
    }
    
    // Badge d'objectifs
    if (gamificationData.savingsGoals >= 1) {
      badgesList.push({
        id: 'goal_setter',
        name: 'Définisseur d\'Objectifs',
        description: 'A créé au moins un objectif d\'épargne',
        icon: <CheckCircleIcon color="success" />,
        color: '#059669',
        unlocked: true
      });
    }
    
    // Badges non débloqués (motivation)
    if (gamificationData.savingsRate < 10) {
      badgesList.push({
        id: 'smart_saver_locked',
        name: 'Épargnant Intelligent',
        description: 'Atteindre 10% d\'épargne',
        icon: <BrainIcon color="disabled" />,
        color: '#9ca3af',
        unlocked: false
      });
    }
    
    if (gamificationData.transactionCount < 10) {
      badgesList.push({
        id: 'active_user_locked',
        name: 'Utilisateur Actif',
        description: 'Effectuer 10 transactions',
        icon: <TrendingUpIcon color="disabled" />,
        color: '#9ca3af',
        unlocked: false
      });
    }
    
    return badgesList;
  }, [gamificationData]);

  const handleToggleExpand = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const lockedBadges = badges.filter(badge => !badge.unlocked);

  return (
    <Fade in timeout={1000}>
      <Card sx={{ 
        background: 'linear-gradient(135deg, #fbbf2415 0%, #f59e0a05 100%)',
        border: '1px solid #fbbf2430',
        borderRadius: 3,
        mb: 2
      }}>
        <CardContent sx={{ p: 3 }}>
          {/* En-tête */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#fbbf24', width: 40, height: 40 }}>
                <TrophyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Progression
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Niveau {gamificationData.level} • {gamificationData.xp} XP
                </Typography>
              </Box>
            </Box>
            
            <IconButton onClick={handleToggleExpand} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          {/* Barre de progression */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Niveau {gamificationData.level}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {gamificationData.xpInCurrentLevel}/100 XP
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={gamificationData.xpInCurrentLevel}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#fbbf2420',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#fbbf24',
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {gamificationData.xpForNextLevel} XP pour le niveau {gamificationData.level + 1}
            </Typography>
          </Box>

          {/* Streak */}
          {gamificationData.streak > 0 && (
            <Zoom in timeout={300}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FireIcon sx={{ color: '#ef4444' }} />
                <Typography variant="body2" fontWeight="bold">
                  Streak de {gamificationData.streak} jour{gamificationData.streak > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Zoom>
          )}

          {/* Badges débloqués */}
          {unlockedBadges.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Badges débloqués ({unlockedBadges.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {unlockedBadges.map((badge) => (
                  <Tooltip key={badge.id} title={badge.description} arrow>
                    <Chip
                      icon={badge.icon}
                      label={badge.name}
                      size="small"
                      sx={{
                        bgcolor: `${badge.color}20`,
                        border: `1px solid ${badge.color}40`,
                        color: badge.color,
                        fontWeight: 'bold'
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          )}

          {/* Détails (expandable) */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 2 }} />
            
            {/* Statistiques détaillées */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {gamificationData.transactionCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Transactions
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {gamificationData.savingsGoals}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Objectifs
                </Typography>
              </Box>
            </Box>

            {/* Badges à débloquer */}
            {lockedBadges.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Badges à débloquer
                </Typography>
                <List dense>
                  {lockedBadges.map((badge, index) => (
                    <Slide direction="up" in timeout={500 + index * 100} key={badge.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {badge.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={badge.name}
                          secondary={badge.description}
                        />
                      </ListItem>
                    </Slide>
                  ))}
                </List>
              </Box>
            )}
          </Collapse>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default Gamification; 