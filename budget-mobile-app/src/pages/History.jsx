import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material';

const items = [
  { icon: '🍔', title: 'McD, Point Cook', date: '5 Jan 2021, Food', amount: '$5.00' },
  { icon: '🛒', title: 'Woolworths, Tarneit', date: '5 Jan 2021, Groceries', amount: '$65.00' }
];

const History = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Activité Récente
      </Typography>
      <Paper sx={{ mb: 3 }}>
        <List>
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>{item.icon}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={item.title} secondary={item.date} />
                <Typography variant="body2">{item.amount}</Typography>
              </ListItem>
              {idx < items.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Paper sx={{ mb: 3, p: 2, height: 200, bgcolor: 'grey.200' }} />

      <Paper sx={{ p: 2 }}>
        <List>
          <ListItem secondaryAction={<Typography>100 €</Typography>}>
            <ListItemText primary="Économies" />
          </ListItem>
          <Divider />
          <ListItem secondaryAction={<Typography>180 €</Typography>}>
            <ListItemText primary="Revenus" />
          </ListItem>
          <Divider />
          <ListItem secondaryAction={<Typography>120 €</Typography>}>
            <ListItemText primary="Dépenses" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default History; 