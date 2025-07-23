import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  IconButton, 
  Collapse,
  Fab,
  Tooltip,
  Alert,
  LinearProgress,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import {
  Schedule,
  Warning,
  CheckCircle,
  Error,
  ExpandMore,
  ExpandLess,
  Add,
  Notifications,
  NotificationsOff,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  PriorityHigh,
  LowPriority,
  MoreVert,
  Edit,
  Delete,
  Refresh
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { format, addDays, addMonths, addYears, isBefore, isAfter, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composants optimisés
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

// Configuration
import { PERFORMANCE_CONFIG } from '../../config/performance';

// Composant de priorité avec couleurs et icônes
const PriorityIndicator = React.memo(({ priority, dueDate }) => {
  const { t } = useTranslation();
  const daysUntilDue = differenceInDays(new Date(dueDate), new Date());
  
  const getPriorityConfig = () => {
    if (daysUntilDue < 0) return { color: '#f44336', icon: Error, label: t('upcomingPayments.priority.overdue') };
    if (daysUntilDue <= 3) return { color: '#ff9800', icon: Warning, label: t('upcomingPayments.priority.critical') };
    if (daysUntilDue <= 7) return { color: '#ff5722', icon: PriorityHigh, label: t('upcomingPayments.priority.high') };
    if (daysUntilDue <= 14) return { color: '#2196f3', icon: Schedule, label: t('upcomingPayments.priority.medium') };
    return { color: '#4caf50', icon: LowPriority, label: t('upcomingPayments.priority.low') };
  };

  const config = getPriorityConfig();
  const IconComponent = config.icon;

  return (
    <Chip
      icon={<IconComponent />}
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.color,
        color: 'white',
        fontWeight: 'bold',
        '& .MuiChip-icon': { color: 'white' }
      }}
    />
  );
});

// Carte de paiement individuelle
const PaymentCard = React.memo(({ payment, onEdit, onDelete, onToggleReminder }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  const daysUntilDue = differenceInDays(new Date(payment.nextDueDate), new Date());
  const isOverdue = daysUntilDue < 0;
  const isCritical = daysUntilDue <= 3;
  
  const getProgressColor = () => {
    if (isOverdue) return '#f44336';
    if (isCritical) return '#ff9800';
    if (daysUntilDue <= 7) return '#ff5722';
    return '#4caf50';
  };

  const progressValue = Math.max(0, Math.min(100, (30 - daysUntilDue) / 30 * 100));

  return (
    <Fade in timeout={300}>
      <Card 
        sx={{ 
          mb: 2,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            border: `1px solid ${getProgressColor()}40`
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* En-tête avec priorité et actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PriorityIndicator priority={payment.priority} dueDate={payment.nextDueDate} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                {payment.description || payment.category}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={payment.reminderEnabled ? t('upcomingPayments.disableReminder') : t('upcomingPayments.enableReminder')}>
                <IconButton 
                  size="small" 
                  onClick={() => onToggleReminder(payment.id)}
                  sx={{ color: payment.reminderEnabled ? '#4caf50' : '#666' }}
                >
                  {payment.reminderEnabled ? <Notifications /> : <NotificationsOff />}
                </IconButton>
              </Tooltip>
              
              <IconButton 
                size="small" 
                onClick={() => setExpanded(!expanded)}
                sx={{ color: 'white' }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>

          {/* Informations principales */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              {payment.amount.toLocaleString()}€
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ fontSize: 16, color: '#666' }} />
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                {format(new Date(payment.nextDueDate), 'dd MMM yyyy', { locale: fr })}
              </Typography>
            </Box>
          </Box>

          {/* Barre de progression */}
          <Box sx={{ mb: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={progressValue}
              sx={{ 
                height: 4, 
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getProgressColor()
                }
              }} 
            />
          </Box>

          {/* Informations supplémentaires */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              {isOverdue 
                ? `${Math.abs(daysUntilDue)} ${t('upcomingPayments.daysOverdue')}`
                : `${daysUntilDue} ${t('upcomingPayments.daysUntilDue')}`
              }
            </Typography>
            
            <Chip 
              label={t(`upcomingPayments.frequency.${payment.recurringType}`)}
              size="small"
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          </Box>

          {/* Section dépliable */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  {t('upcomingPayments.category')}:
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {payment.category}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  {t('upcomingPayments.recurringEnd')}:
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {payment.recurringEndDate 
                    ? format(new Date(payment.recurringEndDate), 'dd MMM yyyy', { locale: fr })
                    : t('upcomingPayments.noEndDate')
                  }
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  {t('upcomingPayments.autoRenew')}:
                </Typography>
                <Chip 
                  icon={payment.autoRenew ? <CheckCircle /> : <Error />}
                  label={payment.autoRenew ? t('upcomingPayments.enabled') : t('upcomingPayments.disabled')}
                  size="small"
                  sx={{ 
                    backgroundColor: payment.autoRenew ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)',
                    color: payment.autoRenew ? '#4caf50' : '#f44336'
                  }}
                />
              </Box>
              
              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={t('upcomingPayments.edit')}>
                  <IconButton 
                    size="small" 
                    onClick={() => onEdit(payment)}
                    sx={{ 
                      backgroundColor: 'rgba(33,150,243,0.2)',
                      color: '#2196f3',
                      '&:hover': { backgroundColor: 'rgba(33,150,243,0.3)' }
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={t('upcomingPayments.delete')}>
                  <IconButton 
                    size="small" 
                    onClick={() => onDelete(payment.id)}
                    sx={{ 
                      backgroundColor: 'rgba(244,67,54,0.2)',
                      color: '#f44336',
                      '&:hover': { backgroundColor: 'rgba(244,67,54,0.3)' }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Fade>
  );
});

// Composant principal
const UpcomingPayments = React.memo(({ 
  payments = [], 
  onAddPayment, 
  onEditPayment, 
  onDeletePayment, 
  onToggleReminder,
  loading = false,
  error = null
}) => {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'critical', 'overdue', 'upcoming'

  // Debug: vérifier si les traductions sont chargées
  console.log('i18n ready:', i18n.isInitialized);
  console.log('Current language:', i18n.language);
  console.log('Test translation:', t('upcomingPayments.title'));

  // Calculs optimisés avec useMemo
  const { 
    criticalPayments, 
    overduePayments, 
    upcomingPayments, 
    totalAmount, 
    stats 
  } = useMemo(() => {
    const now = new Date();
    
    const critical = payments.filter(p => {
      const daysUntil = differenceInDays(new Date(p.nextDueDate), now);
      return daysUntil <= 3 && daysUntil >= 0;
    });
    
    const overdue = payments.filter(p => {
      const daysUntil = differenceInDays(new Date(p.nextDueDate), now);
      return daysUntil < 0;
    });
    
    const upcoming = payments.filter(p => {
      const daysUntil = differenceInDays(new Date(p.nextDueDate), now);
      return daysUntil > 3;
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const stats = {
      total: payments.length,
      critical: critical.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
      totalAmount: total
    };

    return { criticalPayments: critical, overduePayments: overdue, upcomingPayments: upcoming, totalAmount: total, stats };
  }, [payments]);

  // Filtrer les paiements selon le filtre sélectionné
  const filteredPayments = useMemo(() => {
    switch (filter) {
      case 'critical':
        return criticalPayments;
      case 'overdue':
        return overduePayments;
      case 'upcoming':
        return upcomingPayments;
      default:
        return payments;
    }
  }, [filter, payments, criticalPayments, overduePayments, upcomingPayments]);

  // Tri par priorité et date
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      const daysA = differenceInDays(new Date(a.nextDueDate), new Date());
      const daysB = differenceInDays(new Date(b.nextDueDate), new Date());
      
      // Priorité aux paiements en retard
      if (daysA < 0 && daysB >= 0) return -1;
      if (daysA >= 0 && daysB < 0) return 1;
      
      // Puis par nombre de jours restants
      return daysA - daysB;
    });
  }, [filteredPayments]);

  // Gestionnaires d'événements optimisés
  const handleEdit = useCallback((payment) => {
    onEditPayment?.(payment);
  }, [onEditPayment]);

  const handleDelete = useCallback((paymentId) => {
    onDeletePayment?.(paymentId);
  }, [onDeletePayment]);

  const handleToggleReminder = useCallback((paymentId) => {
    onToggleReminder?.(paymentId);
  }, [onToggleReminder]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <LoadingSpinner message={t('upcomingPayments.loading')} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <ErrorBoundary>
      <Card sx={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        mb: 3
      }}>
        <CardContent sx={{ p: 0 }}>
          {/* En-tête avec statistiques */}
          <Box sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ color: '#4caf50' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {t('upcomingPayments.title')}
                </Typography>
                <Chip 
                  label={stats.total}
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(76,175,80,0.2)',
                    color: '#4caf50',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('upcomingPayments.addPayment')}>
                  <Fab 
                    size="small" 
                    color="primary"
                    onClick={onAddPayment}
                    sx={{ 
                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)' }
                    }}
                  >
                    <Add />
                  </Fab>
                </Tooltip>
                
                <IconButton 
                  onClick={() => setExpanded(!expanded)}
                  sx={{ color: 'white' }}
                >
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
            </Box>

            {/* Statistiques rapides */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                  {stats.critical}
                </Typography>
                <Typography variant="caption" sx={{ color: '#ccc' }}>
                  {t('upcomingPayments.critical')}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                  {stats.overdue}
                </Typography>
                <Typography variant="caption" sx={{ color: '#ccc' }}>
                  {t('upcomingPayments.overdue')}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {totalAmount.toLocaleString()}€
                </Typography>
                <Typography variant="caption" sx={{ color: '#ccc' }}>
                  {t('upcomingPayments.totalAmount')}
                </Typography>
              </Box>
            </Box>

            {/* Filtres */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { key: 'all', label: t('upcomingPayments.filters.all'), color: '#2196f3' },
                { key: 'critical', label: t('upcomingPayments.filters.critical'), color: '#ff9800' },
                { key: 'overdue', label: t('upcomingPayments.filters.overdue'), color: '#f44336' },
                { key: 'upcoming', label: t('upcomingPayments.filters.upcoming'), color: '#4caf50' }
              ].map((filterOption) => (
                <Chip
                  key={filterOption.key}
                  label={filterOption.label}
                  size="small"
                  onClick={() => setFilter(filterOption.key)}
                  sx={{
                    backgroundColor: filter === filterOption.key ? filterOption.color : 'rgba(255,255,255,0.1)',
                    color: filter === filterOption.key ? 'white' : '#ccc',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: filter === filterOption.key ? filterOption.color : 'rgba(255,255,255,0.2)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Liste des paiements */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
              {sortedPayments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    {t('upcomingPayments.noPayments')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>
                    {t('upcomingPayments.noPaymentsDescription')}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {sortedPayments.map((payment, index) => (
                    <Slide direction="up" in timeout={300 + index * 100} key={payment.id}>
                      <Box>
                        <PaymentCard
                          payment={payment}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleReminder={handleToggleReminder}
                        />
                      </Box>
                    </Slide>
                  ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
});

export default UpcomingPayments; 