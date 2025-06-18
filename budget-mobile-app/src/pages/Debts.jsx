import React from 'react';
import { useStore } from '../store';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const Debts = () => {
  const { months, budgetLimits } = useStore();
  const idx = months.length - 1;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Factures
      </Typography>
      <Paper>
        <List>
          {Object.entries(budgetLimits).map(([cat, limit], index, arr) => (
            <React.Fragment key={cat}>
              <ListItem>
                <ListItemText primary={cat} />
                <Typography>{(limit || 0).toLocaleString()} €</Typography>
              </ListItem>
              {index < arr.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Debts; 