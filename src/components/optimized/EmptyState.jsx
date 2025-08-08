import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <Box sx={{
    p: 3,
    textAlign: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 3,
    backdropFilter: 'blur(12px)'
  }}>
    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>{title}</Typography>
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>{description}</Typography>
    {onAction && (
      <Button variant="contained" onClick={onAction}>{actionLabel}</Button>
    )}
  </Box>
);

export default EmptyState;


