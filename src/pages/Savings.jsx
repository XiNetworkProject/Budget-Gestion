import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  Fab,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  InputAdornment,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  CircularProgress
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
  MoreVert,
  FileDownload,
  Calculate,
  Lightbulb,
  Lock,
  WorkspacePremium,
  Search,
  RestartAlt,
  ContentCopy,
  AddCircleOutline,
  RemoveCircleOutline
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const navigate = useNavigate();

  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ 
    name: '', 
    target: '', 
    current: '', 
    icon: <AttachMoney sx={{ fontSize: 24 }} />,
    deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Général',
    priority: 'moyenne',
    monthlyContribution: '',
    color: '#1976d2'
  });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('deadline-asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [quickUpdateDialog, setQuickUpdateDialog] = useState({ open: false, goalId: null, amount: '' });
  const [amountDraftByGoal, setAmountDraftByGoal] = useState({});
  const [quickMenu, setQuickMenu] = useState({ anchorEl: null, goalId: null });

  // Filtrer les objectifs par compte actif
  const goals = savings.filter(goal => !activeAccount || goal.accountId === activeAccount.id);
  const filteredGoals = useMemo(() => {
    let res = goals;
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(g => (g.name || '').toLowerCase().includes(q) || (g.category || '').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      res = res.filter(g => {
        const progress = g.target > 0 ? ((g.current || 0) / g.target) : 0;
        const completed = progress >= 1;
        return statusFilter === 'completed' ? completed : !completed;
      });
    }
    if (sortBy === 'progress-desc') {
      res = [...res].sort((a, b) => {
        const pa = a.target > 0 ? ((a.current || 0) / a.target) : 0;
        const pb = b.target > 0 ? ((b.current || 0) / b.target) : 0;
        return pb - pa;
      });
    } else if (sortBy === 'deadline-asc') {
      res = [...res].sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
    }
    return res;
  }, [goals, search, statusFilter, sortBy]);

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

  // Plan & fonctionnalités avancées
  const currentPlan = getCurrentPlan?.() || {};
  const aiLevel = currentPlan?.features?.aiAnalysis || false; // false | 'partial' | 'full'
  const allowPremiumOrPro = aiLevel === 'partial' || aiLevel === 'full';
  const allowPro = aiLevel === 'full';

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
      accountId: activeAccount?.id,
      category: newGoal.category,
      priority: newGoal.priority,
      monthlyContribution: newGoal.monthlyContribution ? Number(newGoal.monthlyContribution) : undefined,
      color: newGoal.color
    };

    if (addSavingsGoal(goal)) {
      setSnack({ open: true, message: t('savings.goalAdded'), severity: 'success' });
      setAddDialog(false);
      setNewGoal({ 
        name: '', 
        target: '', 
        current: '', 
        icon: <AttachMoney sx={{ fontSize: 24 }} />,
        deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Général',
        priority: 'moyenne',
        monthlyContribution: '',
        color: '#1976d2'
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
      deadline: newGoal.deadline,
      category: newGoal.category,
      priority: newGoal.priority,
      monthlyContribution: newGoal.monthlyContribution ? Number(newGoal.monthlyContribution) : undefined,
      color: newGoal.color
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

  // Export CSV (Pro)
  const exportCSV = () => {
    try {
      const headers = ['id','nom','objectif','actuel','deadline','progression_%','jours_restant'];
      const rows = goals.map(g => {
        const progress = g.target > 0 ? (((g.current || 0) / g.target) * 100).toFixed(1) : '0';
        const days = getDaysUntilDeadline(g.deadline) ?? '';
        return [g.id || '', g.name || '', g.target || 0, g.current || 0, g.deadline || '', progress, days];
      });
      const csv = [headers, ...rows]
        .map(r => r.map(v => (typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v)).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'epargne_objectifs.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erreur export CSV:', e);
    }
  };

  // Simulateur d'intérêts composés (Pro)
  const [simOpen, setSimOpen] = useState(false);
  const [sim, setSim] = useState({ principal: 1000, monthly: 100, rate: 4, years: 3 });
  const simResult = useMemo(() => {
    const P = Number(sim.principal) || 0;
    const PMT = Number(sim.monthly) || 0;
    const r = (Number(sim.rate) || 0) / 100 / 12;
    const n = (Number(sim.years) || 0) * 12;
    if (n <= 0) return { final: P, interest: 0 };
    const futurePrincipal = P * Math.pow(1 + r, n);
    const futureMonthly = r > 0 ? PMT * (Math.pow(1 + r, n) - 1) / r : PMT * n;
    const final = futurePrincipal + futureMonthly;
    const invested = P + PMT * n;
    return { final, interest: Math.max(0, final - invested) };
  }, [sim]);

  // Projections simples d'atteinte des objectifs (selon moyenne mensuelle)
  const projections = useMemo(() => {
    if (!averageMonthlySavings || averageMonthlySavings <= 0) return [];
    return filteredGoals.map(g => {
      const remaining = Math.max(0, (g.target || 0) - (g.current || 0));
      const monthsNeeded = remaining > 0 ? Math.ceil(remaining / averageMonthlySavings) : 0;
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + monthsNeeded);
      return {
        id: g.id,
        name: g.name,
        monthsNeeded,
        eta: monthsNeeded > 0 ? targetDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Atteint'
      };
    });
  }, [filteredGoals, averageMonthlySavings]);

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
          background: 'transparent',
          boxShadow: 'none',
          mb: 2
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 36, height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00e1d6 0%, #1976d2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0, 225, 214, 0.35)'
          }}>
            <SavingsIcon sx={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ 
              fontWeight: '800',
              color: 'white',
              letterSpacing: 0.3
            }}>
              {t('savings.title')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Gérez vos objectifs d'épargne simplement
            </Typography>
          </Box>
        </Box>
      </AppBar>

      <Box sx={{ p: 0, pb: 10, position: 'relative', zIndex: 1 }}>
        {/* Onglets Vue */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} textColor="inherit" variant={isMobile ? 'scrollable' : 'standard'} TabIndicatorProps={{ style: { background: 'white' }}}>
          <Tab label={isMobile ? 'Vue' : 'Aperçu'} />
          <Tab label={isMobile ? 'Obj.' : 'Objectifs'} />
          <Tab label={isMobile ? 'Plan' : 'Planification'} />
        </Tabs>

        {/* Actions avancées */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <Tooltip title={allowPro ? 'Exporter vos objectifs en CSV' : 'Réservé au plan Pro'}>
            <span>
              <Button
                startIcon={<FileDownload />}
                variant="outlined"
                disabled={!allowPro || goals.length === 0}
                onClick={exportCSV}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Export CSV
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={allowPro ? 'Simuler les intérêts composés' : 'Réservé au plan Pro'}>
            <span>
              <Button
                startIcon={<Calculate />}
                variant="outlined"
                disabled={!allowPro}
                onClick={() => setSimOpen(true)}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Simulateur intérêts
              </Button>
            </span>
          </Tooltip>
          {!allowPro && (
            <Button 
              startIcon={<WorkspacePremium />} 
              onClick={() => navigate('/subscription')} 
              sx={{ color: '#ffd54f' }}
            >
              Passer Pro
            </Button>
          )}
        </Stack>

        {/* KPIs glassmorphism */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(180deg, rgba(25,118,210,0.35) 0%, rgba(25,118,210,0.15) 100%)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(25, 118, 210, 0.35)',
              color: 'white',
              boxShadow: '0 12px 40px rgba(25, 118, 210, 0.35)',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SavingsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('savings.totalSaved')}</Typography>
                </Box>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: '800' }}>
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
              background: 'linear-gradient(180deg, rgba(76,175,80,0.35) 0%, rgba(76,175,80,0.15) 100%)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(76, 175, 80, 0.35)',
              color: 'white',
              boxShadow: '0 12px 40px rgba(76, 175, 80, 0.35)',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('savings.progression')}</Typography>
                </Box>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: '800' }}>
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
              background: 'linear-gradient(180deg, rgba(3,169,244,0.35) 0%, rgba(3,169,244,0.15) 100%)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(3, 169, 244, 0.35)',
              color: 'white',
              boxShadow: '0 12px 40px rgba(3, 169, 244, 0.35)',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Flag sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('savings.goals')}</Typography>
                </Box>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: '800' }}>
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
              background: 'linear-gradient(180deg, rgba(255,152,0,0.35) 0%, rgba(255,152,0,0.15) 100%)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255, 152, 0, 0.35)',
              color: 'white',
              boxShadow: '0 12px 40px rgba(255, 152, 0, 0.35)',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Info sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('savings.averageMonthly')}</Typography>
                </Box>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: '800' }}>
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

        {/* Projections d'épargne (visible en Aperçu et Planification) */}
        <Paper sx={{ 
          p: 2, mb: 3,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
          borderRadius: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUp sx={{ color: 'white', mr: 1 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>Projections d'atteinte</Typography>
          </Box>
          {averageMonthlySavings <= 0 || goals.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Ajoutez des objectifs et enregistrez au moins un mois d'épargne pour voir des projections.
            </Typography>
          ) : (
            <List>
              {projections.map(p => (
                <ListItem key={p.id} divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <ListItemText
                    primary={<Typography sx={{ color: 'white', fontWeight: 600 }}>{p.name}</Typography>}
                    secondary={<Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>{p.monthsNeeded} mois • ETA: {p.eta}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* Barre outils Objectifs (onglet Objectifs/Planification) */}
        {tab !== 0 && (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2 }}>
            <TextField
              placeholder="Rechercher un objectif..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: 'rgba(255,255,255,0.7)' }}/></InputAdornment> }}
              sx={{
                input: { color: 'white', fontSize: isMobile ? 14 : 16 },
                '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'white' }},
                maxWidth: isMobile ? '100%' : 380
              }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="sort-label" sx={{ color: 'white' }}>Tri</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                label="Tri"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' }, minWidth: isMobile ? '100%' : 180 }}
              >
                <MenuItem value="deadline-asc">Échéance (ascendant)</MenuItem>
                <MenuItem value="progress-desc">Progression (descendant)</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={(_, v) => v && setStatusFilter(v)}
              size="small"
              sx={{ '& .MuiToggleButton-root': { color: 'white', borderColor: 'rgba(255,255,255,0.2)', padding: isMobile ? '4px 8px' : undefined, fontSize: isMobile ? 12 : 14 } }}
            >
              <ToggleButton value="all">Tous</ToggleButton>
              <ToggleButton value="active">Actifs</ToggleButton>
              <ToggleButton value="completed">Terminés</ToggleButton>
            </ToggleButtonGroup>
            <Button startIcon={<RestartAlt />} onClick={() => { setSearch(''); setSortBy('deadline-asc'); setStatusFilter('all'); }} sx={{ color: 'white', fontSize: isMobile ? 12 : 14 }}>Réinitialiser</Button>
          </Stack>
        )}

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
              {tab !== 0 && ` • ${filteredGoals.length}/${goals.length}`}
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
            {filteredGoals.length === 0 ? (
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
              filteredGoals.map((goal) => {
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
                                  deadline: goal.deadline,
                                  category: goal.category || 'Général',
                                  priority: goal.priority || 'moyenne',
                                  monthlyContribution: goal.monthlyContribution || '',
                                  color: goal.color || '#1976d2'
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
                        
                        <Box sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant={isMobile ? 'caption' : 'body2'} sx={{ color: 'rgba(255, 255, 255, 0.85)' }} component="span">
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
                              height: isMobile ? 6 : 8, 
                              borderRadius: 4,
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4
                              }
                            }}
                          />
                        </Box>
                        {/* Slider + entrée directe + menu rapide */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Slider
                            size={isMobile ? 'small' : 'medium'}
                            min={0}
                            max={goal.target || 0}
                            step={1}
                            value={Math.min(amountDraftByGoal[goal.id] ?? goal.current ?? 0, goal.target || 0)}
                            onChange={(_, val) => {
                              setAmountDraftByGoal(s => ({ ...s, [goal.id]: Math.max(0, Math.min(Number(val) || 0, goal.target || 0)) }));
                            }}
                            onChangeCommitted={(_, val) => {
                              const newCurrent = Math.max(0, Math.min(Number(val) || 0, goal.target || 0));
                              updateSavingsGoal(goal.id, { current: newCurrent });
                            }}
                            sx={{ color: 'white', flex: 1, minWidth: 160 }}
                          />
                          <TextField
                            size="small"
                            value={amountDraftByGoal[goal.id] ?? goal.current ?? 0}
                            onChange={(e) => {
                              const raw = Number(String(e.target.value).replace(',', '.')) || 0;
                              setAmountDraftByGoal(s => ({ ...s, [goal.id]: raw }));
                            }}
                            onBlur={() => {
                              const val = amountDraftByGoal[goal.id];
                              const safe = Math.max(0, Math.min(Number(val) || 0, goal.target || 0));
                              updateSavingsGoal(goal.id, { current: safe });
                            }}
                            inputProps={{ inputMode: 'decimal', style: { color: 'white', width: isMobile ? 88 : 110 } }}
                            sx={{
                              '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'white' } },
                            }}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => setQuickMenu({ anchorEl: e.currentTarget, goalId: goal.id })}
                            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                          >
                            Options
                          </Button>
                          <Menu
                            anchorEl={quickMenu.anchorEl}
                            open={Boolean(quickMenu.anchorEl) && quickMenu.goalId === goal.id}
                            onClose={() => setQuickMenu({ anchorEl: null, goalId: null })}
                            PaperProps={{ sx: { bgcolor: 'rgba(30,30,30,0.95)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' } }}
                          >
                            <MenuItem onClick={() => { updateSavingsGoal(goal.id, { current: 0 }); setQuickMenu({ anchorEl: null, goalId: null }); }}>Remettre à 0</MenuItem>
                            <MenuItem onClick={() => { updateSavingsGoal(goal.id, { current: goal.target || 0 }); setQuickMenu({ anchorEl: null, goalId: null }); }}>Atteint</MenuItem>
                            <MenuItem onClick={() => {
                              const inc = Math.round((goal.target || 1000) * 0.05);
                              const next = Math.min((goal.current || 0) + inc, goal.target || 0);
                              updateSavingsGoal(goal.id, { current: next });
                              setQuickMenu({ anchorEl: null, goalId: null });
                            }}>+5%</MenuItem>
                            <MenuItem onClick={() => {
                              const dec = Math.round((goal.target || 1000) * 0.05);
                              const next = Math.max((goal.current || 0) - dec, 0);
                              updateSavingsGoal(goal.id, { current: next });
                              setQuickMenu({ anchorEl: null, goalId: null });
                            }}>-5%</MenuItem>
                          </Menu>
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

        {/* Suggestions intelligentes (Premium/Pro) */}
        <Paper sx={{ 
          p: 2, mt: 3,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Lightbulb sx={{ color: 'white', mr: 1 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>Suggestions intelligentes</Typography>
          </Box>
          {allowPremiumOrPro ? (
            <List>
              {goals.slice(0, 3).map(g => {
                const progress = g.target > 0 ? ((g.current || 0) / g.target) : 0;
                const days = getDaysUntilDeadline(g.deadline) ?? null;
                let tip = '';
                if (progress < 0.25) tip = `Augmentez l'épargne dédiée à "${g.name}" de 10% ce mois-ci.`;
                else if (days !== null && days <= 60 && progress < 0.8) tip = `Rapprochez-vous de l'objectif "${g.name}" en y allouant une part fixe de votre épargne mensuelle.`;
                else tip = `Maintenez le cap sur "${g.name}". Vous pouvez viser +5% sur le prochain mois.`;
                return (
                  <ListItem key={g.id} divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <ListItemText
                      primary={<Typography sx={{ color: 'white' }}>{g.name}</Typography>}
                      secondary={<Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{tip}</Typography>}
                    />
                  </ListItem>
                );
              })}
              {goals.length === 0 && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Ajoutez un objectif pour recevoir des suggestions adaptées.
                </Typography>
              )}
            </List>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lock sx={{ color: 'rgba(255,255,255,0.7)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Suggestions disponibles avec Premium/Pro
              </Typography>
              <Button size="small" startIcon={<WorkspacePremium />} onClick={() => navigate('/subscription')} sx={{ color: '#ffd54f' }}>
                Découvrir les offres
              </Button>
            </Box>
          )}
        </Paper>

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

        {/* Simulateur d'intérêts composés (Pro) */}
        <Dialog 
          open={simOpen} 
          onClose={() => setSimOpen(false)}
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
            Simulateur d'intérêts composés
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Capital initial (€)"
                  type="number"
                  fullWidth
                  value={sim.principal}
                  onChange={(e) => setSim(s => ({ ...s, principal: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Versement mensuel (€)"
                  type="number"
                  fullWidth
                  value={sim.monthly}
                  onChange={(e) => setSim(s => ({ ...s, monthly: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Taux annuel (%)"
                  type="number"
                  fullWidth
                  value={sim.rate}
                  onChange={(e) => setSim(s => ({ ...s, rate: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Durée (années)"
                  type="number"
                  fullWidth
                  value={sim.years}
                  onChange={(e) => setSim(s => ({ ...s, years: e.target.value }))}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: '#333' }}>
                Montant final estimé: <strong>{Math.round(simResult.final).toLocaleString()}€</strong>
              </Typography>
              <Typography sx={{ color: '#333' }}>
                Intérêts estimés: <strong>{Math.round(simResult.interest).toLocaleString()}€</strong>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSimOpen(false)} sx={{ color: '#666' }}>Fermer</Button>
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