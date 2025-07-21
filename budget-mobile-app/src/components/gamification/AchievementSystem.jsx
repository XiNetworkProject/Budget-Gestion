import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Fade,
  Zoom,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  TrendingUp,
  Savings,
  CheckCircle,
  Warning,
  Psychology,
  AttachMoney,
  LocalFireDepartment,
  Diamond,
  Celebration,
  Bolt
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';

const AchievementSystem = () => {
  const { t } = useTranslation();
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  
  const {
    data,
    categories,
    revenus,
    expenses,
    savings,
    debts,
    selectedMonth,
    selectedYear,
    appSettings
  } = useStore();

  // Calculs pour les achievements
  const achievementData = useMemo(() => {
    const currentMonthIndex = selectedMonth;
    const currentExpenses = categories.map(cat => data[cat]?.[currentMonthIndex] || 0);
    const totalExpenses = currentExpenses.reduce((sum, val) => sum + val, 0);
    const totalIncome = revenus[currentMonthIndex] || 0;
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    
    // Calculer les streaks
    const expenseStreak = calculateStreak(expenses, 'expense');
    const savingsStreak = calculateStreak(savings, 'savings');
    const budgetStreak = calculateBudgetStreak();
    
    return {
      balance,
      totalExpenses,
      totalIncome,
      savingsRate,
      expenseStreak,
      savingsStreak,
      budgetStreak,
      totalSavings: savings.reduce((sum, goal) => sum + (goal.progress || 0), 0),
      debtFree: debts.length === 0 || debts.every(debt => debt.paidAmount >= debt.amount)
    };
  }, [data, categories, revenus, expenses, savings, debts, selectedMonth]);

  // Calculer les streaks
  function calculateStreak(items, type) {
    if (!items || items.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = items.length - 1; i >= 0; i--) {
      const itemDate = new Date(items[i].date || items[i].createdAt);
      const daysDiff = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak + 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function calculateBudgetStreak() {
    // Calculer combien de mois consécutifs le budget a été respecté
    let streak = 0;
    const months = Object.keys(data[categories[0]] || {}).length;
    
    for (let i = months - 1; i >= 0; i--) {
      const monthExpenses = categories.map(cat => data[cat]?.[i] || 0);
      const totalMonthExpenses = monthExpenses.reduce((sum, val) => sum + val, 0);
      const monthIncome = revenus[i] || 0;
      
      if (totalMonthExpenses <= monthIncome) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Définir les achievements
  const achievements = useMemo(() => [
    {
      id: 'first_expense',
      title: 'Premier Pas',
      description: 'Ajoutez votre première dépense',
      icon: <AttachMoney />,
      color: 'primary',
      condition: () => expenses.length >= 1,
      experience: 10,
      category: 'beginner'
    },
    {
      id: 'budget_master',
      title: 'Maître du Budget',
      description: 'Respectez votre budget pendant 3 mois consécutifs',
      icon: <TrendingUp />,
      color: 'success',
      condition: () => achievementData.budgetStreak >= 3,
      experience: 50,
      category: 'intermediate'
    },
    {
      id: 'savings_champion',
      title: 'Champion de l\'Épargne',
      description: 'Atteignez un taux d\'épargne de 20%',
      icon: <Savings />,
      color: 'info',
      condition: () => achievementData.savingsRate >= 20,
      experience: 30,
      category: 'intermediate'
    },
    {
      id: 'debt_free',
      title: 'Libéré des Dettes',
      description: 'Remettez toutes vos dettes à zéro',
      icon: <CheckCircle />,
      color: 'success',
      condition: () => achievementData.debtFree,
      experience: 100,
      category: 'advanced'
    },
    {
      id: 'streak_master',
      title: 'Maître des Séries',
      description: 'Maintenez une série de 7 jours d\'enregistrement',
      icon: <LocalFireDepartment />,
      color: 'warning',
      condition: () => achievementData.expenseStreak >= 7,
      experience: 40,
      category: 'intermediate'
    },
    {
      id: 'goal_crusher',
      title: 'Briseur d\'Objectifs',
      description: 'Atteignez 3 objectifs d\'épargne',
      icon: <EmojiEvents />,
      color: 'secondary',
      condition: () => savings.filter(goal => goal.progress >= goal.target).length >= 3,
      experience: 75,
      category: 'advanced'
    },
    {
      id: 'analytics_expert',
      title: 'Expert en Analytics',
      description: 'Consultez vos analyses pendant 5 jours consécutifs',
      icon: <Psychology />,
      color: 'info',
      condition: () => false, // À implémenter avec le tracking des visites
      experience: 25,
      category: 'intermediate'
    },
    {
      id: 'zen_master',
      title: 'Maître Zen',
      description: 'Utilisez le mode zen pendant 30 jours',
      icon: <Diamond />,
      color: 'secondary',
      condition: () => false, // À implémenter avec le tracking du mode zen
      experience: 150,
      category: 'legendary'
    }
  ], [achievementData, expenses, savings]);

  // Vérifier les achievements débloqués
  const unlockedAchievements = useMemo(() => {
    return achievements.filter(achievement => achievement.condition());
  }, [achievements]);

  const lockedAchievements = useMemo(() => {
    return achievements.filter(achievement => !achievement.condition());
  }, [achievements]);

  // Calculer l'expérience totale
  const totalExperience = useMemo(() => {
    return unlockedAchievements.reduce((sum, achievement) => sum + achievement.experience, 0);
  }, [unlockedAchievements]);

  // Calculer le niveau
  const calculateLevel = (exp) => {
    return Math.floor(exp / 100) + 1;
  };

  const currentLevel = calculateLevel(totalExperience);
  const experienceInCurrentLevel = totalExperience % 100;
  const experienceToNextLevel = 100 - experienceInCurrentLevel;

  // Titres de niveau
  const levelTitles = {
    1: 'Débutant',
    2: 'Apprenti',
    3: 'Initié',
    4: 'Confirmé',
    5: 'Expert',
    6: 'Maître',
    7: 'Grand Maître',
    8: 'Légende',
    9: 'Mythique',
    10: 'Divin'
  };

  // Vérifier les nouveaux achievements
  useEffect(() => {
    const newAchievements = unlockedAchievements.filter(achievement => {
      // Logique pour détecter les nouveaux achievements
      return !localStorage.getItem(`achievement_${achievement.id}`);
    });

    if (newAchievements.length > 0) {
      const latestAchievement = newAchievements[newAchievements.length - 1];
      setCurrentAchievement(latestAchievement);
      setShowAchievement(true);
      
      // Marquer comme vu
      localStorage.setItem(`achievement_${latestAchievement.id}`, 'true');
      
      // Ajouter l'expérience
      setExperience(prev => prev + latestAchievement.experience);
    }
  }, [unlockedAchievements]);

  // Composant d'affichage des achievements
  const AchievementCard = ({ achievement, isUnlocked = false }) => (
    <Fade in timeout={600}>
      <Card 
        sx={{ 
          mb: 2,
          opacity: isUnlocked ? 1 : 0.6,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: isUnlocked ? 'translateY(-4px)' : 'none',
            boxShadow: isUnlocked ? 4 : 1
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Badge
              badgeContent={isUnlocked ? '✓' : '🔒'}
              color={isUnlocked ? 'success' : 'default'}
            >
              <Avatar 
                sx={{ 
                  bgcolor: isUnlocked ? `${achievement.color}.main` : 'grey.400',
                  color: 'white'
                }}
              >
                {achievement.icon}
              </Avatar>
            </Badge>
            
            <Box flex={1}>
              <Typography variant="h6" color={isUnlocked ? 'text.primary' : 'text.secondary'}>
                {achievement.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {achievement.description}
              </Typography>
              {isUnlocked && (
                <Chip 
                  label={`+${achievement.experience} XP`}
                  size="small"
                  color={achievement.color}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );

  // Dialog de félicitations
  const AchievementDialog = () => (
    <Dialog 
      open={showAchievement} 
      onClose={() => setShowAchievement(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Zoom in timeout={800}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: `${currentAchievement?.color}.main`,
                color: 'white'
              }}
            >
              {currentAchievement?.icon}
            </Avatar>
            <Typography variant="h5" color="primary">
              🎉 Achievement Débloqué !
            </Typography>
          </Box>
        </Zoom>
      </DialogTitle>
      
      <DialogContent>
        <Box textAlign="center">
          <Typography variant="h6" gutterBottom>
            {currentAchievement?.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {currentAchievement?.description}
          </Typography>
          <Chip 
            label={`+${currentAchievement?.experience} XP`}
            color={currentAchievement?.color}
            icon={<Star />}
            size="large"
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setShowAchievement(false)} color="primary">
          Continuer
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header avec niveau */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          🏆 Système de Récompenses
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary">
            Niveau {currentLevel} - {levelTitles[currentLevel] || 'Légende'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={(experienceInCurrentLevel / 100) * 100}
              sx={{ flex: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary">
              {experienceInCurrentLevel}/{100} XP
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {experienceToNextLevel} XP pour le niveau suivant
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="center" gap={2}>
          <Chip 
            label={`${unlockedAchievements.length}/${achievements.length} Achievements`}
            color="primary"
            icon={<EmojiEvents />}
          />
          <Chip 
            label={`${totalExperience} XP Total`}
            color="secondary"
            icon={<Star />}
          />
        </Box>
      </Box>

      {/* Achievements débloqués */}
      <Typography variant="h6" gutterBottom>
        ✅ Achievements Débloqués ({unlockedAchievements.length})
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {unlockedAchievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <AchievementCard achievement={achievement} isUnlocked={true} />
          </Grid>
        ))}
      </Grid>

      {/* Achievements verrouillés */}
      <Typography variant="h6" gutterBottom>
        🔒 Achievements à Débloquer ({lockedAchievements.length})
      </Typography>
      <Grid container spacing={2}>
        {lockedAchievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <AchievementCard achievement={achievement} isUnlocked={false} />
          </Grid>
        ))}
      </Grid>

      {/* Dialog de félicitations */}
      <AchievementDialog />
    </Box>
  );
};

export default AchievementSystem; 