import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Checkbox,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
  Archive,
  ContentCopy,
  Settings,
  TrendingUp,
  TrendingDown,
  Savings
} from '@mui/icons-material';
import { useStore } from '../store';

// Fonction pour obtenir le mois actuel au format YYYY-MM
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const MonthSelector = () => {
  const {
    currentMonth,
    months,
    categories,
    incomeTypes,
    setCurrentMonth,
    getMonthStats,
    copyMonthToNext,
    archiveMonth,
    generateNextMonth
  } = useStore();

  const [anchorEl, setAnchorEl] = useState(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyOptions, setCopyOptions] = useState({
    categories: 'all',
    incomes: 'all',
    revenus: true,
    sideByMonth: true
  });

  const currentStats = getMonthStats(currentMonth);
  const isCurrentMonth = currentStats.isCurrentMonth;
  const isPastMonth = currentStats.isPastMonth;

  const handleMonthChange = (month) => {
    setCurrentMonth(month);
    setAnchorEl(null);
  };

  const handleCopyToNext = () => {
    copyMonthToNext(currentMonth, copyOptions);
    setCopyDialogOpen(false);
  };

  const handleGenerateNext = () => {
    generateNextMonth(copyOptions);
    setCopyDialogOpen(false);
  };

  const handleArchive = () => {
    archiveMonth(currentMonth);
  };

  const getMonthDisplayName = (month) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    const monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    return `${monthNames[date.getMonth()]} ${year}`;
  };

  return (
    <Box>
      {/* Sélecteur de mois principal */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => {
                const prevMonth = months[Math.max(0, months.indexOf(currentMonth) - 1)];
                if (prevMonth) setCurrentMonth(prevMonth);
              }}
              disabled={months.indexOf(currentMonth) === 0}
            >
              <ChevronLeft />
            </IconButton>
            
            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              startIcon={<CalendarMonth />}
              variant="outlined"
              sx={{ minWidth: 150 }}
            >
              {getMonthDisplayName(currentMonth)}
            </Button>
            
            <IconButton
              onClick={() => {
                const nextMonth = months[Math.min(months.length - 1, months.indexOf(currentMonth) + 1)];
                if (nextMonth) setCurrentMonth(nextMonth);
              }}
              disabled={months.indexOf(currentMonth) === months.length - 1}
            >
              <ChevronRight />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {isCurrentMonth && (
              <Button
                size="small"
                startIcon={<ContentCopy />}
                onClick={() => setCopyDialogOpen(true)}
                variant="outlined"
              >
                Copier
              </Button>
            )}
            
            {isPastMonth && (
              <Button
                size="small"
                startIcon={<Archive />}
                onClick={handleArchive}
                variant="outlined"
                color="secondary"
              >
                Archiver
              </Button>
            )}
          </Box>
        </Box>

        {/* Statistiques rapides du mois */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<TrendingUp />}
            label={`Revenus: ${currentStats.totalIncomes.toLocaleString()}€`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<TrendingDown />}
            label={`Dépenses: ${currentStats.totalExpenses.toLocaleString()}€`}
            color="error"
            variant="outlined"
          />
          <Chip
            icon={<Savings />}
            label={`Solde: ${currentStats.balance.toLocaleString()}€`}
            color={currentStats.balance >= 0 ? "success" : "error"}
            variant="outlined"
          />
          {currentStats.savingsRate > 0 && (
            <Chip
              label={`Épargne: ${currentStats.savingsRate.toFixed(1)}%`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {/* Menu de sélection de mois */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { maxHeight: 400, width: 200 }
        }}
      >
        {months.map((month) => (
          <MenuItem
            key={month}
            onClick={() => handleMonthChange(month)}
            selected={month === currentMonth}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography>{getMonthDisplayName(month)}</Typography>
            {month === getCurrentMonth() && (
              <Chip label="Actuel" size="small" color="primary" />
            )}
          </MenuItem>
        ))}
      </Menu>

      {/* Dialog de copie vers le mois suivant */}
      <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Copier vers le mois suivant</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choisissez ce que vous voulez réutiliser pour le mois suivant :
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <Typography variant="subtitle2" gutterBottom>
              Catégories de dépenses
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={copyOptions.categories === 'all'}
                  onChange={(e) => setCopyOptions({
                    ...copyOptions,
                    categories: e.target.checked ? 'all' : []
                  })}
                />
              }
              label="Toutes les catégories"
            />
            {copyOptions.categories !== 'all' && (
              <Box sx={{ ml: 2 }}>
                {categories.map((cat) => (
                  <FormControlLabel
                    key={cat}
                    control={
                      <Checkbox
                        checked={copyOptions.categories?.includes(cat)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...(copyOptions.categories || []), cat]
                            : copyOptions.categories?.filter(c => c !== cat) || [];
                          setCopyOptions({
                            ...copyOptions,
                            categories: newCategories
                          });
                        }}
                      />
                    }
                    label={cat}
                  />
                ))}
              </Box>
            )}
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FormControl component="fieldset" fullWidth>
            <Typography variant="subtitle2" gutterBottom>
              Types de revenus
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={copyOptions.incomes === 'all'}
                  onChange={(e) => setCopyOptions({
                    ...copyOptions,
                    incomes: e.target.checked ? 'all' : []
                  })}
                />
              }
              label="Tous les revenus"
            />
            {copyOptions.incomes !== 'all' && (
              <Box sx={{ ml: 2 }}>
                {incomeTypes.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={copyOptions.incomes?.includes(type)}
                        onChange={(e) => {
                          const newIncomes = e.target.checked
                            ? [...(copyOptions.incomes || []), type]
                            : copyOptions.incomes?.filter(t => t !== type) || [];
                          setCopyOptions({
                            ...copyOptions,
                            incomes: newIncomes
                          });
                        }}
                      />
                    }
                    label={type}
                  />
                ))}
              </Box>
            )}
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={copyOptions.revenus}
                onChange={(e) => setCopyOptions({
                  ...copyOptions,
                  revenus: e.target.checked
                })}
              />
            }
            label="Revenu total"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={copyOptions.sideByMonth}
                onChange={(e) => setCopyOptions({
                  ...copyOptions,
                  sideByMonth: e.target.checked
                })}
              />
            }
            label="Mise de côté"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleCopyToNext} variant="contained">
            Copier
          </Button>
          <Button onClick={handleGenerateNext} variant="contained" color="primary">
            Générer le mois suivant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MonthSelector; 