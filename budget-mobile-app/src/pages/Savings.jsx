import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  LinearProgress, 
  Chip, 
  IconButton, 
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  Tooltip,
  Container,
  MenuItem,
  Fade,
  Zoom
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  Savings as SavingsIcon,
  Flag,
  CheckCircle,
  Warning,
  Info,
  Target,
  CalendarToday,
  Euro,
  MoreVert,
  Star
} from '@mui/icons-material';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Legend,
  ArcElement
} from 'chart.js';
import FeatureRestriction, { useFeatureRestriction } from '../components/FeatureRestriction';
import notificationService from '../services/notificationService';

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, ArcElement);

const Savings = () => {
  const { 
    savings, 
    addSavingsGoal, 
    updateSavingsGoal, 
    deleteSavingsGoal,
    activeAccount,
    months,
    sideByMonth,
    selectedMonth,
    selectedYear,
    getCurrentPlan,
    checkUsageLimit
  } = useStore();

  const { t } = useTranslation();

  // Vérifier les restrictions pour les objectifs d'épargne
  const savingsRestriction = useFeatureRestriction('maxSavingsGoals', savings?.length || 0);

  // Notifier les limites d'utilisation
  useEffect(() => {
    notificationService.checkAndNotifyLimits('maxSavingsGoals', savings?.length || 0);
  }, [savings?.length]);

  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ 
    name: '', 
    target: '', 
    current: '', 
    icon: '💰',
    deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Filtrer les objectifs par compte actif
  const goals = savings.filter(goal => !activeAccount || goal.accountId === activeAccount.id);

  // Calculer les vraies données d'épargne mensuelle
  const getMonthlySavingsData = () => {
    // Utiliser les 6 derniers mois disponibles
    const last6Months = months.slice(-6);
    const last6MonthsSavings = sideByMonth.slice(-6);
    
    return {
      labels: last6Months,
      data: last6MonthsSavings
    };
  };

  const monthlyData = getMonthlySavingsData();

  // Calculer l'épargne totale actuelle (objectifs + épargne mensuelle)
  const totalSaved = goals.reduce((sum, goal) => sum + (goal.current || 0), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + (goal.target || 0), 0);
  const overallProgress = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

  // Calculer l'épargne du mois actuel
  const currentMonthSavings = sideByMonth[sideByMonth.length - 1] || 0;
  const averageMonthlySavings = sideByMonth.length > 0 
    ? sideByMonth.reduce((sum, val) => sum + val, 0) / sideByMonth.length 
    : 0;

  // Calculer l'évolution de l'épargne
  const getSavingsEvolution = () => {
    if (sideByMonth.length < 2) return 0;
    const current = sideByMonth[sideByMonth.length - 1] || 0;
    const previous = sideByMonth[sideByMonth.length - 2] || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const savingsEvolution = getSavingsEvolution();
  const isEvolutionPositive = parseFloat(savingsEvolution) >= 0;

  const barData = {
    labels: monthlyData.labels,
    datasets: [{
      label: 'Épargne mensuelle',
      data: monthlyData.data,
      backgroundColor: 'rgba(75, 192, 192, 0.8)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const doughnutData = {
    labels: goals.map(goal => goal.name),
    datasets: [{
      data: goals.map(goal => goal.current || 0),
      backgroundColor: goals.map(goal => goal.color || '#1976d2'),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}€`;
          }
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '€';
          }
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Épargne: ${context.parsed}€`;
          },
          title: function(context) {
            return `Mois: ${context[0].label}`;
          }
        }
      }
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) {
      return;
    }

    // Vérifier les restrictions avant d'ajouter
    if (!savingsRestriction.canUse) {
      notificationService.notifyApproachingLimit('maxSavingsGoals', savings?.length || 0, getCurrentPlan().features.maxSavingsGoals);
      return;
    }

    const goal = {
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current) || 0,
      icon: newGoal.icon,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      deadline: newGoal.deadline,
      accountId: activeAccount?.id
    };
    addSavingsGoal(goal);
    setAddDialog(false);
    setNewGoal({ 
      name: '', 
      target: '', 
      current: '', 
      icon: '💰',
      deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setSnack({ open: true, message: t('savings.goalAdded'), severity: 'success' });
  };

  const handleEditGoal = () => {
    if (selectedGoal) {
      updateSavingsGoal(selectedGoal.id, {
        name: newGoal.name,
        target: parseFloat(newGoal.target),
        current: parseFloat(newGoal.current) || 0,
        icon: newGoal.icon,
        deadline: newGoal.deadline
      });
      setEditDialog(false);
      setSelectedGoal(null);
      setNewGoal({ 
        name: '', 
        target: '', 
        current: '', 
        icon: '💰',
        deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setSnack({ open: true, message: t('savings.goalModified'), severity: 'success' });
    }
  };

  const handleDeleteGoal = () => {
    if (selectedGoal) {
      deleteSavingsGoal(selectedGoal.id);
      setDeleteDialog(false);
      setSelectedGoal(null);
      setSnack({ open: true, message: t('savings.goalDeleted'), severity: 'info' });
    }
  };

  const handleUpdateProgress = (goalId, amount) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newCurrent = Math.min((goal.current || 0) + amount, goal.target);
      updateSavingsGoal(goalId, { current: newCurrent });
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'warning';
    return 'primary';
  };

  const getDaysUntilDeadline = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        {t('savings.title')}
      </Typography>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SavingsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">{t('savings.totalSaved')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalSaved.toLocaleString()}€
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                {t('savings.on')} {totalTarget.toLocaleString()}€
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">{t('savings.progression')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {overallProgress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(overallProgress)} 
                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Flag sx={{ mr: 1 }} />
                <Typography variant="h6">{t('savings.goals')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {goals.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                {goals.filter(g => g.target > 0 && ((g.current || 0) / g.target) >= 1).length} {t('savings.achieved')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Info sx={{ mr: 1 }} />
                <Typography variant="h6">{t('savings.averageMonthly')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {Math.round(averageMonthlySavings)}€
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                {t('savings.thisMonth')}: {Math.round(currentMonthSavings)}€
              </Typography>
              {sideByMonth.length >= 2 && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.8, 
                    color: isEvolutionPositive ? '#4caf50' : '#f44336',
                    fontWeight: 'bold'
                  }} 
                  component="span"
                >
                  {isEvolutionPositive ? '+' : ''}{savingsEvolution}% {t('savings.vsPreviousMonth')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Objectifs d'épargne */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{t('savings.savingsGoals')}</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddDialog(true)}
          >
            {t('savings.addGoal')}
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          {goals.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('savings.noSavingsGoals')}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span">
                  {t('savings.addFirstGoal')}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            goals.map((goal) => {
              const progress = goal.target > 0 ? ((goal.current || 0) / goal.target * 100).toFixed(1) : 0;
              const daysLeft = getDaysUntilDeadline(goal.deadline);
              
              return (
                <Grid item xs={12} md={6} lg={4} key={goal.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h3" sx={{ mr: 1 }}>{goal.icon || '💰'}</Typography>
                          <Box>
                            <Typography variant="h6">{goal.name}</Typography>
                            <Typography variant="body2" color="text.secondary" component="span">
                              {daysLeft} {t('savings.daysLeft')}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          {progress >= 100 && <CheckCircle color="success" />}
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedGoal(goal);
                              setNewGoal({ name: goal.name, target: goal.target, current: goal.current || 0, icon: goal.icon || '💰', deadline: goal.deadline });
                              setEditDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setSelectedGoal(goal);
                              setDeleteDialog(true);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" component="span">
                            {(goal.current || 0).toLocaleString()}€ / {goal.target.toLocaleString()}€
                          </Typography>
                          <Chip 
                            label={`${progress}%`} 
                            size="small" 
                            color={getProgressColor(progress)}
                          />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(parseFloat(progress), 100)} 
                          color={getProgressColor(progress)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleUpdateProgress(goal.id, 100)}
                          disabled={(goal.current || 0) >= goal.target}
                        >
                          +100€
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleUpdateProgress(goal.id, 500)}
                          disabled={(goal.current || 0) >= goal.target}
                        >
                          +500€
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      </Paper>

      {/* Graphiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('savings.monthlySavingsEvolution')}
            </Typography>
            {sideByMonth.length === 0 ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {t('savings.noSavingsData')}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: 300 }}>
                <Bar data={barData} options={barOptions} />
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('savings.savingsDistribution')}
            </Typography>
            {goals.length === 0 ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {t('savings.noSavingsGoals')}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: 300 }}>
                <Doughnut data={doughnutData} options={chartOptions} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('savings.addGoalTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('savings.goalName')}
            fullWidth
            variant="outlined"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('savings.targetAmount')}
            type="number"
            fullWidth
            variant="outlined"
            value={newGoal.target}
            onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('savings.currentAmount')}
            type="number"
            fullWidth
            variant="outlined"
            value={newGoal.current}
            onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('savings.deadline')}
            type="date"
            fullWidth
            variant="outlined"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>{t('savings.cancel')}</Button>
          <Button 
            onClick={handleAddGoal} 
            variant="contained"
            disabled={!newGoal.name || !newGoal.target}
          >
            {t('savings.add')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('savings.modifyGoalTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('savings.goalName')}
            fullWidth
            variant="outlined"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('savings.targetAmount')}
            type="number"
            fullWidth
            variant="outlined"
            value={newGoal.target}
            onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('savings.currentAmount')}
            type="number"
            fullWidth
            variant="outlined"
            value={newGoal.current}
            onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('savings.deadline')}
            type="date"
            fullWidth
            variant="outlined"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>{t('savings.cancel')}</Button>
          <Button 
            onClick={handleEditGoal} 
            variant="contained"
            disabled={!newGoal.name || !newGoal.target}
          >
            {t('savings.modify')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>{t('savings.deleteGoalTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('savings.areYouSureDelete', { goalName: selectedGoal?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>{t('savings.cancel')}</Button>
          <Button onClick={handleDeleteGoal} color="error" variant="contained">
            {t('savings.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snack.open} 
        autoHideDuration={3000} 
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Savings; 