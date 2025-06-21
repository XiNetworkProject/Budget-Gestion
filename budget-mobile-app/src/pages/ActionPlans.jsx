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

      <Box sx={{ p: 2, pb: 10, position: 'relative', zIndex: 1 }}>
        {/* Header glassmorphism */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          p: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <IconButton 
            onClick={() => navigate('/home')} 
            sx={{ 
              mr: 2,
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {t('actionPlans.title')}
          </Typography>
          <Chip 
            label={`${plans.length} ${t('actionPlans.plans')}`}
            sx={{ 
              ml: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          />
        </Box>

        {/* Statistiques glassmorphism */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ 
                  color: '#ff9800',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {pendingPlans.length}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {t('actionPlans.pending')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ 
                  color: '#03a9f4',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {inProgressPlans.length}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {t('actionPlans.inProgress')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ 
                  color: '#4caf50',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {completedPlans.length}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {t('actionPlans.completed')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Plans en attente glassmorphism */}
        {pendingPlans.length > 0 && (
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              <Schedule sx={{ mr: 1, color: '#ff9800' }} />
              {t('actionPlans.pendingPlans')} ({pendingPlans.length})
            </Typography>
            <List>
              {pendingPlans.map((plan) => (
                <ListItem key={plan.id} divider sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1,
                  mb: 1
                }}>
                  <ListItemIcon>
                    <Assignment sx={{ color: '#ff9800' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ 
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {plan.title}
                        </Typography>
                        <Chip 
                          label={getPriorityText(plan.priority)}
                          size="small"
                          sx={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {plan.description}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {t('actionPlans.category')}: {plan.category} | {t('actionPlans.targetAmount')}€ | 
                          {t('actionPlans.deadline')}: {new Date(plan.deadline).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      onClick={() => handleStatusChange(plan.id, 'in_progress')}
                      sx={{ 
                        color: '#03a9f4',
                        '&:hover': {
                          background: 'rgba(3, 169, 244, 0.1)'
                        }
                      }}
                      title={t('actionPlans.start')}
                    >
                      <TrendingUp />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenDialog(plan)}
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                      title={t('actionPlans.edit')}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(plan.id)}
                      sx={{ 
                        color: '#f44336',
                        '&:hover': {
                          background: 'rgba(244, 67, 54, 0.1)'
                        }
                      }}
                      title={t('actionPlans.delete')}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Plans en cours glassmorphism */}
        {inProgressPlans.length > 0 && (
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              <TrendingUp sx={{ mr: 1, color: '#03a9f4' }} />
              {t('actionPlans.inProgressPlans')} ({inProgressPlans.length})
            </Typography>
            <List>
              {inProgressPlans.map((plan) => (
                <ListItem key={plan.id} divider sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1,
                  mb: 1
                }}>
                  <ListItemIcon>
                    <TrendingUp sx={{ color: '#03a9f4' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ 
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {plan.title}
                        </Typography>
                        <Chip 
                          label={`${plan.progress}%`}
                          size="small"
                          sx={{
                            background: 'rgba(3, 169, 244, 0.2)',
                            backdropFilter: 'blur(10px)',
                            color: '#03a9f4',
                            border: '1px solid rgba(3, 169, 244, 0.3)'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {plan.description}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={plan.progress} 
                          sx={{ 
                            mt: 1, 
                            mb: 1,
                            background: 'rgba(255, 255, 255, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #03a9f4 0%, #00bcd4 100%)'
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {t('actionPlans.targetAmount')}€ | {t('actionPlans.deadline')}: {new Date(plan.deadline).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      onClick={() => handleProgressChange(plan.id, plan.progress + 10)}
                      sx={{ 
                        color: '#4caf50',
                        '&:hover': {
                          background: 'rgba(76, 175, 80, 0.1)'
                        }
                      }}
                      title={t('actionPlans.advance')}
                    >
                      <TrendingUp />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleStatusChange(plan.id, 'completed')}
                      sx={{ 
                        color: '#4caf50',
                        '&:hover': {
                          background: 'rgba(76, 175, 80, 0.1)'
                        }
                      }}
                      title={t('actionPlans.complete')}
                    >
                      <CheckCircle />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenDialog(plan)}
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                      title={t('actionPlans.edit')}
                    >
                      <Edit />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Plans terminés glassmorphism */}
        {completedPlans.length > 0 && (
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              <CheckCircle sx={{ mr: 1, color: '#4caf50' }} />
              {t('actionPlans.completedPlans')} ({completedPlans.length})
            </Typography>
            <List>
              {completedPlans.map((plan) => (
                <ListItem key={plan.id} divider sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1,
                  mb: 1
                }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ 
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}>
                        {plan.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {plan.description}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {t('actionPlans.completedDate')}: {new Date(plan.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      onClick={() => handleStatusChange(plan.id, 'in_progress')}
                      sx={{ 
                        color: '#03a9f4',
                        '&:hover': {
                          background: 'rgba(3, 169, 244, 0.1)'
                        }
                      }}
                      title={t('actionPlans.revert')}
                    >
                      <TrendingUp />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(plan.id)}
                      sx={{ 
                        color: '#f44336',
                        '&:hover': {
                          background: 'rgba(244, 67, 54, 0.1)'
                        }
                      }}
                      title={t('actionPlans.delete')}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Message si aucun plan glassmorphism */}
        {plans.length === 0 && (
          <Alert severity="info" sx={{ 
            mb: 3,
            background: 'rgba(3, 169, 244, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(3, 169, 244, 0.3)',
            color: '#03a9f4'
          }}>
            <AlertTitle sx={{ color: '#03a9f4' }}>{t('actionPlans.noPlan')}</AlertTitle>
            <Typography sx={{ color: '#03a9f4' }}>
              {t('actionPlans.createFirst')}
            </Typography>
          </Alert>
        )}

        {/* Dialog pour créer/modifier un plan glassmorphism */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
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
            {editingPlan ? t('actionPlans.editPlan') : t('actionPlans.createNewPlan')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label={t('actionPlans.title')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label={t('actionPlans.description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('actionPlans.category')}</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label={t('actionPlans.category')}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={t('actionPlans.targetAmount')}
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('actionPlans.deadline')}
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('actionPlans.priority')}</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  label={t('actionPlans.priority')}
                >
                  <MenuItem value="high">{t('actionPlans.high')}</MenuItem>
                  <MenuItem value="medium">{t('actionPlans.medium')}</MenuItem>
                  <MenuItem value="low">{t('actionPlans.low')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDialog}
              sx={{ color: '#666' }}
            >
              {t('actionPlans.cancel')}
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)'
                }
              }}
            >
              {editingPlan ? t('actionPlans.edit') : t('actionPlans.create')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bouton flottant pour ajouter glassmorphism */}
        <Fab
          aria-label={t('actionPlans.add')}
          onClick={() => handleOpenDialog()}
          sx={{ 
            position: 'fixed', 
            bottom: 80, 
            right: 16,
            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
            boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)',
              boxShadow: '0 12px 40px rgba(76, 175, 80, 0.4)'
            }
          }}
        >
          <Add />
        </Fab>
      </Box>
    </Box>
  );
};

export default ActionPlans; 