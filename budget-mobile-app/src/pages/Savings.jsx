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
  Divider,
  Snackbar,
  Alert,
  AppBar,
  Fab,
  Container,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Info,
  MoreVert,
  CalendarToday,
  AccountBalance,
  Timeline
} from '@mui/icons-material';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Legend,
  ArcElement,
  Tooltip
} from 'chart.js';
import CurrencyFormatter from '../components/CurrencyFormatter';

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, ArcElement, Tooltip);

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
    checkUsageLimit,
    totalPotentialSavings,
    persons,
    saved
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
    deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Filtrer les objectifs par compte actif
  const goals = savings.filter(goal => !activeAccount || goal.accountId === activeAccount.id);

  // Vérifier les limites d'objectifs d'épargne
  const savingsGoalsLimit = checkUsageLimit('maxSavingsGoals', goals.length);
  const canAddMoreGoals = savingsGoalsLimit.allowed;

  // Calculer les données d'épargne mensuelle
  const getMonthlySavingsData = () => {
    const last6Months = months.slice(-6);
    const last6MonthsSavings = sideByMonth.slice(-6);
    
    return {
      labels: last6Months,
      datasets: [{
        label: 'Épargne mensuelle',
        data: last6MonthsSavings,
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  };

  // Calculer l'évolution de l'épargne
  const getSavingsEvolution = () => {
    const totalSaved = goals.reduce((sum, goal) => sum + (goal.current || 0), 0);
    const totalTarget = goals.reduce((sum, goal) => sum + (goal.target || 0), 0);
    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      totalSaved,
      totalTarget,
      progress,
      remaining: totalTarget - totalSaved
    };
  };

  // Calculer les statistiques globales
  const getGlobalStats = () => {
    const totalSaved = goals.reduce((sum, goal) => sum + (goal.current || 0), 0);
    const totalTarget = goals.reduce((sum, goal) => sum + (goal.target || 0), 0);
    const completedGoals = goals.filter(goal => (goal.current || 0) >= (goal.target || 0)).length;
    const activeGoals = goals.filter(goal => (goal.current || 0) < (goal.target || 0)).length;
    
    // Calculer l'épargne moyenne mensuelle
    const monthlySavings = sideByMonth.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    
    return {
      totalSaved,
      totalTarget,
      completedGoals,
      activeGoals,
      monthlySavings,
      completionRate: goals.length > 0 ? (completedGoals / goals.length) * 100 : 0
    };
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) {
      setSnack({ open: true, message: 'Veuillez remplir tous les champs obligatoires', severity: 'error' });
      return;
    }

    const goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current) || 0,
      deadline: newGoal.deadline,
      accountId: activeAccount?.id || null,
      createdAt: new Date().toISOString()
    };

    addSavingsGoal(goal);
    setNewGoal({ name: '', target: '', current: '', deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
    setAddDialog(false);
    setSnack({ open: true, message: 'Objectif d\'épargne ajouté avec succès', severity: 'success' });
  };

  const handleEditGoal = () => {
    if (!selectedGoal || !newGoal.name || !newGoal.target) {
      setSnack({ open: true, message: 'Veuillez remplir tous les champs obligatoires', severity: 'error' });
      return;
    }

    const updatedGoal = {
      ...selectedGoal,
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current) || 0,
      deadline: newGoal.deadline
    };

    updateSavingsGoal(updatedGoal);
    setEditDialog(false);
    setSelectedGoal(null);
    setSnack({ open: true, message: 'Objectif d\'épargne modifié avec succès', severity: 'success' });
  };

  const handleDeleteGoal = () => {
    if (selectedGoal) {
      deleteSavingsGoal(selectedGoal.id);
      setDeleteDialog(false);
      setSelectedGoal(null);
      setSnack({ open: true, message: 'Objectif d\'épargne supprimé avec succès', severity: 'success' });
    }
  };

  const handleUpdateProgress = (goalId, amount) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const updatedGoal = {
        ...goal,
        current: Math.max(0, (goal.current || 0) + amount)
      };
      updateSavingsGoal(updatedGoal);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#4caf50';
    if (progress >= 75) return '#ff9800';
    if (progress >= 50) return '#ffc107';
    return '#f44336';
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const stats = getGlobalStats();
  const evolution = getSavingsEvolution();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      pb: 8
    }}>
      {/* Header */}
      <AppBar position="static" sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Épargne & Objectifs
          </Typography>
        </Box>
      </AppBar>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Statistiques globales */}
        <Fade in timeout={600}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" sx={{ 
                    color: '#4caf50', 
                    fontWeight: 'bold',
                    mb: 1
                  }}>
                    <CurrencyFormatter value={stats.totalSaved} />
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Total épargné
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" sx={{ 
                    color: '#ff9800', 
                    fontWeight: 'bold',
                    mb: 1
                  }}>
                    <CurrencyFormatter value={stats.monthlySavings} />
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Épargne mensuelle
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" sx={{ 
                    color: '#2196f3', 
                    fontWeight: 'bold',
                    mb: 1
                  }}>
                    {stats.activeGoals}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Objectifs actifs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" sx={{ 
                    color: '#4caf50', 
                    fontWeight: 'bold',
                    mb: 1
                  }}>
                    {Math.round(stats.completionRate)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Taux de réussite
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        {/* Progression globale */}
        <Slide direction="up" in timeout={800}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            mb: 4
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Progression globale
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  <CurrencyFormatter value={evolution.totalSaved} /> / <CurrencyFormatter value={evolution.totalTarget} />
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(evolution.progress, 100)} 
                sx={{ 
                  height: 12, 
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.2)',
                  '& .MuiLinearProgress-bar': { 
                    background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
                    borderRadius: 6
                  }
                }} 
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {Math.round(evolution.progress)}% atteint
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  <CurrencyFormatter value={evolution.remaining} /> restant
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Slide>

        {/* Graphique d'épargne mensuelle */}
        <Zoom in timeout={1000}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            mb: 4
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
                Évolution de l'épargne
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={getMonthlySavingsData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: 'rgba(255, 255, 255, 0.8)' }
                      }
                    },
                    scales: {
                      x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                      },
                      y: {
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Zoom>

        {/* Liste des objectifs */}
        <Fade in timeout={1200}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Mes objectifs d'épargne
                </Typography>
                {canAddMoreGoals && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setAddDialog(true)}
                    sx={{ 
                      background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)' }
                    }}
                  >
                    Ajouter un objectif
                  </Button>
                )}
              </Box>

              {goals.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
                    Aucun objectif d'épargne défini
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setAddDialog(true)}
                    sx={{ 
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': { borderColor: 'rgba(255, 255, 255, 0.5)' }
                    }}
                  >
                    Créer votre premier objectif
                  </Button>
                </Box>
              ) : (
                <List>
                  {goals.map((goal, index) => {
                    const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                    const daysLeft = getDaysUntilDeadline(goal.deadline);
                    const isCompleted = progress >= 100;
                    const isOverdue = daysLeft < 0;

                    return (
                      <React.Fragment key={goal.id}>
                        <ListItem sx={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 2,
                          mb: 1,
                          border: isCompleted ? '1px solid #4caf50' : '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6" sx={{ 
                                color: 'white', 
                                fontWeight: 'bold',
                                textDecoration: isCompleted ? 'line-through' : 'none'
                              }}>
                                {goal.name}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {isCompleted && <CheckCircle sx={{ color: '#4caf50' }} />}
                                {isOverdue && <Warning sx={{ color: '#f44336' }} />}
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedGoal(goal);
                                    setNewGoal({
                                      name: goal.name,
                                      target: goal.target.toString(),
                                      current: goal.current.toString(),
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
                                  onClick={() => {
                                    setSelectedGoal(goal);
                                    setDeleteDialog(true);
                                  }}
                                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                <CurrencyFormatter value={goal.current} /> / <CurrencyFormatter value={goal.target} />
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {Math.round(progress)}%
                              </Typography>
                            </Box>

                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(progress, 100)} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                background: 'rgba(255, 255, 255, 0.2)',
                                '& .MuiLinearProgress-bar': { 
                                  background: `linear-gradient(90deg, ${getProgressColor(progress)} 0%, ${getProgressColor(progress)}80 100%)`,
                                  borderRadius: 4
                                }
                              }} 
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Échéance: {new Date(goal.deadline).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: isOverdue ? '#f44336' : isCompleted ? '#4caf50' : 'rgba(255, 255, 255, 0.6)'
                              }}>
                                {isOverdue ? `${Math.abs(daysLeft)} jours en retard` : 
                                 isCompleted ? 'Objectif atteint' : 
                                 `${daysLeft} jours restants`}
                              </Typography>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < goals.length - 1 && <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>

      {/* Dialog d'ajout */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          color: 'white'
        }}>
          Ajouter un objectif d'épargne
        </DialogTitle>
        <DialogContent sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          color: 'white'
        }}>
          <TextField
            fullWidth
            label="Nom de l'objectif"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{ sx: { color: 'white' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
          <TextField
            fullWidth
            label="Montant cible"
            type="number"
            value={newGoal.target}
            onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: 'white' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
          <TextField
            fullWidth
            label="Montant actuel (optionnel)"
            type="number"
            value={newGoal.current}
            onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: 'white' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
          <TextField
            fullWidth
            label="Date d'échéance"
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            InputProps={{ sx: { color: 'white' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          color: 'white'
        }}>
          <Button onClick={() => setAddDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Annuler
          </Button>
          <Button onClick={handleAddGoal} variant="contained" sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)' }
          }}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          color: 'white'
        }}>
          Modifier l'objectif
        </DialogTitle>
        <DialogContent sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          color: 'white'
        }}>
          <TextField
            fullWidth
            label="Nom de l'objectif"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{ sx: { color: 'white' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
          <TextField
            fullWidth
            label="Montant cible"
            type="number"
            value={newGoal.target}
            onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: 'white' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
          <TextField
            fullWidth
            label="Montant actuel"
            type="number"
            value={newGoal.current}
            onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: 'white' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
          <TextField
            fullWidth
            label="Date d'échéance"
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            InputProps={{ sx: { color: 'white' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          color: 'white'
        }}>
          <Button onClick={() => setEditDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Annuler
          </Button>
          <Button onClick={handleEditGoal} variant="contained" sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)' }
          }}>
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          color: 'white'
        }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          color: 'white'
        }}>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'objectif "{selectedGoal?.name}" ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          color: 'white'
        }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Annuler
          </Button>
          <Button onClick={handleDeleteGoal} variant="contained" sx={{ 
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)' }
          }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert 
          onClose={() => setSnack({ ...snack, open: false })} 
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Savings; 