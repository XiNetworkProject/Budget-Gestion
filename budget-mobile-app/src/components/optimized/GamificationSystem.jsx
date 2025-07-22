import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  LinearProgress, 
  Chip, 
  IconButton, 
  Grid,
  Fade,
  Zoom,
  Tooltip,
  Avatar,
  Badge
} from '@mui/material';
import {
  Star,
  Diamond,
  Trophy,
  EmojiEvents,
  TrendingUp,
  Savings,
  AttachMoney,
  Target,
  CheckCircle,
  Lock,
  Bolt,
  Psychology
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';

// Types d'objectifs
const GOAL_TYPES = {
  SAVINGS: 'savings',
  EXPENSE_REDUCTION: 'expense_reduction',
  CONSISTENCY: 'consistency',
  CATEGORY: 'category',
  INCOME: 'income'
};

// Configuration des objectifs
const GOAL_CONFIG = {
  [GOAL_TYPES.SAVINGS]: {
    icon: <Savings />,
    color: '#4caf50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4caf50'
  },
  [GOAL_TYPES.EXPENSE_REDUCTION]: {
    icon: <TrendingUp />,
    color: '#ff9800',
    bgColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: '#ff9800'
  },
  [GOAL_TYPES.CONSISTENCY]: {
    icon: <Bolt />,
    color: '#2196f3',
    bgColor: 'rgba(33, 150, 243, 0.1)',
    borderColor: '#2196f3'
  },
  [GOAL_TYPES.CATEGORY]: {
    icon: <Target />,
    color: '#9c27b0',
    bgColor: 'rgba(156, 39, 176, 0.1)',
    borderColor: '#9c27b0'
  },
  [GOAL_TYPES.INCOME]: {
    icon: <AttachMoney />,
    color: '#4caf50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4caf50'
  }
};

// Niveaux de difficulté
const DIFFICULTY_LEVELS = {
  EASY: { name: 'easy', points: 10, color: '#4caf50' },
  MEDIUM: { name: 'medium', points: 25, color: '#ff9800' },
  HARD: { name: 'hard', points: 50, color: '#f44336' },
  EXPERT: { name: 'expert', points: 100, color: '#9c27b0' }
};

// Objectifs prédéfinis
const PREDEFINED_GOALS = [
  {
    id: 'first_savings',
    type: GOAL_TYPES.SAVINGS,
    title: 'Première épargne',
    description: 'Épargnez 100€ pour la première fois',
    target: 100,
    difficulty: DIFFICULTY_LEVELS.EASY,
    reward: { type: 'badge', name: 'Épargnant Débutant' }
  },
  {
    id: 'savings_20_percent',
    type: GOAL_TYPES.SAVINGS,
    title: 'Épargnant Responsable',
    description: 'Épargnez 20% de vos revenus',
    target: 20,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    reward: { type: 'badge', name: 'Épargnant Responsable' }
  },
  {
    id: 'reduce_expenses_10',
    type: GOAL_TYPES.EXPENSE_REDUCTION,
    title: 'Réducteur de Dépenses',
    description: 'Réduisez vos dépenses de 10%',
    target: 10,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    reward: { type: 'badge', name: 'Réducteur de Dépenses' }
  },
  {
    id: 'consistency_7_days',
    type: GOAL_TYPES.CONSISTENCY,
    title: 'Suivi Régulier',
    description: 'Enregistrez vos transactions pendant 7 jours consécutifs',
    target: 7,
    difficulty: DIFFICULTY_LEVELS.EASY,
    reward: { type: 'badge', name: 'Suivi Régulier' }
  },
  {
    id: 'consistency_30_days',
    type: GOAL_TYPES.CONSISTENCY,
    title: 'Maître du Suivi',
    description: 'Enregistrez vos transactions pendant 30 jours consécutifs',
    target: 30,
    difficulty: DIFFICULTY_LEVELS.HARD,
    reward: { type: 'badge', name: 'Maître du Suivi' }
  }
];

// Composant d'objectif individuel
const GoalCard = memo(({ goal, progress, onComplete }) => {
  const { t } = useTranslation();
  const config = GOAL_CONFIG[goal.type];
  const difficulty = goal.difficulty;
  const progressPercent = Math.min((progress / goal.target) * 100, 100);
  const isCompleted = progress >= goal.target;

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
                {goal.title}
              </Typography>
              
              <Chip
                label={t(`goals.difficulty.${difficulty.name}`)}
                size="small"
                sx={{
                  bgcolor: difficulty.color,
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}
              />
              
              {isCompleted && (
                <Chip
                  icon={<CheckCircle />}
                  label={t('goals.completed')}
                  size="small"
                  sx={{
                    bgcolor: '#4caf50',
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
              {goal.description}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {t('goals.progress')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {progress} / {goal.target}
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: config.color,
                    borderRadius: 4
                  }
                }}
              />
            </Box>
            
            {goal.reward && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Trophy sx={{ color: '#ffd700', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 600 }}>
                  {goal.reward.name}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Zoom>
  );
});

GoalCard.displayName = 'GoalCard';

// Composant de profil utilisateur avec gamification
const UserProfile = memo(({ userStats }) => {
  const { t } = useTranslation();
  const { totalPoints, level, badges, streak } = userStats;

  const getLevelInfo = (level) => {
    const levels = [
      { name: 'Débutant', color: '#9e9e9e', icon: <Star /> },
      { name: 'Intermédiaire', color: '#4caf50', icon: <Star /> },
      { name: 'Avancé', color: '#2196f3', icon: <Diamond /> },
      { name: 'Expert', color: '#9c27b0', icon: <Trophy /> },
      { name: 'Maître', color: '#ffd700', icon: <EmojiEvents /> }
    ];
    return levels[Math.min(level - 1, levels.length - 1)];
  };

  const levelInfo = getLevelInfo(level);

  return (
    <Paper
      sx={{
        p: 3,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        <Badge
          badgeContent={level}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: levelInfo.color,
              color: 'white',
              fontWeight: 700
            }
          }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: levelInfo.color,
              fontSize: 24
            }}
          >
            {levelInfo.icon}
          </Avatar>
        </Badge>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {levelInfo.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {totalPoints} points • {badges.length} badges
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ 
              color: levelInfo.color, 
              fontWeight: 700 
            }}>
              {totalPoints}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {t('gamification.totalPoints')}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ 
              color: '#ffd700', 
              fontWeight: 700 
            }}>
              {streak}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {t('gamification.streak')} jours
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
});

UserProfile.displayName = 'UserProfile';

// Hook pour la gamification
export const useGamification = () => {
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    level: 1,
    badges: [],
    streak: 0,
    completedGoals: []
  });
  
  const [goals, setGoals] = useState(PREDEFINED_GOALS);
  const store = useStore();

  // Calculer les statistiques utilisateur
  const calculateStats = useCallback(() => {
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

    // Mettre à jour les objectifs avec le progrès
    const updatedGoals = goals.map(goal => {
      let progress = 0;
      
      switch (goal.type) {
        case GOAL_TYPES.SAVINGS:
          if (goal.id === 'first_savings') {
            progress = Math.max(progress, savings);
          } else if (goal.id === 'savings_20_percent') {
            progress = savingsRate;
          }
          break;
        case GOAL_TYPES.EXPENSE_REDUCTION:
          // Logique pour la réduction des dépenses
          break;
        case GOAL_TYPES.CONSISTENCY:
          // Logique pour la cohérence
          break;
      }
      
      return { ...goal, progress };
    });

    setGoals(updatedGoals);
  }, [store, goals]);

  // Mettre à jour les statistiques
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return {
    userStats,
    goals,
    calculateStats
  };
};

// Composant principal de gamification
const GamificationSystem = memo(() => {
  const { userStats, goals } = useGamification();
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
        <Psychology sx={{ color: '#ffd700' }} />
        {t('gamification.title')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <UserProfile userStats={userStats} />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Typography variant="h5" sx={{ 
            mb: 2, 
            fontWeight: 600, 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {t('gamification.objectives')}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                progress={goal.progress || 0}
                onComplete={() => {}}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});

GamificationSystem.displayName = 'GamificationSystem';

export default GamificationSystem; 