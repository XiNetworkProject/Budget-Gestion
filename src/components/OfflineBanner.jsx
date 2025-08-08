import React from 'react';
import { Box, Typography, Button, Slide } from '@mui/material';
import { CloudOff, Refresh } from '@mui/icons-material';
import { useStore } from '../store';

const OfflineBanner = () => {
  const { serverConnected, reloadBudgetData, checkAutoLogin } = useStore();

  const handleRetry = async () => {
    try {
      await checkAutoLogin?.();
      await reloadBudgetData?.();
    } catch (_) {}
  };

  return (
    <Slide in={!serverConnected} direction="down" mountOnEnter unmountOnExit>
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        bgcolor: 'rgba(255,255,255,0.12)',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(12px)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudOff sx={{ color: '#ffb74d' }} />
          <Typography variant="body2" sx={{ color: 'white' }}>
            Mode hors ligne. Les modifications seront synchronisées dès que possible.
          </Typography>
        </Box>
        <Button size="small" variant="outlined" onClick={handleRetry} startIcon={<Refresh />} sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
          Réessayer
        </Button>
      </Box>
    </Slide>
  );
};

export default OfflineBanner;


