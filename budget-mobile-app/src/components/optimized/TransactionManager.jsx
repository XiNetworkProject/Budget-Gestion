import React, { useState, memo, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Avatar,
  Tooltip,
  Fade,
  Zoom,
  Alert,
  Snackbar,
  Fab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  TrendingDown,
  TrendingUp,
  CalendarToday,
  Euro,
  Description,
  Category,
  MoreVert,
  ExpandMore,
  FilterList,
  Sort,
  Search,
  AttachMoney,
  CheckCircle,
  Warning,
  Info,
  DateRange,
  LocalOffer,
  AccountBalance
} from '@mui/icons-material';

const TransactionManager = memo(({ 
  type = 'expenses', // 'expenses' ou 'income'
  transactions = [],
  categories = [],
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onFilterTransactions,
  selectedCategory = null,
  t
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date(),
    recurring: false,
    recurringType: 'monthly'
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransactionForMenu, setSelectedTransactionForMenu] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs de rendu avant le montage
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Filtrer et trier les transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtrer par catégorie sélectionnée
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory.name);
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Trier
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, selectedCategory, searchTerm, sortBy, sortOrder]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const total = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const count = filteredTransactions.length;
    const avg = count > 0 ? total / count : 0;
    
    // Grouper par catégorie
    const byCategory = filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
      return acc;
    }, {});

    return { total, count, avg, byCategory };
  }, [filteredTransactions]);

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setNewTransaction({
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        date: new Date(transaction.date),
        recurring: transaction.recurring || false,
        recurringType: transaction.recurringType || 'monthly'
      });
    } else {
      setEditingTransaction(null);
      setNewTransaction({
        amount: '',
        category: selectedCategory?.name || '',
        description: '',
        date: new Date(),
        recurring: false,
        recurringType: 'monthly'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    setNewTransaction({
      amount: '',
      category: '',
      description: '',
      date: new Date(),
      recurring: false,
      recurringType: 'monthly'
    });
  };

  const handleSave = () => {
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.description) {
      setSnackbar({
        open: true,
        message: t('transactionManager.allFieldsRequired'),
        severity: 'error'
      });
      return;
    }

    const transactionData = {
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
      date: newTransaction.date.toISOString(),
      type
    };

    if (editingTransaction) {
      onUpdateTransaction(editingTransaction.id, transactionData);
      setSnackbar({
        open: true,
        message: t('transactionManager.updated'),
        severity: 'success'
      });
    } else {
      onAddTransaction(transactionData);
      setSnackbar({
        open: true,
        message: t('transactionManager.added'),
        severity: 'success'
      });
    }
    handleCloseDialog();
  };

  const handleDelete = (transaction) => {
    onDeleteTransaction(transaction.id);
    setSnackbar({
      open: true,
      message: t('transactionManager.deleted'),
      severity: 'success'
    });
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, transaction) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransactionForMenu(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransactionForMenu(null);
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#90A4AE';
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Box>
      {/* Header avec statistiques */}
      <Paper sx={{
        p: 3,
        mb: 3,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
            {type === 'expenses' ? t('transactionManager.expenses') : t('transactionManager.income')}
          </Typography>
          <Chip 
            label={`${filteredTransactions.length} ${t('transactionManager.transactions')}`}
            color="primary"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(stats.total)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('transactionManager.total')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                {stats.count}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('transactionManager.count')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(stats.avg)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('transactionManager.average')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filtres et recherche */}
      <Paper sx={{
        p: 2,
        mb: 3,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder={t('transactionManager.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('transactionManager.sortBy')}
              </InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label={t('transactionManager.sortBy')}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                <MenuItem value="date">{t('transactionManager.sortByDate')}</MenuItem>
                <MenuItem value="amount">{t('transactionManager.sortByAmount')}</MenuItem>
                <MenuItem value="category">{t('transactionManager.sortByCategory')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              startIcon={<Sort />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)'
                }
              }}
            >
              {sortOrder === 'asc' ? t('transactionManager.ascending') : t('transactionManager.descending')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Liste des transactions */}
      <List sx={{ p: 0 }}>
        {filteredTransactions.map((transaction, index) => (
          mounted ? (
            <Zoom in timeout={800 + index * 100} key={transaction.id}>
              <Paper sx={{
                mb: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  background: 'rgba(255, 255, 255, 0.15)'
                }
              }}>
                <ListItem sx={{ p: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: getCategoryColor(transaction.category),
                      width: 48,
                      height: 48
                    }}>
                      {type === 'expenses' ? <TrendingDown /> : <TrendingUp />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          color: 'white',
                          flexGrow: 1
                        }}>
                          {transaction.description}
                        </Typography>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: type === 'expenses' ? '#FF6B6B' : '#4CAF50',
                          ml: 2
                        }}>
                          {type === 'expenses' ? '-' : '+'}{formatAmount(transaction.amount)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Chip
                            label={transaction.category}
                            size="small"
                            sx={{
                              bgcolor: getCategoryColor(transaction.category),
                              color: 'white',
                              mr: 1
                            }}
                          />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {formatDate(transaction.date)}
                          </Typography>
                        </Box>
                        {transaction.recurring && (
                          <Chip
                            label={t('transactionManager.recurring')}
                            size="small"
                            variant="outlined"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => handleMenuOpen(e, transaction)}
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      <MoreVert />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            </Zoom>
          ) : (
            <Paper key={transaction.id} sx={{
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
              <ListItem sx={{ p: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: getCategoryColor(transaction.category),
                    width: 48,
                    height: 48
                  }}>
                    {type === 'expenses' ? <TrendingDown /> : <TrendingUp />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: 'white',
                        flexGrow: 1
                      }}>
                        {transaction.description}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700, 
                        color: type === 'expenses' ? '#FF6B6B' : '#4CAF50',
                        ml: 2
                      }}>
                        {type === 'expenses' ? '-' : '+'}{formatAmount(transaction.amount)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Chip
                          label={transaction.category}
                          size="small"
                          sx={{
                            bgcolor: getCategoryColor(transaction.category),
                            color: 'white',
                            mr: 1
                          }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {formatDate(transaction.date)}
                        </Typography>
                      </Box>
                      {transaction.recurring && (
                        <Chip
                          label={t('transactionManager.recurring')}
                          size="small"
                          variant="outlined"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, transaction)}
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <MoreVert />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          )
        ))}
      </List>

      {/* Message si aucune transaction */}
      {filteredTransactions.length === 0 && (
        <Fade in timeout={800}>
          <Paper sx={{
            p: 4,
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              {t('transactionManager.noTransactions')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {t('transactionManager.noTransactionsMessage')}
            </Typography>
          </Paper>
        </Fade>
      )}

      {/* Bouton d'ajout flottant */}
      <Fab
        color="primary"
        aria-label="add transaction"
        onClick={() => handleOpenDialog()}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          background: type === 'expenses' 
            ? 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)'
            : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          boxShadow: type === 'expenses'
            ? '0 8px 25px rgba(255, 107, 107, 0.4)'
            : '0 8px 25px rgba(76, 175, 80, 0.4)',
          '&:hover': {
            background: type === 'expenses'
              ? 'linear-gradient(135deg, #FF5252 0%, #FF1744 100%)'
              : 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
            transform: 'scale(1.1)',
            boxShadow: type === 'expenses'
              ? '0 12px 35px rgba(255, 107, 107, 0.6)'
              : '0 12px 35px rgba(76, 175, 80, 0.6)',
          }
        }}
      >
        <Add />
      </Fab>

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
        <MenuItem onClick={() => {
          handleOpenDialog(selectedTransactionForMenu);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          {t('transactionManager.edit')}
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedTransactionForMenu)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          {t('transactionManager.delete')}
        </MenuItem>
      </Menu>

      {/* Dialog d'ajout/édition */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
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
        <DialogTitle sx={{ 
          fontWeight: 700,
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          {editingTransaction ? t('transactionManager.editTransaction') : t('transactionManager.addTransaction')}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('transactionManager.description')}
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('transactionManager.amount')}
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('transactionManager.category')}</InputLabel>
                  <Select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    label={t('transactionManager.category')}
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: category.color,
                            mr: 1
                          }} />
                          {category.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('transactionManager.date')}
                  type="date"
                  value={newTransaction.date.toISOString().split('T')[0]}
                  onChange={(e) => setNewTransaction({ 
                    ...newTransaction, 
                    date: new Date(e.target.value) 
                  })}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              background: type === 'expenses'
                ? 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)'
                : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': {
                background: type === 'expenses'
                  ? 'linear-gradient(135deg, #FF5252 0%, #FF1744 100%)'
                  : 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
              }
            }}
          >
            {editingTransaction ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

TransactionManager.displayName = 'TransactionManager';

export default TransactionManager; 