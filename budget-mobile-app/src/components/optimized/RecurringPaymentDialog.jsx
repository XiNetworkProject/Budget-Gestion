import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Divider
} from '@mui/material';
import {
  Close,
  Schedule,
  Notifications,
  CalendarToday,
  TrendingUp,
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { addDays, addMonths, addYears, format, isBefore, isAfter } from 'date-fns';

// Composants optimisés
import ErrorBoundary from './ErrorBoundary';

// Configuration
import { PERFORMANCE_CONFIG } from '../../config/performance';

const RecurringPaymentDialog = React.memo(({
  open,
  onClose,
  onSave,
  payment = null, // null pour nouveau, objet pour édition
  categories = [],
  incomeTypes = []
}) => {
  const { t } = useTranslation();
  
  // État local optimisé
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense', // 'expense' ou 'income'
    recurringType: 'monthly',
    recurringEndDate: null,
    nextDueDate: new Date(),
    priority: 'medium',
    autoRenew: true,
    reminderEnabled: true,
    reminderDays: 3,
    accountId: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (payment) {
      setFormData({
        description: payment.description || '',
        amount: payment.amount?.toString() || '',
        category: payment.category || '',
        type: payment.type || 'expense',
        recurringType: payment.recurringType || 'monthly',
        recurringEndDate: payment.recurringEndDate ? new Date(payment.recurringEndDate) : null,
        nextDueDate: payment.nextDueDate ? new Date(payment.nextDueDate) : new Date(),
        priority: payment.priority || 'medium',
        autoRenew: payment.autoRenew !== false,
        reminderEnabled: payment.reminderEnabled !== false,
        reminderDays: payment.reminderDays || 3,
        accountId: payment.accountId || null
      });
    } else {
      // Réinitialiser pour un nouveau paiement
      setFormData({
        description: '',
        amount: '',
        category: '',
        type: 'expense',
        recurringType: 'monthly',
        recurringEndDate: null,
        nextDueDate: new Date(),
        priority: 'medium',
        autoRenew: true,
        reminderEnabled: true,
        reminderDays: 3,
        accountId: null
      });
    }
    setErrors({});
  }, [payment, open]);

  // Options de récurrence
  const recurringOptions = useMemo(() => [
    { value: 'weekly', label: t('recurringPayment.weekly'), icon: '📅' },
    { value: 'monthly', label: t('recurringPayment.monthly'), icon: '📅' },
    { value: 'yearly', label: t('recurringPayment.yearly'), icon: '📅' },
    { value: 'custom', label: t('recurringPayment.custom'), icon: '⚙️' }
  ], [t]);

  // Options de priorité
  const priorityOptions = useMemo(() => [
    { value: 'low', label: t('recurringPayment.priority.low'), color: '#4caf50', icon: CheckCircle },
    { value: 'medium', label: t('recurringPayment.priority.medium'), color: '#2196f3', icon: Schedule },
    { value: 'high', label: t('recurringPayment.priority.high'), color: '#ff9800', icon: Warning },
    { value: 'critical', label: t('recurringPayment.priority.critical'), color: '#f44336', icon: Error }
  ], [t]);

  // Options de rappel
  const reminderOptions = useMemo(() => [
    { value: 1, label: t('recurringPayment.reminder.1day') },
    { value: 3, label: t('recurringPayment.reminder.3days') },
    { value: 7, label: t('recurringPayment.reminder.1week') },
    { value: 14, label: t('recurringPayment.reminder.2weeks') }
  ], [t]);

  // Calculer la prochaine date automatiquement
  const calculateNextDueDate = useCallback((baseDate, type) => {
    const date = new Date(baseDate);
    switch (type) {
      case 'weekly':
        return addDays(date, 7);
      case 'monthly':
        return addMonths(date, 1);
      case 'yearly':
        return addYears(date, 1);
      default:
        return date;
    }
  }, []);

  // Validation du formulaire
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = t('recurringPayment.errors.descriptionRequired');
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('recurringPayment.errors.amountRequired');
    }

    if (!formData.category) {
      newErrors.category = t('recurringPayment.errors.categoryRequired');
    }

    if (!formData.nextDueDate) {
      newErrors.nextDueDate = t('recurringPayment.errors.dateRequired');
    }

    if (formData.recurringEndDate && isBefore(formData.recurringEndDate, formData.nextDueDate)) {
      newErrors.recurringEndDate = t('recurringPayment.errors.endDateAfterStart');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Gestionnaire de soumission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const paymentData = {
        id: payment?.id,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        recurring: true,
        recurringType: formData.recurringType,
        recurringEndDate: formData.recurringEndDate?.toISOString(),
        nextDueDate: formData.nextDueDate.toISOString(),
        priority: formData.priority,
        autoRenew: formData.autoRenew,
        reminderEnabled: formData.reminderEnabled,
        reminderDays: formData.reminderDays,
        accountId: formData.accountId,
        createdAt: payment?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(paymentData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ submit: t('recurringPayment.errors.saveFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestionnaire de changement de récurrence
  const handleRecurringTypeChange = (newType) => {
    setFormData(prev => ({
      ...prev,
      recurringType: newType,
      nextDueDate: calculateNextDueDate(prev.nextDueDate, newType)
    }));
  };

  // Gestionnaire de changement de date
  const handleDateChange = (field, date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // Rendu des options de catégorie selon le type
  const categoryOptions = formData.type === 'expense' ? categories : incomeTypes;

  return (
    <ErrorBoundary>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule sx={{ color: '#4caf50' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {payment ? t('recurringPayment.editTitle') : t('recurringPayment.addTitle')}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Informations de base */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#4caf50' }}>
                {t('recurringPayment.basicInfo')}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('recurringPayment.description')}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                error={!!errors.description}
                helperText={errors.description}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#4caf50' }
                  },
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('recurringPayment.amount')}
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{
                  endAdornment: <Typography sx={{ color: '#ccc' }}>€</Typography>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#4caf50' }
                  },
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel sx={{ color: '#ccc' }}>{t('recurringPayment.type')}</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    type: e.target.value,
                    category: '' // Réinitialiser la catégorie
                  }))}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                    '& .MuiSelect-icon': { color: '#ccc' },
                    '& .MuiSelect-select': { color: 'white' }
                  }}
                >
                  <MenuItem value="expense">{t('recurringPayment.expense')}</MenuItem>
                  <MenuItem value="income">{t('recurringPayment.income')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel sx={{ color: '#ccc' }}>{t('recurringPayment.category')}</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                    '& .MuiSelect-icon': { color: '#ccc' },
                    '& .MuiSelect-select': { color: 'white' }
                  }}
                >
                  {categoryOptions.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
            </Grid>

            {/* Configuration de récurrence */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#4caf50' }}>
                {t('recurringPayment.recurrenceConfig')}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ccc' }}>{t('recurringPayment.recurringType')}</InputLabel>
                <Select
                  value={formData.recurringType}
                  onChange={(e) => handleRecurringTypeChange(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                    '& .MuiSelect-icon': { color: '#ccc' },
                    '& .MuiSelect-select': { color: 'white' }
                  }}
                >
                  {recurringOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{option.icon}</span>
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ccc' }}>{t('recurringPayment.priority')}</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                    '& .MuiSelect-icon': { color: '#ccc' },
                    '& .MuiSelect-select': { color: 'white' }
                  }}
                >
                  {priorityOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconComponent sx={{ color: option.color, fontSize: 16 }} />
                          <Typography sx={{ color: option.color }}>
                            {option.label}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label={t('recurringPayment.nextDueDate')}
                  value={formData.nextDueDate}
                  onChange={(date) => handleDateChange('nextDueDate', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.nextDueDate}
                      helperText={errors.nextDueDate}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: '#4caf50' }
                        },
                        '& .MuiInputLabel-root': { color: '#ccc' },
                        '& .MuiInputBase-input': { color: 'white' }
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label={t('recurringPayment.recurringEndDate')}
                  value={formData.recurringEndDate}
                  onChange={(date) => handleDateChange('recurringEndDate', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.recurringEndDate}
                      helperText={errors.recurringEndDate || t('recurringPayment.optional')}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: '#4caf50' }
                        },
                        '& .MuiInputLabel-root': { color: '#ccc' },
                        '& .MuiInputBase-input': { color: 'white' }
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
            </Grid>

            {/* Options avancées */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#4caf50' }}>
                {t('recurringPayment.advancedOptions')}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoRenew}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoRenew: e.target.checked }))}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': { backgroundColor: 'rgba(76,175,80,0.1)' }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                }
                label={t('recurringPayment.autoRenew')}
                sx={{ color: 'white' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.reminderEnabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderEnabled: e.target.checked }))}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': { backgroundColor: 'rgba(76,175,80,0.1)' }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                }
                label={t('recurringPayment.reminderEnabled')}
                sx={{ color: 'white' }}
              />
            </Grid>

            {formData.reminderEnabled && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#ccc' }}>{t('recurringPayment.reminderDays')}</InputLabel>
                  <Select
                    value={formData.reminderDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderDays: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                      '& .MuiSelect-icon': { color: '#ccc' },
                      '& .MuiSelect-select': { color: 'white' }
                    }}
                  >
                    {reminderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          gap: 1
        }}>
          <Button 
            onClick={onClose}
            sx={{ 
              color: '#ccc',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)' },
              '&:disabled': { background: 'rgba(255,255,255,0.1)' }
            }}
          >
            {isSubmitting ? t('common.saving') : (payment ? t('common.update') : t('common.save'))}
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  );
});

export default RecurringPaymentDialog; 