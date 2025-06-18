import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const Bank = () => {
  const [accounts] = useState([
    { name: 'Compte courant', balance: 1250.00 },
    { name: 'Épargne', balance: 5300.50 },
    { name: 'Carte de crédit', balance: -250.75 }
  ]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Banque
      </Typography>
      <Paper>
        <List>
          {accounts.map((acc, idx) => (
            <React.Fragment key={acc.name}>
              <ListItem>
                <ListItemText primary={acc.name} />
                <Typography>{acc.balance.toFixed(2)} €</Typography>
              </ListItem>
              {idx < accounts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Bank; 