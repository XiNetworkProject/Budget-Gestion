import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../../store';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Button,
  Alert,
  AlertTitle,
  Fade,
  Zoom,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Schedule,
  Warning,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  PriorityHigh,
  CalendarToday,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  MoreVert,
  Edit,
  Delete,
  Add,
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Visibility,
  VisibilityOff,
  Settings,
  Analytics,
  Timeline,
  AccountBalance,
  Savings,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList,
  Sort,
  Refresh,
  Info,
  Lightbulb,
  Star,
  StarBorder,
  PlayArrow,
  Pause,
  Stop,
  CalendarMonth,
  DateRange,
  MonetizationOn,
  Payment,
  CreditCard,
  AccountBalanceWallet,
  Receipt,
  ReceiptLong,
  Assessment,
  PieChart,
  BarChart,
  ShowChart,
  CompareArrows,
  SwapHoriz,
  AutoAwesome,
  Bolt,
  Speed,
  TrendingFlat,
  TrendingDown as TrendingDownIcon2
} from '@mui/icons-material';
import { format, addDays, addWeeks, addMonths, addYears, isAfter, isBefore, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composants optimisés
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

const UpcomingPayments = React.memo(({ maxItems = 5, showAll = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showManagementDialog, setShowManagementDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPaymentForMenu, setSelectedPaymentForMenu] = useState(null);
  
  const { expenses, incomes, debts } = useStore();

  // Calcul des prochains paiements avec priorités
  const upcomingPayments = useMemo(() => {
    const payments = [];
    const today = new Date();

    // Fonction pour calculer la prochaine date de paiement
    const getNextPaymentDate = (transaction, baseDate = today) => {
      if (!transaction.recurring) return null;

      let nextDate = new Date(transaction.date);
      
      // Trouver la prochaine occurrence
      while (isBefore(nextDate, baseDate)) {
        switch (transaction.recurringType) {
          case 'daily':
            nextDate = addDays(nextDate, 1);
            break;
          case 'weekly':
            nextDate = addWeeks(nextDate, 1);
            break;
          case 'monthly':
            nextDate = addMonths(nextDate, 1);
            break;
          case 'yearly':
            nextDate = addYears(nextDate, 1);
            break;
          default:
            return null;
        }
      }

      return nextDate;
    };

    // Ajouter les dépenses récurrentes
    if (Array.isArray(expenses)) {
      expenses.forEach(expense => {
        if (expense && expense.recurring) {
          const nextDate = getNextPaymentDate(expense);
          if (nextDate) {
            const daysUntil = differenceInDays(nextDate, today);
            const priority = daysUntil <= 3 ? 'high' : daysUntil <= 7 ? 'medium' : 'low';
            
            payments.push({
              id: `expense-${expense.id}`,
              type: 'expense',
              title: expense.description,
              amount: expense.amount,
              category: expense.category,
              date: nextDate,
              daysUntil,
              priority,
              recurringType: expense.recurringType,
              originalTransaction: expense
            });
          }
        }
      });
    }

    // Ajouter les revenus récurrents
    if (Array.isArray(incomes)) {
      incomes.forEach(income => {
        if (income && income.recurring) {
          const nextDate = getNextPaymentDate(income);
          if (nextDate) {
            const daysUntil = differenceInDays(nextDate, today);
            const priority = daysUntil <= 3 ? 'high' : daysUntil <= 7 ? 'medium' : 'low';
            
            payments.push({
              id: `income-${income.id}`,
              type: 'income',
              title: income.description,
              amount: income.amount,
              category: income.category,
              date: nextDate,
              daysUntil,
              priority,
              recurringType: income.recurringType,
              originalTransaction: income
            });
          }
        }
      });
    }

    // Ajouter les paiements de dettes
    if (Array.isArray(debts)) {
      debts.forEach(debt => {
        if (debt && debt.monthlyPayment > 0) {
                  const nextDate = getNextPaymentDate({
          date: debt.date,
          recurring: true,
          recurringType: 'monthly'
        });
        
        if (nextDate) {
          const daysUntil = differenceInDays(nextDate, today);
          const priority = daysUntil <= 3 ? 'high' : daysUntil <= 7 ? 'medium' : 'low';
          
          payments.push({
            id: `debt-${debt.id}`,
            type: 'debt',
            title: `Paiement dette: ${debt.description}`,
            amount: debt.monthlyPayment,
            category: 'Dettes',
            date: nextDate,
            daysUntil,
            priority,
            recurringType: 'monthly',
            originalTransaction: debt
          });
        }
      }
    });
    }

    // Trier par priorité et date
    return payments.sort((a, b) => {
      // Priorité haute en premier
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      
      // Puis par date
      return a.daysUntil - b.daysUntil;
    });
  }, [expenses, incomes, debts]);

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  }, []);

  // Fonction pour obtenir l'icône de priorité
  const getPriorityIcon = useCallback((priority) => {
    switch (priority) {
      case 'high': return <PriorityHigh color="error" />;
      case 'medium': return <Warning color="warning" />;
      case 'low': return <CheckCircle color="success" />;
      default: return <Schedule />;
    }
  }, []);

  // Fonction pour formater la fréquence
  const getFrequencyText = useCallback((recurringType) => {
    switch (recurringType) {
      case 'daily': return 'Quotidien';
      case 'weekly': return 'Hebdomadaire';
      case 'monthly': return 'Mensuel';
      case 'yearly': return 'Annuel';
      default: return 'Personnalisé';
    }
  }, []);

  // Fonction pour obtenir l'icône du type
  const getTypeIcon = useCallback((type) => {
    switch (type) {
      case 'income': return <TrendingUp color="success" />;
      case 'expense': return <TrendingDown color="error" />;
      case 'debt': return <AttachMoney color="warning" />;
      default: return <Schedule />;
    }
  }, []);

  // Fonction pour formater le montant
  const formatAmount = useCallback((amount, type) => {
    const sign = type === 'income' ? '+' : '-';
    return `${sign}${amount.toLocaleString()}€`;
  }, []);

  // Fonction pour obtenir le message de délai
  const getDaysUntilText = useCallback((daysUntil) => {
    if (daysUntil === 0) return "Aujourd'hui";
    if (daysUntil === 1) return "Demain";
    if (daysUntil < 0) return `${Math.abs(daysUntil)} jour(s) en retard`;
    return `Dans ${daysUntil} jour(s)`;
  }, []);

  // Fonctions de gestion des menus et dialogues
  const handleMenuOpen = useCallback((event, payment) => {
    setAnchorEl(event.currentTarget);
    setSelectedPaymentForMenu(payment);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedPaymentForMenu(null);
  }, []);

  const handleViewDetails = useCallback((payment) => {
    setSelectedPayment(payment);
    setShowDetailsDialog(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleEditPayment = useCallback((payment) => {
    // TODO: Implémenter l'édition
    console.log('Éditer le paiement:', payment);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleDeletePayment = useCallback((payment) => {
    // TODO: Implémenter la suppression
    console.log('Supprimer le paiement:', payment);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleOpenManagement = useCallback(() => {
    setShowManagementDialog(true);
  }, []);

  // Calculs avancés pour les statistiques
  const statistics = useMemo(() => {
    const totalIncome = upcomingPayments
      .filter(p => p.type === 'income')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalExpenses = upcomingPayments
      .filter(p => p.type === 'expense' || p.type === 'debt')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const netFlow = totalIncome - totalExpenses;
    
    const overduePayments = upcomingPayments.filter(p => p.daysUntil < 0);
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    
    const thisWeekPayments = upcomingPayments.filter(p => p.daysUntil <= 7 && p.daysUntil >= 0);
    const thisWeekAmount = thisWeekPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const thisMonthPayments = upcomingPayments.filter(p => p.daysUntil <= 30 && p.daysUntil >= 0);
    const thisMonthAmount = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Optimisations possibles
    const optimizations = [];
    
    // Détecter les paiements similaires qui pourraient être consolidés
    const similarPayments = upcomingPayments
      .filter(p => p.type === 'expense')
      .reduce((acc, p) => {
        const key = `${p.category}-${p.amount}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
      }, {});
    
    Object.entries(similarPayments).forEach(([key, payments]) => {
      if (payments.length > 1) {
        optimizations.push({
          type: 'consolidation',
          title: 'Consolidation possible',
          description: `${payments.length} paiements similaires dans ${payments[0].category}`,
          savings: payments[0].amount * (payments.length - 1) * 0.1, // 10% d'économie estimée
          priority: 'medium'
        });
      }
    });
    
    // Détecter les paiements en retard
    if (overduePayments.length > 0) {
      optimizations.push({
        type: 'overdue',
        title: 'Paiements en retard',
        description: `${overduePayments.length} paiement(s) en retard`,
        impact: overdueAmount,
        priority: 'high'
      });
    }
    
    // Détecter les paiements de montants élevés
    const highAmountPayments = upcomingPayments.filter(p => p.amount > 500);
    if (highAmountPayments.length > 0) {
      optimizations.push({
        type: 'high_amount',
        title: 'Paiements importants',
        description: `${highAmountPayments.length} paiement(s) de plus de 500€`,
        total: highAmountPayments.reduce((sum, p) => sum + p.amount, 0),
        priority: 'medium'
      });
    }
    
    return {
      totalIncome,
      totalExpenses,
      netFlow,
      overduePayments: overduePayments.length,
      overdueAmount,
      thisWeekPayments: thisWeekPayments.length,
      thisWeekAmount,
      thisMonthPayments: thisMonthPayments.length,
      thisMonthAmount,
      optimizations
    };
  }, [upcomingPayments]);

  // Filtrage et tri des paiements
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = upcomingPayments;
    
    // Filtrage par type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }
    
    // Filtrage des paiements en retard
    if (showOverdueOnly) {
      filtered = filtered.filter(p => p.daysUntil < 0);
    }
    
    // Tri
    switch (sortBy) {
      case 'date':
        return filtered.sort((a, b) => a.daysUntil - b.daysUntil);
      case 'amount':
        return filtered.sort((a, b) => b.amount - a.amount);
      case 'type':
        return filtered.sort((a, b) => a.type.localeCompare(b.type));
      case 'priority':
      default:
        return filtered.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return a.daysUntil - b.daysUntil;
        });
    }
  }, [upcomingPayments, filterType, sortBy, showOverdueOnly]);

  const displayPayments = showAll ? filteredAndSortedPayments : filteredAndSortedPayments.slice(0, maxItems);
  const hasOverdue = upcomingPayments.some(p => p.daysUntil < 0);
  const hasHighPriority = upcomingPayments.some(p => p.priority === 'high');

  if (upcomingPayments.length === 0) {
    return (
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3
      }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={3}>
            <Schedule sx={{ fontSize: 48, color: 'text.secondary', mr: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Aucun paiement récurrent configuré
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Ajoutez des transactions récurrentes pour voir vos prochains paiements ici
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'visible'
      }}>
        <CardContent>
          {/* En-tête avec alertes */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <Badge badgeContent={upcomingPayments.length} color="primary">
                <Schedule sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
              </Badge>
              <Typography variant="h6" fontWeight="bold">
                Prochains Paiements
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              {hasOverdue && (
                <Tooltip title="Paiements en retard">
                  <Warning color="error" />
                </Tooltip>
              )}
              {hasHighPriority && (
                <Tooltip title="Paiements prioritaires">
                  <PriorityHigh color="error" />
                </Tooltip>
              )}
              <Tooltip title="Gestion avancée">
                <IconButton
                  size="small"
                  onClick={handleOpenManagement}
                  sx={{ color: 'text.secondary' }}
                >
                  <Settings />
                </IconButton>
              </Tooltip>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ color: 'text.secondary' }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>

          {/* Alertes importantes */}
          {hasOverdue && (
            <Fade in={true}>
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                <AlertTitle>Paiements en retard</AlertTitle>
                Vous avez des paiements qui sont en retard. Pensez à les régulariser rapidement.
              </Alert>
            </Fade>
          )}

          {hasHighPriority && !hasOverdue && (
            <Fade in={true}>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                <AlertTitle>Paiements prioritaires</AlertTitle>
                Vous avez des paiements importants dans les 3 prochains jours.
              </Alert>
            </Fade>
          )}

          {/* Liste des paiements */}
          <List sx={{ p: 0 }}>
            {displayPayments.map((payment, index) => (
              <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }} key={payment.id}>
                <ListItem
                  sx={{
                    background: payment.priority === 'high' 
                      ? 'rgba(244, 67, 54, 0.1)' 
                      : payment.priority === 'medium'
                      ? 'rgba(255, 152, 0, 0.1)'
                      : 'rgba(76, 175, 80, 0.1)',
                    borderRadius: 2,
                    mb: 1,
                    border: payment.priority === 'high' 
                      ? '1px solid rgba(244, 67, 54, 0.3)'
                      : payment.priority === 'medium'
                      ? '1px solid rgba(255, 152, 0, 0.3)'
                      : '1px solid rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      background: payment.priority === 'high' 
                        ? 'rgba(244, 67, 54, 0.15)' 
                        : payment.priority === 'medium'
                        ? 'rgba(255, 152, 0, 0.15)'
                        : 'rgba(76, 175, 80, 0.15)',
                    }
                  }}
                >
                  <ListItemIcon>
                    {getTypeIcon(payment.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {payment.title}
                        </Typography>
                        <Chip
                          label={getFrequencyText(payment.recurringType)}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {format(payment.date, 'dd MMMM yyyy', { locale: fr })}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={payment.daysUntil < 0 ? 'error.main' : 'text.secondary'}
                          fontWeight={payment.daysUntil <= 3 ? 'bold' : 'normal'}
                        >
                          {getDaysUntilText(payment.daysUntil)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="bold"
                        color={payment.type === 'income' ? 'success.main' : 'error.main'}
                      >
                        {formatAmount(payment.amount, payment.type)}
                      </Typography>
                      {getPriorityIcon(payment.priority)}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, payment)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              </Zoom>
            ))}
          </List>

          {/* Bouton pour voir plus */}
          {!showAll && upcomingPayments.length > maxItems && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="outlined"
                onClick={() => setExpanded(!expanded)}
                startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                sx={{ borderRadius: 2 }}
              >
                {expanded ? 'Voir moins' : `Voir ${upcomingPayments.length - maxItems} de plus`}
              </Button>
            </Box>
          )}

          {/* Résumé des priorités et statistiques */}
          {expanded && (
            <Collapse in={expanded}>
              <Divider sx={{ my: 2 }} />
              
              {/* Statistiques générales */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      +{statistics.totalIncome.toLocaleString()}€
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Revenus totaux
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      -{statistics.totalExpenses.toLocaleString()}€
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dépenses totales
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color={statistics.netFlow >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                      {statistics.netFlow >= 0 ? '+' : ''}{statistics.netFlow.toLocaleString()}€
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Flux net
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="warning.main" fontWeight="bold">
                      {statistics.thisWeekAmount.toLocaleString()}€
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cette semaine
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Barre de progression pour cette semaine */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Progression de la semaine
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {statistics.thisWeekPayments} paiements
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((statistics.thisWeekPayments / Math.max(upcomingPayments.length, 1)) * 100, 100)}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)'
                    }
                  }}
                />
              </Box>

              {/* Priorités */}
              <Box display="flex" justifyContent="space-around" textAlign="center">
                <Box>
                  <Typography variant="h6" color="error.main">
                    {upcomingPayments.filter(p => p.priority === 'high').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Priorité haute
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {upcomingPayments.filter(p => p.priority === 'medium').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Priorité moyenne
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {upcomingPayments.filter(p => p.priority === 'low').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Priorité basse
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          )}
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <MenuItem onClick={() => handleViewDetails(selectedPaymentForMenu)}>
          <Visibility sx={{ mr: 1 }} />
          Voir les détails
        </MenuItem>
        <MenuItem onClick={() => handleEditPayment(selectedPaymentForMenu)}>
          <Edit sx={{ mr: 1 }} />
          Modifier
        </MenuItem>
        <MenuItem onClick={() => handleDeletePayment(selectedPaymentForMenu)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Supprimer
        </MenuItem>
      </Menu>

      {/* Dialogue de détails */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        {selectedPayment && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              Détails du paiement récurrent
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Informations générales
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Titre
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedPayment.title}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Montant
                    </Typography>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold"
                      color={selectedPayment.type === 'income' ? 'success.main' : 'error.main'}
                    >
                      {formatAmount(selectedPayment.amount, selectedPayment.type)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Catégorie
                    </Typography>
                    <Chip label={selectedPayment.category} size="small" />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fréquence
                    </Typography>
                    <Chip 
                      label={getFrequencyText(selectedPayment.recurringType)} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Prochain paiement
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {format(selectedPayment.date, 'dd MMMM yyyy', { locale: fr })}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Délai
                    </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="medium"
                      color={selectedPayment.daysUntil < 0 ? 'error.main' : 'text.primary'}
                    >
                      {getDaysUntilText(selectedPayment.daysUntil)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Priorité
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getPriorityIcon(selectedPayment.priority)}
                      <Typography variant="body1" fontWeight="medium">
                        {selectedPayment.priority === 'high' ? 'Haute' : 
                         selectedPayment.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetailsDialog(false)}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialogue de gestion avancée */}
      <Dialog
        open={showManagementDialog}
        onClose={() => setShowManagementDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Gestion des paiements récurrents
        </DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Tous les paiements" />
            <Tab label="Optimisations" />
            <Tab label="Statistiques" />
          </Tabs>

          {/* Onglet Tous les paiements */}
          {activeTab === 0 && (
            <Box>
              {/* Filtres et tri */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="all">Tous</MenuItem>
                      <MenuItem value="income">Revenus</MenuItem>
                      <MenuItem value="expense">Dépenses</MenuItem>
                      <MenuItem value="debt">Dettes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trier par</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Trier par"
                    >
                      <MenuItem value="priority">Priorité</MenuItem>
                      <MenuItem value="date">Date</MenuItem>
                      <MenuItem value="amount">Montant</MenuItem>
                      <MenuItem value="type">Type</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showOverdueOnly}
                        onChange={(e) => setShowOverdueOnly(e.target.checked)}
                      />
                    }
                    label="En retard uniquement"
                  />
                </Grid>
              </Grid>

              {/* Tableau des paiements */}
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Titre</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Priorité</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAndSortedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {getTypeIcon(payment.type)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {payment.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payment.category}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={payment.type === 'income' ? 'success.main' : 'error.main'}
                          >
                            {formatAmount(payment.amount, payment.type)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(payment.date, 'dd/MM/yyyy')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getDaysUntilText(payment.daysUntil)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getPriorityIcon(payment.priority)}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, payment)}>
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Onglet Optimisations */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Optimisations suggérées
              </Typography>
              {statistics.optimizations.length === 0 ? (
                <Alert severity="info">
                  Aucune optimisation suggérée pour le moment.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {statistics.optimizations.map((opt, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box>
                            {opt.type === 'consolidation' && <CompareArrows color="info" />}
                            {opt.type === 'overdue' && <Warning color="error" />}
                            {opt.type === 'high_amount' && <MonetizationOn color="warning" />}
                          </Box>
                          <Box flexGrow={1}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {opt.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {opt.description}
                            </Typography>
                            {opt.savings && (
                              <Typography variant="body2" color="success.main" fontWeight="medium">
                                Économie estimée: {opt.savings.toLocaleString()}€
                              </Typography>
                            )}
                            {opt.impact && (
                              <Typography variant="body2" color="error.main" fontWeight="medium">
                                Impact: {opt.impact.toLocaleString()}€
                              </Typography>
                            )}
                          </Box>
                          <Chip 
                            label={opt.priority === 'high' ? 'Haute' : 'Moyenne'} 
                            color={opt.priority === 'high' ? 'error' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Onglet Statistiques */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Statistiques détaillées
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Répartition par type
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Revenus</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        +{statistics.totalIncome.toLocaleString()}€
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Dépenses</Typography>
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        -{statistics.totalExpenses.toLocaleString()}€
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1" fontWeight="bold">Flux net</Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold"
                        color={statistics.netFlow >= 0 ? 'success.main' : 'error.main'}
                      >
                        {statistics.netFlow >= 0 ? '+' : ''}{statistics.netFlow.toLocaleString()}€
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Prochaines échéances
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Cette semaine</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {statistics.thisWeekPayments} paiements
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Ce mois</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {statistics.thisMonthPayments} paiements
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">En retard</Typography>
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        {statistics.overduePayments} paiements
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManagementDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  );
});

UpcomingPayments.displayName = 'UpcomingPayments';

export default UpcomingPayments; 