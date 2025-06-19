import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Archive,
  TrendingUp,
  TrendingDown,
  Savings,
  Visibility,
  CalendarMonth,
  Euro,
  Category,
  AccountBalance
} from '@mui/icons-material';
import { useStore } from '../store';
import { Line } from 'react-chartjs-2';

const Archives = () => {
  const { getArchives, getMonthStats, months } = useStore();
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const archives = getArchives();
  const archivedMonths = Object.keys(archives).sort().reverse();

  const handleViewDetails = (month) => {
    setSelectedArchive(archives[month]);
    setDetailDialogOpen(true);
  };

  const getMonthDisplayName = (month) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${monthNames[date.getMonth()]} ${year}`;
  };

  const getStatusColor = (balance) => {
    if (balance > 0) return 'success';
    if (balance < 0) return 'error';
    return 'default';
  };

  const getStatusText = (balance) => {
    if (balance > 0) return 'Excédent';
    if (balance < 0) return 'Déficit';
    return 'Équilibré';
  };

  // Données pour le graphique d'évolution
  const chartData = {
    labels: archivedMonths.slice(-6).map(month => getMonthDisplayName(month)),
    datasets: [
      {
        label: 'Revenus',
        data: archivedMonths.slice(-6).map(month => archives[month]?.totalIncomes || 0),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4
      },
      {
        label: 'Dépenses',
        data: archivedMonths.slice(-6).map(month => archives[month]?.totalExpenses || 0),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4
      },
      {
        label: 'Solde',
        data: archivedMonths.slice(-6).map(month => archives[month]?.balance || 0),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution sur 6 mois'
      }
    },
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Archives des mois passés
      </Typography>

      {/* Graphique d'évolution */}
      {archivedMonths.length >= 2 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Évolution des finances
          </Typography>
          <Box sx={{ height: 300 }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Paper>
      )}

      {/* Statistiques globales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">Total Revenus</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {Object.values(archives).reduce((sum, archive) => sum + (archive.totalIncomes || 0), 0).toLocaleString()}€
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDown sx={{ mr: 1 }} />
                <Typography variant="h6">Total Dépenses</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {Object.values(archives).reduce((sum, archive) => sum + (archive.totalExpenses || 0), 0).toLocaleString()}€
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Savings sx={{ mr: 1 }} />
                <Typography variant="h6">Total Épargne</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {Object.values(archives).reduce((sum, archive) => sum + (archive.balance || 0), 0).toLocaleString()}€
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Archive sx={{ mr: 1 }} />
                <Typography variant="h6">Mois Archivés</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {archivedMonths.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des archives */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Historique des mois ({archivedMonths.length} mois)
          </Typography>
        </Box>
        
        {archivedMonths.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Archive sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun mois archivé
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Les mois passés apparaîtront ici une fois archivés
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mois</TableCell>
                  <TableCell align="right">Revenus</TableCell>
                  <TableCell align="right">Dépenses</TableCell>
                  <TableCell align="right">Solde</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {archivedMonths.map((month) => {
                  const archive = archives[month];
                  const balance = archive.balance || 0;
                  
                  return (
                    <TableRow key={month} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />
                          {getMonthDisplayName(month)}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                          {archive.totalIncomes?.toLocaleString()}€
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <TrendingDown sx={{ mr: 1, color: 'error.main' }} />
                          {archive.totalExpenses?.toLocaleString()}€
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Savings sx={{ mr: 1, color: getStatusColor(balance) === 'success' ? 'success.main' : 'error.main' }} />
                          {balance.toLocaleString()}€
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusText(balance)}
                          color={getStatusColor(balance)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Voir les détails">
                          <IconButton
                            onClick={() => handleViewDetails(month)}
                            color="primary"
                            size="small"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog de détails */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Détails de {selectedArchive && getMonthDisplayName(selectedArchive.month)}
        </DialogTitle>
        <DialogContent>
          {selectedArchive && (
            <Box>
              {/* Statistiques générales */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      {selectedArchive.totalIncomes?.toLocaleString()}€
                    </Typography>
                    <Typography variant="body2">Revenus totaux</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="error.main">
                      {selectedArchive.totalExpenses?.toLocaleString()}€
                    </Typography>
                    <Typography variant="body2">Dépenses totales</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Détails des catégories */}
              <Typography variant="h6" gutterBottom>
                Détail par catégorie
              </Typography>
              <List>
                {Object.entries(selectedArchive.categories || {}).map(([category, amount]) => (
                  <ListItem key={category}>
                    <ListItemIcon>
                      <Category />
                    </ListItemIcon>
                    <ListItemText primary={category} />
                    <Typography variant="body2" color="error.main">
                      {amount.toLocaleString()}€
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Détails des revenus */}
              <Typography variant="h6" gutterBottom>
                Détail des revenus
              </Typography>
              <List>
                {Object.entries(selectedArchive.incomes || {}).map(([type, amount]) => (
                  <ListItem key={type}>
                    <ListItemIcon>
                      <AccountBalance />
                    </ListItemIcon>
                    <ListItemText primary={type} />
                    <Typography variant="body2" color="success.main">
                      {amount.toLocaleString()}€
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Informations d'archivage */}
              <Typography variant="body2" color="text.secondary">
                Archivé le : {new Date(selectedArchive.archivedAt).toLocaleDateString('fr-FR')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Archives; 