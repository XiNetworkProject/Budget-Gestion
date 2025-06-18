import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Switch } from '@mui/material';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Paramètres
      </Typography>
      <Paper>
        <List>
          <ListItem>
            <ListItemText primary="Mode sombre" />
            <Switch checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Notifications" />
            <Switch checked={notifications} onChange={e => setNotifications(e.target.checked)} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Langue" secondary="Français" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Version" secondary="1.0.0" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Settings; 