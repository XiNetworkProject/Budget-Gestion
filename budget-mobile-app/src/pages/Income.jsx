import React from 'react';
import { useStore } from '../store';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const Income = () => {
  const { months, incomeTypes, incomes } = useStore();
  const idx = months.length - 1;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Revenus
      </Typography>
      <Paper>
        <List>
          {incomeTypes.map((type, index) => (
            <React.Fragment key={type}>
              <ListItem>
                <ListItemText primary={type} />
                <Typography>{(incomes[type]?.[idx] || 0).toLocaleString()} €</Typography>
              </ListItem>
              {index < incomeTypes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Income; 