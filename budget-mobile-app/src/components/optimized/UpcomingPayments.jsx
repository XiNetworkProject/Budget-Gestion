import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';
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
  Badge
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
  NotificationsOff
} from '@mui/icons-material';
import { format, addDays, addWeeks, addMonths, addYears, isAfter, isBefore, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composants optimisés
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

const UpcomingPayments = React.memo(({ maxItems = 5, showAll = false }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
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
    expenses.forEach(expense => {
      if (expense.recurring) {
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

    // Ajouter les revenus récurrents
    incomes.forEach(income => {
      if (income.recurring) {
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

    // Ajouter les paiements de dettes
    debts.forEach(debt => {
      if (debt.monthlyPayment > 0) {
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
      case 'daily': return t('upcomingPayments.frequency.daily');
      case 'weekly': return t('upcomingPayments.frequency.weekly');
      case 'monthly': return t('upcomingPayments.frequency.monthly');
      case 'yearly': return t('upcomingPayments.frequency.yearly');
      default: return 'Personnalisé';
    }
  }, [t]);

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
    if (daysUntil === 0) return t('upcomingPayments.today');
    if (daysUntil === 1) return t('upcomingPayments.tomorrow');
    if (daysUntil < 0) return t('upcomingPayments.daysOverdue', { days: Math.abs(daysUntil) });
    return t('upcomingPayments.daysUntil', { days: daysUntil });
  }, [t]);

  const displayPayments = showAll ? upcomingPayments : upcomingPayments.slice(0, maxItems);
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
              {t('upcomingPayments.noPayments')}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t('upcomingPayments.noPaymentsDescription')}
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
                {t('upcomingPayments.title')}
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
                <AlertTitle>{t('upcomingPayments.overdue')}</AlertTitle>
                {t('upcomingPayments.overdueDescription')}
              </Alert>
            </Fade>
          )}

          {hasHighPriority && !hasOverdue && (
            <Fade in={true}>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                <AlertTitle>{t('upcomingPayments.highPriority')}</AlertTitle>
                {t('upcomingPayments.highPriorityDescription')}
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
                {expanded ? t('upcomingPayments.seeLess') : `${t('upcomingPayments.seeMore')} ${upcomingPayments.length - maxItems}`}
              </Button>
            </Box>
          )}

          {/* Résumé des priorités */}
          {expanded && (
            <Collapse in={expanded}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-around" textAlign="center">
                <Box>
                  <Typography variant="h6" color="error.main">
                    {upcomingPayments.filter(p => p.priority === 'high').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('upcomingPayments.priority.high')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {upcomingPayments.filter(p => p.priority === 'medium').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('upcomingPayments.priority.medium')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {upcomingPayments.filter(p => p.priority === 'low').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('upcomingPayments.priority.low')}
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
});

UpcomingPayments.displayName = 'UpcomingPayments';

export default UpcomingPayments; 