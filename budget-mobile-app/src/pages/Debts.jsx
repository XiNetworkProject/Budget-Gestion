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
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingDown,
  CreditCard,
  Warning,
  CheckCircle,
  Schedule,
  Payment,
  Info,
  ExpandMore,
  AccountBalance,
  LocalAtm,
  Calculate,
  Home,
  MoreVert
} from '@mui/icons-material';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Legend,
  LineElement,
  PointElement
} from 'chart.js';
import CurrencyFormatter from '../components/CurrencyFormatter';

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, LineElement, PointElement);

const Debts = () => {
  const { t } = useTranslation();

  const [debts, setDebts] = useState([
    {
      id: 1,
      name: 'Carte de crédit',
      amount: 2500,
      paid: 800,
      type: 'credit_card',
      icon: <CreditCard sx={{ fontSize: 24 }} />,
      interest: 15.9,
      dueDate: '2024-12-31'
    },
    {
      id: 2,
      name: 'Prêt immobilier',
      amount: 150000,
      paid: 45000,
      type: 'mortgage',
      icon: <Home sx={{ fontSize: 24 }} />,
      interest: 2.1,
      dueDate: '2035-06-01'
    },
    {
      id: 3,
      name: 'Prêt étudiant',
      type: 'loan',
      amount: 8000,
      paid: 6000,
      interest: 1.5,
      dueDate: '2024-03-01',
      icon: '🎓',
      color: '#FFCE56',
      monthlyPayment: 150
    }
  ]);

  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [newDebt, setNewDebt] = useState({ 
    name: '', 
    type: 'credit_card', 
    amount: '', 
    paid: '0', 
    interest: '', 
    monthlyPayment: '' 
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Calculs
  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaid = debts.reduce((sum, debt) => sum + debt.paid, 0);
  const remainingDebt = totalDebt - totalPaid;
  const overallProgress = ((totalPaid / totalDebt) * 100).toFixed(1);
  const totalMonthlyPayment = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);

  // Données pour les graphiques
  const monthlyPayments = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    data: [1550, 1600, 1580, 1620, 1590, 1610]
  };

  const barData = {
    labels: debts.map(debt => debt.name),
    datasets: [{
      label: 'Montant restant',
      data: debts.map(debt => debt.amount - debt.paid),
      backgroundColor: debts.map(debt => debt.color),
      borderWidth: 1
    }]
  };

  const lineData = {
    labels: monthlyPayments.labels,
    datasets: [{
      label: 'Paiements mensuels',
      data: monthlyPayments.data,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.1)',
      tension: 0.4
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

  const lineOptions = {
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

  const handleAddDebt = () => {
    const debt = {
      id: Date.now(),
      name: newDebt.name,
      type: newDebt.type,
      amount: parseFloat(newDebt.amount),
      paid: parseFloat(newDebt.paid) || 0,
      interest: parseFloat(newDebt.interest),
      monthlyPayment: parseFloat(newDebt.monthlyPayment) || 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setDebts([...debts, debt]);
    setSnack({ open: true, message: t('debts.debtAdded'), severity: 'success' });
    setAddDialog(false);
    setNewDebt({ 
      name: '', 
      type: 'credit_card', 
      amount: '', 
      paid: '0', 
      interest: '', 
      monthlyPayment: '' 
    });
  };

  const handleEditDebt = () => {
    const updatedDebts = debts.map(debt => 
      debt.id === selectedDebt.id 
        ? { 
            ...debt, 
            name: newDebt.name, 
            type: newDebt.type, 
            amount: parseFloat(newDebt.amount), 
            paid: parseFloat(newDebt.paid),
            interest: parseFloat(newDebt.interest),
            monthlyPayment: parseFloat(newDebt.monthlyPayment)
          }
        : debt
    );
    setDebts(updatedDebts);
    setSnack({ open: true, message: t('debts.debtUpdated'), severity: 'success' });
    setEditDialog(false);
  };

  const handleDeleteDebt = () => {
    setDebts(debts.filter(debt => debt.id !== selectedDebt.id));
    setSnack({ open: true, message: t('debts.debtDeleted'), severity: 'info' });
    setDeleteDialog(false);
  };

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    const updatedDebts = debts.map(debt => 
      debt.id === selectedDebt.id 
        ? { ...debt, paid: Math.min(debt.paid + amount, debt.amount) }
        : debt
    );
    setDebts(updatedDebts);
    setSnack({ open: true, message: t('debts.paymentMade'), severity: 'success' });
    setPaymentDialog(false);
    setPaymentAmount('');
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'warning';
    return 'primary';
  };

  const getDaysUntilDue = (dueDate) => {
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getDebtTypeLabel = (type) => {
    switch (type) {
      case 'credit_card': return 'Carte de crédit';
      case 'loan': return 'Prêt';
      case 'mortgage': return 'Hypothèque';
      default: return 'Autre';
    }
  };

  const calculateInterestCost = (debt) => {
    const remaining = debt.amount - debt.paid;
    return (remaining * debt.interest / 100 / 12).toFixed(2);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            {t('debts.title')}
          </Typography>
        </Box>
      </AppBar>

      <Box sx={{ p: 2, pb: 10, position: 'relative', zIndex: 1 }}>
        {/* KPIs glassmorphism */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(244, 67, 54, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('debts.totalDebt')}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalDebt.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                  {remainingDebt.toLocaleString()}€ {t('debts.remaining')}
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
                  <Payment sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('debts.paid')}</Typography>
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
              background: 'rgba(255, 152, 0, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('debts.monthlyPayment')}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalMonthlyPayment.toLocaleString()}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                  Total par mois
                </Typography>
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
                  <Calculate sx={{ mr: 1 }} />
                  <Typography variant="h6">{t('debts.monthlyInterest')}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {debts.reduce((sum, debt) => sum + parseFloat(calculateInterestCost(debt)), 0).toFixed(0)}€
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }} component="span">
                  Coût mensuel
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Liste des dettes glassmorphism */}
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
              {t('debts.myDebtsAndLoans')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddDialog(true)}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              {t('debts.addDebt')}
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {debts.map((debt) => {
              const progress = ((debt.paid / debt.amount) * 100).toFixed(1);
              const daysLeft = getDaysUntilDue(debt.dueDate);
              const remaining = debt.amount - debt.paid;
              const monthlyInterest = calculateInterestCost(debt);
              
              return (
                <Grid item xs={12} md={6} lg={4} key={debt.id}>
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
                            {debt.icon}
                          </Typography>
                          <Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                              {debt.name}
                            </Typography>
                            <Chip 
                              label={getDebtTypeLabel(debt.type)} 
                              size="small" 
                              sx={{ 
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                              }}
                            />
                          </Box>
                        </Box>
                        <Box>
                          {progress >= 100 && <CheckCircle sx={{ color: '#4caf50' }} />}
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedDebt(debt);
                              setNewDebt({ 
                                name: debt.name, 
                                type: debt.type, 
                                amount: debt.amount, 
                                paid: debt.paid,
                                interest: debt.interest,
                                monthlyPayment: debt.monthlyPayment
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
                              setSelectedDebt(debt);
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
                            {debt.paid.toLocaleString()}€ / {debt.amount.toLocaleString()}€
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

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} gutterBottom component="span">
                          {t('debts.details')}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} component="span">
                            {t('debts.remainingToPay')}:
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }} component="span">
                            {remaining.toLocaleString()}€
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} component="span">
                            {t('debts.monthlyPayment')}:
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }} component="span">
                            {debt.monthlyPayment}€
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} component="span">
                            {t('debts.monthlyInterestAmount')}:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 'bold' }} component="span">
                            {monthlyInterest}€
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} component="span">
                            {t('debts.dueIn')}:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: daysLeft <= 7 ? '#f44336' : 'rgba(255, 255, 255, 0.7)',
                              fontWeight: daysLeft <= 7 ? 'bold' : 'normal'
                            }} 
                            component="span"
                          >
                            {daysLeft} {t('debts.daysLeft')}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Payment />}
                          onClick={() => {
                            setSelectedDebt(debt);
                            setPaymentDialog(true);
                          }}
                          disabled={debt.paid >= debt.amount}
                          fullWidth
                          sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              background: 'rgba(255, 255, 255, 0.1)'
                            },
                            '&:disabled': {
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(255, 255, 255, 0.3)'
                            }
                          }}
                        >
                          {t('debts.makePayment')}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
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
                {t('debts.remainingDebtByDebt')}
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={barData} options={barOptions} />
              </Box>
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
                {t('debts.monthlyPaymentsEvolution')}
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={lineData} options={lineOptions} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* FAB glassmorphism */}
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ 
            position: 'fixed', 
            bottom: 80, 
            right: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease'
          }}
          onClick={() => setAddDialog(true)}
        >
          <Add />
        </Fab>

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
            {t('debts.addDebtTitle')}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('debts.debtName')}
              fullWidth
              variant="outlined"
              value={newDebt.name}
              onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('debts.debtType')}</InputLabel>
              <Select
                value={newDebt.type}
                onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value })}
              >
                <MenuItem value="credit_card">{t('debts.creditCard')}</MenuItem>
                <MenuItem value="loan">{t('debts.loan')}</MenuItem>
                <MenuItem value="mortgage">{t('debts.mortgage')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label={t('debts.totalAmount')}
              type="number"
              fullWidth
              variant="outlined"
              value={newDebt.amount}
              onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label={t('debts.paidAmount')}
              type="number"
              fullWidth
              variant="outlined"
              value={newDebt.paid}
              onChange={(e) => setNewDebt({ ...newDebt, paid: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label={t('debts.interestRate')}
              type="number"
              fullWidth
              variant="outlined"
              value={newDebt.interest}
              onChange={(e) => setNewDebt({ ...newDebt, interest: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label={t('debts.monthlyPayment')}
              type="number"
              fullWidth
              variant="outlined"
              value={newDebt.monthlyPayment}
              onChange={(e) => setNewDebt({ ...newDebt, monthlyPayment: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setAddDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('debts.cancel')}
            </Button>
            <Button 
              onClick={handleAddDebt} 
              variant="contained"
              disabled={!newDebt.name || !newDebt.amount || !newDebt.interest}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              {t('debts.add')}
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
            {t('debts.editDebtTitle')}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('debts.debtName')}
              fullWidth
              variant="outlined"
              value={newDebt.name}
              onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('debts.debtType')}</InputLabel>
              <Select
                value={newDebt.type}
                onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value })}
              >
                <MenuItem value="credit_card">{t('debts.creditCard')}</MenuItem>
                <MenuItem value="loan">{t('debts.loan')}</MenuItem>
                <MenuItem value="mortgage">{t('debts.mortgage')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label={t('debts.totalAmount')}
              type="number"
              fullWidth
              variant="outlined"
              value={newDebt.amount}
              onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label={t('debts.paidAmount')}
              type="number"
              fullWidth
              variant="outlined"
              value={newDebt.paid}
              onChange={(e) => setNewDebt({ ...newDebt, paid: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label={t('debts.interestRate')}
              type="number"
              fullWidth
              variant="outlined"
              value={newDebt.interest}
              onChange={(e) => setNewDebt({ ...newDebt, interest: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label={t('debts.monthlyPayment')}
              type="number"
              fullWidth
              variant="outlined"
              value={newDebt.monthlyPayment}
              onChange={(e) => setNewDebt({ ...newDebt, monthlyPayment: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setEditDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('debts.cancel')}
            </Button>
            <Button 
              onClick={handleEditDebt} 
              variant="contained"
              disabled={!newDebt.name || !newDebt.amount || !newDebt.interest}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              {t('debts.edit')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={paymentDialog} 
          onClose={() => setPaymentDialog(false)}
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
            {t('debts.makePaymentTitle')}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#333' }} gutterBottom>
              {t('debts.paymentFor')} <strong>{selectedDebt?.name}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }} gutterBottom>
              {t('debts.remainingAmount')} {selectedDebt ? (selectedDebt.amount - selectedDebt.paid).toLocaleString() : 0}€
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label={t('debts.paymentAmount')}
              type="number"
              fullWidth
              variant="outlined"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setPaymentDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('debts.cancel')}
            </Button>
            <Button 
              onClick={handlePayment} 
              variant="contained"
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
                }
              }}
            >
              {t('debts.pay')}
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
            {t('debts.deleteDebtTitle')}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#333' }}>
              {t('debts.deleteConfirmation')} "{selectedDebt?.name}" ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('debts.cancel')}
            </Button>
            <Button 
              onClick={handleDeleteDebt} 
              color="error" 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
                }
              }}
            >
              {t('debts.delete')}
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

export default Debts; 