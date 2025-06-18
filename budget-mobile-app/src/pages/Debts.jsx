import React, { useState } from 'react';
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
  MenuItem
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
  Calculate
} from '@mui/icons-material';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend,
  LineElement,
  PointElement
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

const Debts = () => {
  const [debts, setDebts] = useState([
    {
      id: 1,
      name: 'Carte de crédit BNP',
      type: 'credit_card',
      amount: 2500,
      paid: 800,
      interest: 18.9,
      dueDate: '2024-02-15',
      icon: '💳',
      color: '#FF6384',
      monthlyPayment: 200
    },
    {
      id: 2,
      name: 'Prêt immobilier',
      type: 'loan',
      amount: 150000,
      paid: 45000,
      interest: 2.1,
      dueDate: '2024-01-31',
      icon: '🏠',
      color: '#36A2EB',
      monthlyPayment: 1200
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
      monthlyPayment: parseFloat(newDebt.monthlyPayment),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      icon: newDebt.type === 'credit_card' ? '💳' : newDebt.type === 'loan' ? '🏦' : '💰',
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    setDebts([...debts, debt]);
    setAddDialog(false);
    setNewDebt({ name: '', type: 'credit_card', amount: '', paid: '0', interest: '', monthlyPayment: '' });
    setSnack({ open: true, message: 'Dette ajoutée', severity: 'success' });
  };

  const handleEditDebt = () => {
    if (selectedDebt) {
      setDebts(debts.map(debt => 
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
      ));
      setEditDialog(false);
      setSelectedDebt(null);
      setNewDebt({ name: '', type: 'credit_card', amount: '', paid: '0', interest: '', monthlyPayment: '' });
      setSnack({ open: true, message: 'Dette modifiée', severity: 'success' });
    }
  };

  const handleDeleteDebt = () => {
    if (selectedDebt) {
      setDebts(debts.filter(debt => debt.id !== selectedDebt.id));
      setDeleteDialog(false);
      setSelectedDebt(null);
      setSnack({ open: true, message: 'Dette supprimée', severity: 'info' });
    }
  };

  const handlePayment = () => {
    if (selectedDebt && paymentAmount) {
      const amount = parseFloat(paymentAmount);
      setDebts(debts.map(debt => 
        debt.id === selectedDebt.id 
          ? { ...debt, paid: Math.min(debt.paid + amount, debt.amount) }
          : debt
      ));
      setPaymentDialog(false);
      setSelectedDebt(null);
      setPaymentAmount('');
      setSnack({ open: true, message: `Paiement de ${amount}€ effectué`, severity: 'success' });
    }
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
    switch(type) {
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Dettes et Prêts
      </Typography>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDown sx={{ mr: 1 }} />
                <Typography variant="h6">Dette totale</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalDebt.toLocaleString()}€
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {remainingDebt.toLocaleString()}€ restants
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Payment sx={{ mr: 1 }} />
                <Typography variant="h6">Remboursé</Typography>
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
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="h6">Paiement mensuel</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalMonthlyPayment.toLocaleString()}€
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Total par mois
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Calculate sx={{ mr: 1 }} />
                <Typography variant="h6">Intérêts mensuels</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {debts.reduce((sum, debt) => sum + parseFloat(calculateInterestCost(debt)), 0).toFixed(0)}€
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Coût mensuel
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des dettes */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Mes dettes et prêts</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddDialog(true)}
          >
            Ajouter une dette
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
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h3" sx={{ mr: 1 }}>{debt.icon}</Typography>
                        <Box>
                          <Typography variant="h6">{debt.name}</Typography>
                          <Chip 
                            label={getDebtTypeLabel(debt.type)} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Box>
                        {progress >= 100 && <CheckCircle color="success" />}
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
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {debt.paid.toLocaleString()}€ / {debt.amount.toLocaleString()}€
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

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Détails
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Reste à payer:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {remaining.toLocaleString()}€
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Paiement mensuel:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {debt.monthlyPayment}€
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Intérêts mensuels:</Typography>
                        <Typography variant="body2" color="error.main" fontWeight="bold">
                          {monthlyInterest}€
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Échéance:</Typography>
                        <Typography variant="body2" color={daysLeft <= 7 ? 'error.main' : 'text.secondary'}>
                          {daysLeft} jours
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
                      >
                        Effectuer un paiement
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
              Montants restants par dette
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={barData} options={barOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Évolution des paiements mensuels
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={lineData} options={lineOptions} />
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
        <DialogTitle>Ajouter une dette</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la dette"
            fullWidth
            variant="outlined"
            value={newDebt.name}
            onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type de dette</InputLabel>
            <Select
              value={newDebt.type}
              onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value })}
            >
              <MenuItem value="credit_card">Carte de crédit</MenuItem>
              <MenuItem value="loan">Prêt personnel</MenuItem>
              <MenuItem value="mortgage">Hypothèque</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Montant total (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newDebt.amount}
            onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Montant déjà payé (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newDebt.paid}
            onChange={(e) => setNewDebt({ ...newDebt, paid: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Taux d'intérêt annuel (%)"
            type="number"
            fullWidth
            variant="outlined"
            value={newDebt.interest}
            onChange={(e) => setNewDebt({ ...newDebt, interest: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Paiement mensuel (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newDebt.monthlyPayment}
            onChange={(e) => setNewDebt({ ...newDebt, monthlyPayment: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleAddDebt} 
            variant="contained"
            disabled={!newDebt.name || !newDebt.amount || !newDebt.interest}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier la dette</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la dette"
            fullWidth
            variant="outlined"
            value={newDebt.name}
            onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type de dette</InputLabel>
            <Select
              value={newDebt.type}
              onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value })}
            >
              <MenuItem value="credit_card">Carte de crédit</MenuItem>
              <MenuItem value="loan">Prêt personnel</MenuItem>
              <MenuItem value="mortgage">Hypothèque</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Montant total (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newDebt.amount}
            onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Montant déjà payé (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newDebt.paid}
            onChange={(e) => setNewDebt({ ...newDebt, paid: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Taux d'intérêt annuel (%)"
            type="number"
            fullWidth
            variant="outlined"
            value={newDebt.interest}
            onChange={(e) => setNewDebt({ ...newDebt, interest: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Paiement mensuel (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={newDebt.monthlyPayment}
            onChange={(e) => setNewDebt({ ...newDebt, monthlyPayment: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleEditDebt} 
            variant="contained"
            disabled={!newDebt.name || !newDebt.amount || !newDebt.interest}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)}>
        <DialogTitle>Effectuer un paiement</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Paiement pour: <strong>{selectedDebt?.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Montant restant: {selectedDebt ? (selectedDebt.amount - selectedDebt.paid).toLocaleString() : 0}€
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Montant du paiement (€)"
            type="number"
            fullWidth
            variant="outlined"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Annuler</Button>
          <Button 
            onClick={handlePayment} 
            variant="contained"
            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
          >
            Payer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Supprimer la dette</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer la dette "{selectedDebt?.name}" ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeleteDebt} color="error" variant="contained">
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

export default Debts; 