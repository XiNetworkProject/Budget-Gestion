import React from 'react';
import { useStore } from '../store';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Avatar, Grid, Paper } from '@mui/material';

const Home = () => {
  const { user, months, revenus, data, sideByMonth, budgetLimits } = useStore();
  const idx = months.length - 1;
  const income = revenus[idx] || 0;
  const expense = Object.values(data).reduce((sum, arr) => sum + (arr[idx] || 0), 0);
  const saved = sideByMonth[idx] || 0;
  const upcoming = Object.values(budgetLimits).reduce((sum, val) => sum + val, 0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Bonjour{user?.name ? `, ${user.name}` : ''}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, fontSize: '1.5rem' }}>
          {saved}€
        </Avatar>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper
            component={RouterLink}
            to="/income"
            elevation={3}
            sx={{ p: 2, textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <Typography variant="subtitle1">Revenus</Typography>
            <Typography variant="h6">{income}€</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper
            component={RouterLink}
            to="/expenses"
            elevation={3}
            sx={{ p: 2, textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <Typography variant="subtitle1">Dépenses</Typography>
            <Typography variant="h6">{expense}€</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper
            component={RouterLink}
            to="/savings"
            elevation={3}
            sx={{ p: 2, textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <Typography variant="subtitle1">Économies</Typography>
            <Typography variant="h6">{saved}€</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper
            component={RouterLink}
            to="/debts"
            elevation={3}
            sx={{ p: 2, textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <Typography variant="subtitle1">Factures</Typography>
            <Typography variant="h6">{upcoming}€</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home; 