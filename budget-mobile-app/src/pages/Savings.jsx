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
  AppBar,
  Fab
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
  AttachMoney,
  MoreVert
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
import CurrencyFormatter from '../components/CurrencyFormatter';

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
    isFeatureAvailable,
    checkUsageLimit
  } = useStore();

  const { t } = useTranslation();

  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ 
    name: '', 
    target: '', 
    current: '', 
    icon: <AttachMoney sx={{ fontSize: 24 }} />,
    deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Filtrer les objectifs par compte actif
  const goals = savings.filter(goal => !activeAccount || goal.accountId === activeAccount.id);

  // Vérifier les limites d'objectifs d'épargne
  const savingsGoalsLimit = checkUsageLimit('maxSavingsGoals', goals.length);
  const canAddMoreGoals = savingsGoalsLimit.allowed;

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
    const goal = {
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current) || 0,
      icon: newGoal.icon,
      deadline: newGoal.deadline,
      accountId: activeAccount?.id
    };

    if (addSavingsGoal(goal)) {
      setSnack({ open: true, message: t('savings.goalAdded'), severity: 'success' });
      setAddDialog(false);
      setNewGoal({ 
        name: '', 
        target: '', 
        current: '', 
        icon: <AttachMoney sx={{ fontSize: 24 }} />,
        deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } else {
      setSnack({ open: true, message: t('savings.errorAddingGoal'), severity: 'error' });
    }
  };

  const handleEditGoal = () => {
    const updatedGoal = {
      ...selectedGoal,
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current) || 0,
      icon: newGoal.icon,
      deadline: newGoal.deadline
    };

    if (updateSavingsGoal(selectedGoal.id, updatedGoal)) {
      setSnack({ open: true, message: t('savings.goalUpdated'), severity: 'success' });
      setEditDialog(false);
    } else {
      setSnack({ open: true, message: t('savings.errorUpdatingGoal'), severity: 'error' });
    }
  };

  const handleDeleteGoal = () => {
    if (deleteSavingsGoal(selectedGoal.id)) {
      setSnack({ open: true, message: t('savings.goalDeleted'), severity: 'success' });
      setDeleteDialog(false);
    } else {
      setSnack({ open: true, message: t('savings.errorDeletingGoal'), severity: 'error' });
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
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Fonction pour gérer l'affichage sécurisé de l'icône
  const getSafeIcon = (icon) => {
    // Si l'icône est un élément React valide, l'utiliser
    if (React.isValidElement(icon)) {
      return icon;
    }
    // Sinon, retourner l'icône par défaut
    return <AttachMoney sx={{ fontSize: 24 }} />;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      padding: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules animées */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '@keyframes float': {
                '0%': {
                  transform: 'translateY(0px) rotate(0deg)',
                  opacity: 0
                },
                '10%': {
                  opacity: 1
                },
                '90%': {
                  opacity: 1
                },
                '100%': {
                  transform: 'translateY(-100vh) rotate(360deg)',
                  opacity: 0
                }
              }
            }}
          />
        ))}
      </Box>

      {/* AppBar glassmorphism */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'none',
          mb: 2
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {t('savings.title')}
          </Typography>
        </Box>
      </AppBar>

      <Box sx={{ p: 0, pb: 10, position: 'relative', zIndex: 1 }}>
        {/* KPIs glassmorphism */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(25, 118, 210, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(25, 118, 210, 0.3)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)'
            }}>
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
            <Card sx={{ 
              background: 'rgba(76, 175, 80, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)'
            }}>
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
                  sx={{ 
                    mt: 1, 
                    bgcolor: 'rgba(255,255,255,0.3)', 
                    '& .MuiLinearProgress-bar': { 
                      bgcolor: 'white',
                      borderRadius: 1
                    },
                    borderRadius: 1,
                    height: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(3, 169, 244, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(3, 169, 244, 0.3)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(3, 169, 244, 0.3)'
            }}>
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
            <Card sx={{ 
              background: 'rgba(255, 152, 0, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)'
            }}>
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

        {/* Objectifs d'épargne glassmorphism */}
        <Paper sx={{ 
          p: 2, 
          mb: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              {t('savings.savingsGoals')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddDialog(true)}
              disabled={!canAddMoreGoals}
              sx={{
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                }
              }}
            >
              {t('savings.addGoal')}
              {!canAddMoreGoals && (
                <Chip 
                  label={t('savings.limitReached')} 
                  size="small" 
                  color="warning" 
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {goals.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {t('savings.noSavingsGoals')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }} component="span">
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
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h3" sx={{ mr: 1, color: 'white' }}>
                              {getSafeIcon(goal.icon)}
                            </Typography>
                            <Box>
                              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {goal.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} component="span">
                                {daysLeft} {t('savings.daysLeft')}
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            {progress >= 100 && <CheckCircle sx={{ color: '#4caf50' }} />}
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setSelectedGoal(goal);
                                setNewGoal({ 
                                  name: goal.name, 
                                  target: goal.target, 
                                  current: goal.current || 0, 
                                  icon: getSafeIcon(goal.icon), 
                                  deadline: goal.deadline 
                                });
                                setEditDialog(true);
                              }}
                              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
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
                              sx={{ color: '#f44336' }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} component="span">
                              {(goal.current || 0).toLocaleString()}€ / {goal.target.toLocaleString()}€
                            </Typography>
                            <Chip 
                              label={`${progress}%`} 
                              size="small" 
                              color={getProgressColor(progress)}
                              sx={{ 
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white'
                              }}
                            />
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(parseFloat(progress), 100)} 
                            color={getProgressColor(progress)}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleUpdateProgress(goal.id, 100)}
                            disabled={(goal.current || 0) >= goal.target}
                            sx={{
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'white',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                background: 'rgba(255, 255, 255, 0.1)'
                              }
                            }}
                          >
                            +100€
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleUpdateProgress(goal.id, 500)}
                            disabled={(goal.current || 0) >= goal.target}
                            sx={{
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'white',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                background: 'rgba(255, 255, 255, 0.1)'
                              }
                            }}
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

        {/* Graphiques glassmorphism */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                {t('savings.monthlySavingsEvolution')}
              </Typography>
              {sideByMonth.length === 0 ? (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
            <Paper sx={{ 
              p: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                {t('savings.savingsDistribution')}
              </Typography>
              {goals.length === 0 ? (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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

        {/* Dialogs glassmorphism */}
        <Dialog 
          open={addDialog} 
          onClose={() => setAddDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#333', fontWeight: 'bold' }}>
            {t('savings.addGoalTitle')}
          </DialogTitle>
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
            <Button 
              onClick={() => setAddDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('savings.cancel')}
            </Button>
            <Button 
              onClick={handleAddGoal} 
              variant="contained"
              disabled={!newGoal.name || !newGoal.target}
              sx={{
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                }
              }}
            >
              {t('savings.add')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={editDialog} 
          onClose={() => setEditDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#333', fontWeight: 'bold' }}>
            {t('savings.modifyGoalTitle')}
          </DialogTitle>
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
            <Button 
              onClick={() => setEditDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('savings.cancel')}
            </Button>
            <Button 
              onClick={handleEditGoal} 
              variant="contained"
              disabled={!newGoal.name || !newGoal.target}
              sx={{
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                }
              }}
            >
              {t('savings.modify')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={deleteDialog} 
          onClose={() => setDeleteDialog(false)}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#333', fontWeight: 'bold' }}>
            {t('savings.deleteGoalTitle')}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#333' }}>
              {t('savings.areYouSureDelete', { goalName: selectedGoal?.name })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('savings.cancel')}
            </Button>
            <Button 
              onClick={handleDeleteGoal} 
              color="error" 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
                }
              }}
            >
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
    </Box>
  );
};

export default Savings; 