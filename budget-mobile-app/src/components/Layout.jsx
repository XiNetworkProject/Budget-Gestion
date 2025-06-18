import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // map path to nav value
  const paths = ['/home', '/analytics', '/quickadd', '/history', '/settings'];
  const [value, setValue] = useState(paths.indexOf(location.pathname) !== -1 ? paths.indexOf(location.pathname) : 0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const path = paths[newValue];
    navigate(path);
  };

  return (
    <Box sx={{ pb: 7 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Budget Gestion
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>

      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigationAction label="Accueil" icon={<HomeIcon />} />
        <BottomNavigationAction label="Analytics" icon={<BarChartIcon />} />
        <BottomNavigationAction label="Ajouter" icon={<AddCircleIcon />} />
        <BottomNavigationAction label="Historique" icon={<HistoryIcon />} />
        <BottomNavigationAction label="Paramètres" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Box>
  );
};

export default Layout; 