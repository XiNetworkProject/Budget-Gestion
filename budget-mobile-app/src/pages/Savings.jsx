import React, { useState } from 'react';
import { useStore } from '../store';
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
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  Tooltip
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
  Info
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, ArcElement);

const Savings = () => {
  const { 
    savings, 
    addSavingsGoal, 
    updateSavingsGoal, 
    deleteSavingsGoal,
    activeAccount 
  } = useStore();

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

  // Données simulées pour les graphiques
  const monthlyData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    data: [500, 800, 1200, 1500, 2000, 2500]
  };

  const totalSaved = goals.reduce((sum, goal) => sum + (goal.current || 0), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + (goal.target || 0), 0);
  const overallProgress = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

  const barData = {
    labels: monthlyData.labels,
    datasets: [{
      label: 'Économies mensuelles',
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
    }
  };

  const handleAddGoal = () => {
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
    setSnack({ open: true, message: 'Objectif d\'épargne ajouté', severity: 'success' });
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
      setSnack({ open: true, message: 'Objectif modifié', severity: 'success' });
    }
  };

  const handleDeleteGoal = () => {
    if (selectedGoal) {
      deleteSavingsGoal(selectedGoal.id);
      setDeleteDialog(false);
      setSelectedGoal(null);
      setSnack({ open: true, message: 'Objectif supprimé', severity: 'info' });
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
        Économies
      </Typography>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SavingsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total épargné</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalSaved.toLocaleString()}€
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                Sur {totalTarget.toLocaleString()}€
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">Progression</Typography>
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
                <Typography variant="h6">Objectifs</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {goals.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                {goals.filter(g => (g.current / g.target) >= 1).length} atteints
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Info sx={{ mr: 1 }} />
                <Typography variant="h6">Moyenne mensuelle</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {Math.round(monthlyData.data[monthlyData.data.length - 1] / 6)}€
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                Ce mois
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Objectifs d'épargne */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Mes objectifs d'épargne</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddDialog(true)}
          >
            Ajouter un objectif
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          {goals.map((goal) => {
            const progress = ((goal.current / goal.target) * 100).toFixed(1);
            const daysLeft = getDaysUntilDeadline(goal.deadline);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={goal.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h3" sx={{ mr: 1 }}>{goal.icon}</Typography>
                        <Box>
                          <Typography variant="h6">{goal.name}</Typography>
                          <Typography variant="body2" color="text.secondary" component="span">
                            {daysLeft} jours restants
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        {progress >= 100 && <CheckCircle color="success" />}
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedGoal(goal);
                            setNewGoal({ name: goal.name, target: goal.target, current: goal.current, icon: goal.icon, deadline: goal.deadline });
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
                          {goal.current.toLocaleString()}€ / {goal.target.toLocaleString()}€
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
                        disabled={goal.current >= goal.target}
                      >
                        +100€
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleUpdateProgress(goal.id, 500)}
                        disabled={goal.current >= goal.target}
                      >
                        +500€
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Graphiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Évolution mensuelle
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={barData} options={barOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Répartition par objectif
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut data={doughnutData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* FAB */}
      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => setAddDialog(true)}
      >
        <Add />
      </Fab>

      {/* Dialogs */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un objectif d'épargne</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de l'objectif"
            fullWidth
            variant="outlined"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Montant cible (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newGoal.target}
            onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Montant actuel (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newGoal.current}
            onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Date limite"
            type="date"
            fullWidth
            variant="outlined"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleAddGoal} 
            variant="contained"
            disabled={!newGoal.name || !newGoal.target}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier l'objectif</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de l'objectif"
            fullWidth
            variant="outlined"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Montant cible (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newGoal.target}
            onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Montant actuel (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newGoal.current}
            onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Date limite"
            type="date"
            fullWidth
            variant="outlined"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleEditGoal} 
            variant="contained"
            disabled={!newGoal.name || !newGoal.target}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Supprimer l'objectif</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'objectif "{selectedGoal?.name}" ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeleteGoal} color="error" variant="contained">
            Supprimer
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