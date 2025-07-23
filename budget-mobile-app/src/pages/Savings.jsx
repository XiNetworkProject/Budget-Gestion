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
  Fab,
  Container,
  Fade,
  Zoom
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
  Close,
  CalendarToday,
  AccountBalance
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Legend,
  Title,
  Tooltip
} from 'chart.js';
import CurrencyFormatter from '../components/CurrencyFormatter';

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Title, Tooltip);

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
      datasets: [
        {
          label: 'Épargne mensuelle',
          data: last6MonthsSavings,
          backgroundColor: 'rgba(76, 175, 80, 0.8)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  };

  // Calculer l'évolution de l'épargne
  const getSavingsEvolution = () => {
    if (sideByMonth.length < 2) return { trend: 'stable', percentage: 0 };
    
    const current = sideByMonth[sideByMonth.length - 1];
    const previous = sideByMonth[sideByMonth.length - 2];
    
    if (previous === 0) return { trend: 'stable', percentage: 0 };
    
    const percentage = ((current - previous) / previous) * 100;
    return {
      trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable',
      percentage: Math.abs(percentage)
    };
  };

  const savingsEvolution = getSavingsEvolution();
  const totalSaved = sideByMonth[sideByMonth.length - 1] || 0;
  const totalGoals = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalProgress = goals.reduce((sum, goal) => sum + goal.current, 0);
  const overallProgress = totalGoals > 0 ? (totalProgress / totalGoals) * 100 : 0;

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) {
      setSnack({ open: true, message: 'Veuillez remplir tous les champs', severity: 'error' });
      return;
    }

    addSavingsGoal({
      ...newGoal,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current) || 0,
      accountId: activeAccount?.id
    });

    setNewGoal({ 
      name: '', 
      target: '', 
      current: '', 
      deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setAddDialog(false);
    setSnack({ open: true, message: 'Objectif d\'épargne ajouté', severity: 'success' });
  };

  const handleEditGoal = () => {
    if (!selectedGoal || !newGoal.name || !newGoal.target) {
      setSnack({ open: true, message: 'Veuillez remplir tous les champs', severity: 'error' });
      return;
    }

    updateSavingsGoal(selectedGoal.id, {
      ...newGoal,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current)
    });

    setEditDialog(false);
    setSelectedGoal(null);
    setSnack({ open: true, message: 'Objectif d\'épargne modifié', severity: 'success' });
  };

  const handleDeleteGoal = () => {
    if (selectedGoal) {
      deleteSavingsGoal(selectedGoal.id);
      setDeleteDialog(false);
      setSelectedGoal(null);
      setSnack({ open: true, message: 'Objectif d\'épargne supprimé', severity: 'success' });
    }
  };

  const handleUpdateProgress = (goalId, amount) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newCurrent = Math.min(goal.current + amount, goal.target);
      updateSavingsGoal(goalId, { current: newCurrent });
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

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      pb: 8
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Typography variant="h4" sx={{ 
          color: 'white', 
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Épargne et Objectifs
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'rgba(255, 255, 255, 0.8)',
          mt: 1
        }}>
          Suivez vos objectifs d'épargne et votre progression
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* KPIs */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  Épargne Totale
                </Typography>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  <CurrencyFormatter value={totalSaved} />
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
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  Objectifs
                </Typography>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {goals.length}
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
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  Progression
                </Typography>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {overallProgress.toFixed(0)}%
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  {savingsEvolution.trend === 'up' ? (
                    <TrendingUp sx={{ color: '#4caf50', fontSize: 24 }} />
                  ) : savingsEvolution.trend === 'down' ? (
                    <TrendingDown sx={{ color: '#f44336', fontSize: 24 }} />
                  ) : (
                    <Info sx={{ color: '#ff9800', fontSize: 24 }} />
                  )}
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {savingsEvolution.trend === 'up' ? '+' : savingsEvolution.trend === 'down' ? '-' : ''}
                    {savingsEvolution.percentage.toFixed(1)}%
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1 }}>
                  vs mois précédent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Graphique d'épargne */}
        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          mb: 4
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              mb: 3,
              fontWeight: 'bold'
            }}>
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
                      labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    y: {
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Objectifs d'épargne */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ 
              color: 'white', 
              fontWeight: 'bold'
            }}>
              Objectifs d'épargne
            </Typography>
            {canAddMoreGoals && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddDialog(true)}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)'
                  }
                }}
              >
                Ajouter un objectif
              </Button>
            )}
          </Box>

          {goals.length === 0 ? (
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              py: 6
            }}>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                Aucun objectif d'épargne
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3 }}>
                Créez votre premier objectif d'épargne pour commencer à épargner
              </Typography>
              {canAddMoreGoals && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAddDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)'
                    }
                  }}
                >
                  Créer un objectif
                </Button>
              )}
            </Card>
          ) : (
            <Grid container spacing={3}>
              {goals.map((goal) => {
                const progress = (goal.current / goal.target) * 100;
                const daysUntilDeadline = getDaysUntilDeadline(goal.deadline);
                const isCompleted = progress >= 100;
                const isOverdue = daysUntilDeadline < 0;

                return (
                  <Grid item xs={12} md={6} key={goal.id}>
                    <Card sx={{ 
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              mb: 1
                            }}>
                              {goal.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                <CurrencyFormatter value={goal.current} /> / <CurrencyFormatter value={goal.target} />
                              </Typography>
                              {isCompleted && (
                                <Chip 
                                  label="Terminé" 
                                  size="small" 
                                  sx={{ 
                                    background: '#4caf50',
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                          <Box>
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

                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progress, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              background: getProgressColor(progress),
                              borderRadius: 4
                            }
                          }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {progress.toFixed(1)}% complété
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }} />
                            <Typography variant="body2" sx={{ 
                              color: isOverdue ? '#f44336' : 'rgba(255, 255, 255, 0.6)',
                              fontWeight: isOverdue ? 'bold' : 'normal'
                            }}>
                              {isOverdue 
                                ? `${Math.abs(daysUntilDeadline)} jours de retard`
                                : `${daysUntilDeadline} jours restants`
                              }
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Container>

      {/* Bouton flottant */}
      {canAddMoreGoals && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setAddDialog(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)'
            }
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Dialog d'ajout */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          color: 'white'
        }}>
          Ajouter un objectif d'épargne
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Nom de l'objectif"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Montant cible"
            type="number"
            value={newGoal.target}
            onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Montant actuel"
            type="number"
            value={newGoal.current}
            onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Date limite"
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          p: 2
        }}>
          <Button onClick={() => setAddDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Annuler
          </Button>
          <Button 
            onClick={handleAddGoal}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)'
              }
            }}
          >
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
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Nom de l'objectif"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Montant cible"
            type="number"
            value={newGoal.target}
            onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Montant actuel"
            type="number"
            value={newGoal.current}
            onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Date limite"
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          p: 2
        }}>
          <Button onClick={() => setEditDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Annuler
          </Button>
          <Button 
            onClick={handleEditGoal}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)'
              }
            }}
          >
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
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'objectif "{selectedGoal?.name}" ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
          p: 2
        }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteGoal}
            variant="contained"
            color="error"
          >
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