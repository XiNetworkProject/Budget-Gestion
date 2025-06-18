import React from 'react';
import { useStore } from '../store';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const Expenses = () => {
  const { months, categories, data } = useStore();
  const idx = months.length - 1;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Dépenses
      </Typography>
      <Paper>
        <List>
          {categories.map((cat, index) => (
            <React.Fragment key={cat}>
              <ListItem>
                <ListItemText primary={cat} />
                <Typography>{(data[cat]?.[idx] || 0).toLocaleString()} €</Typography>
              </ListItem>
              {index < categories.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Expenses; 