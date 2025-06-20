import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  AlertTitle,
  Divider,
  Fab
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  CheckCircle,
  Schedule,
  TrendingUp,
  TrendingDown,
  Savings,
  AccountBalance,
  ArrowBack,
  Assignment,
  Flag,
  Star
} from '@mui/icons-material';

const ActionPlans = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    targetAmount: '',
    deadline: '',
    priority: 'medium',
    status: 'pending'
  });

  // Charger les plans depuis localStorage
  useEffect(() => {
    const savedPlans = localStorage.getItem('actionPlans');
    if (savedPlans) {
      try {
        setPlans(JSON.parse(savedPlans));
      } catch (error) {
        console.error('Erreur lors du chargement des plans:', error);
      }
    }
  }, []);

  // Sauvegarder les plans dans localStorage
  const savePlans = (newPlans) => {
    setPlans(newPlans);
    localStorage.setItem('actionPlans', JSON.stringify(newPlans));
  };

  const handleOpenDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        title: plan.title,
        description: plan.description,
        category: plan.category,
        targetAmount: plan.targetAmount,
        deadline: plan.deadline,
        priority: plan.priority,
        status: plan.status
      });
    } else {
      setEditingPlan(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        targetAmount: '',
        deadline: '',
        priority: 'medium',
        status: 'pending'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlan(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert(t('actionPlans.titleRequired'));
      return;
    }

    const newPlan = {
      id: editingPlan ? editingPlan.id : Date.now(),
      ...formData,
      createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: editingPlan ? editingPlan.progress : 0
    };

    let newPlans;
    if (editingPlan) {
      newPlans = plans.map(p => p.id === editingPlan.id ? newPlan : p);
    } else {
      newPlans = [...plans, newPlan];
    }

    savePlans(newPlans);
    handleCloseDialog();
  };

  const handleDelete = (planId) => {
    if (window.confirm(t('actionPlans.confirmDelete'))) {
      const newPlans = plans.filter(p => p.id !== planId);
      savePlans(newPlans);
    }
  };

  const handleStatusChange = (planId, newStatus) => {
    const newPlans = plans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          progress: newStatus === 'completed' ? 100 : p.progress
        };
      }
      return p;
    });
    savePlans(newPlans);
  };

  const handleProgressChange = (planId, newProgress) => {
    const newPlans = plans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          progress: Math.min(100, Math.max(0, newProgress)),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    savePlans(newPlans);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return t('actionPlans.completed');
      case 'in_progress': return t('actionPlans.inProgress');
      case 'pending': return t('actionPlans.pending');
      default: return t('actionPlans.unknown');
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return t('actionPlans.high');
      case 'medium': return t('actionPlans.medium');
      case 'low': return t('actionPlans.low');
      default: return t('actionPlans.unknown');
    }
  };

  const categories = [
    'Épargne',
    'Réduction des dépenses',
    'Augmentation des revenus',
    'Investissement',
    'Dette',
    'Budget',
    'Autre'
  ];

  const pendingPlans = plans.filter(p => p.status === 'pending');
  const inProgressPlans = plans.filter(p => p.status === 'in_progress');
  const completedPlans = plans.filter(p => p.status === 'completed');

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/home')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          {t('actionPlans.title')}
        </Typography>
        <Chip 
          label={`${plans.length} ${t('actionPlans.plans')}`}
          color="primary"
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {pendingPlans.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">
                {inProgressPlans.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En cours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {completedPlans.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Terminés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Plans en attente */}
      {pendingPlans.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ mr: 1 }} />
            Plans en attente ({pendingPlans.length})
          </Typography>
          <List>
            {pendingPlans.map((plan) => (
              <ListItem key={plan.id} divider>
                <ListItemIcon>
                  <Assignment color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {plan.title}
                      <Chip 
                        label={getPriorityText(plan.priority)}
                        size="small"
                        color={getPriorityColor(plan.priority)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">{plan.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Catégorie: {plan.category} | Objectif: {plan.targetAmount}€ | 
                        Échéance: {new Date(plan.deadline).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    onClick={() => handleStatusChange(plan.id, 'in_progress')}
                    color="info"
                    title="Commencer"
                  >
                    <TrendingUp />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleOpenDialog(plan)}
                    color="primary"
                    title="Modifier"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(plan.id)}
                    color="error"
                    title="Supprimer"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Plans en cours */}
      {inProgressPlans.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ mr: 1 }} />
            Plans en cours ({inProgressPlans.length})
          </Typography>
          <List>
            {inProgressPlans.map((plan) => (
              <ListItem key={plan.id} divider>
                <ListItemIcon>
                  <TrendingUp color="info" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {plan.title}
                      <Chip 
                        label={`${plan.progress}%`}
                        size="small"
                        color="info"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">{plan.description}</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={plan.progress} 
                        sx={{ mt: 1, mb: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Objectif: {plan.targetAmount}€ | Échéance: {new Date(plan.deadline).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    onClick={() => handleProgressChange(plan.id, plan.progress + 10)}
                    color="success"
                    title="Avancer"
                  >
                    <TrendingUp />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleStatusChange(plan.id, 'completed')}
                    color="success"
                    title="Terminer"
                  >
                    <CheckCircle />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleOpenDialog(plan)}
                    color="primary"
                    title="Modifier"
                  >
                    <Edit />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Plans terminés */}
      {completedPlans.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 1 }} />
            Plans terminés ({completedPlans.length})
          </Typography>
          <List>
            {completedPlans.map((plan) => (
              <ListItem key={plan.id} divider>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary={plan.title}
                  secondary={
                    <Box>
                      <Typography variant="body2">{plan.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Terminé le: {new Date(plan.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    onClick={() => handleStatusChange(plan.id, 'in_progress')}
                    color="info"
                    title="Remettre en cours"
                  >
                    <TrendingUp />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(plan.id)}
                    color="error"
                    title="Supprimer"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Message si aucun plan */}
      {plans.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Aucun plan d'action</AlertTitle>
          Créez votre premier plan d'action pour améliorer votre situation financière.
        </Alert>
      )}

      {/* Dialog pour créer/modifier un plan */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPlan ? 'Modifier le plan' : 'Créer un nouveau plan'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Titre du plan"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Catégorie"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Objectif (montant en €)"
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Échéance"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priorité</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                label="Priorité"
              >
                <MenuItem value="high">Haute</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="low">Faible</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPlan ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bouton flottant pour ajouter */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenDialog()}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default ActionPlans; 