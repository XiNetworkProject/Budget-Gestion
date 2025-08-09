import React from 'react';
import { Box, Dialog, DialogContent, Typography, Button } from '@mui/material';
import { useStore } from '../../store';

const SpinWheel = ({ open, onClose, onResult }) => {
  const { gamification, consumeSpinAndRoll } = useStore();
  const spins = gamification?.spins || 0;

  const handleSpin = () => {
    const outcome = consumeSpinAndRoll();
    if (outcome && onResult) onResult(outcome);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Roulette d’épargne</Typography>
        <Box sx={{ height: 160, borderRadius: 2, background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))', border: '1px solid rgba(255,255,255,0.15)', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>Animation roue (à venir)</Typography>
        </Box>
        <Button variant="contained" disabled={spins <= 0} onClick={handleSpin}>
          {spins > 0 ? `Tourner (${spins})` : 'Aucun spin'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SpinWheel;


