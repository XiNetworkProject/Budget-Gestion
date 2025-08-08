import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Box, Badge } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingDown, TrendingUp, AccountBalance, Analytics, Settings } from '@mui/icons-material';
import { useStore } from '../store';

const NAV_WIDTH = 76; // rail compact

const items = [
  { to: '/home', label: 'Accueil', icon: Home },
  { to: '/expenses', label: 'Dépenses', icon: TrendingDown },
  { to: '/income', label: 'Revenus', icon: TrendingUp },
  { to: '/savings', label: 'Épargne', icon: AccountBalance },
  { to: '/analytics', label: 'Analytics', icon: Analytics },
  { to: '/settings', label: 'Paramètres', icon: Settings },
];

const SideRail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showUpdateDialog } = useStore();

  return (
    <Drawer
      variant="permanent"
      PaperProps={{
        sx: {
          width: NAV_WIDTH,
          borderRight: '1px solid rgba(255,255,255,0.12)',
          bgcolor: 'rgba(20,20,30,0.96)',
          backdropFilter: 'blur(18px)'
        },
      }}
    >
      <Box sx={{ height: 8 }} />
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {items.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (to === '/home' && location.pathname === '/');
          const withBadge = to === '/settings' && !!showUpdateDialog;
          const iconEl = (
            <Icon sx={{ color: active ? '#00e1d6' : 'rgba(255,255,255,0.8)' }} />
          );
          return (
            <Tooltip title={label} placement="right" arrow key={to}>
              <ListItemButton
                onClick={() => navigate(to)}
                selected={active}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {withBadge ? (
                    <Badge variant="dot" color="secondary" overlap="circular">
                      {iconEl}
                    </Badge>
                  ) : iconEl}
                </ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ sx: { display: 'none' } }} />
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Drawer>
  );
};

export { NAV_WIDTH };
export default SideRail;


