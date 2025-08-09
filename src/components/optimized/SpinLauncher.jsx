import React, { useState, useEffect, memo } from 'react';
import { Box, IconButton, Badge, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress, Paper } from '@mui/material';
import { Casino } from '@mui/icons-material';
import { useStore } from '../../store';
import { gamificationService } from '../../services/gamificationService';

const SpinLauncher = memo(() => {
  const { user, gamification, setGamification, availableSpins, getCurrentPlan } = useStore();
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const state = await gamificationService.getState(user.id || user.userId || user.sub || user.email || '');
        if (mounted && state) setGamification(state);
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, [user, setGamification]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('open-spin', onOpen);
    return () => window.removeEventListener('open-spin', onOpen);
  }, []);

  const doSpin = async () => {
    if (!user || spinning || (availableSpins() <= 0)) return;
    setSpinning(true);
    setOutcome(null);
    try {
      const res = await gamificationService.spin(user.id || user.userId || user.sub || user.email || '');
      if (res?.gamification) setGamification(res.gamification);
      setOutcome(res?.outcome || null);
    } catch (e) {
      setOutcome({ kind: 'error', label: 'Spin indisponible' });
    } finally {
      setSpinning(false);
    }
  };

  const spinsCount = availableSpins();
  const plan = getCurrentPlan?.();
  const planHint = plan ? `Avantages ${plan.name}` : '';

  return (
    <>
      <Tooltip title={spinsCount > 0 ? `Spins disponibles: ${spinsCount}` : 'Pas de spin disponible'} arrow>
        <span>
          <IconButton
            disabled={spinsCount <= 0}
            onClick={() => setOpen(true)}
            sx={{
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': { background: 'rgba(255,255,255,0.2)', transform: 'scale(1.1)', transition: 'all 0.2s ease' }
            }}
          >
            <Badge color="secondary" badgeContent={spinsCount} overlap="circular">
              <Casino />
            </Badge>
          </IconButton>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { background: 'linear-gradient(135deg, #1a1f2b, #202a3b)', border: '1px solid rgba(255,255,255,0.15)' } }}>
        <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>Roulette d’épargne</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 280 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {planHint}
            </Typography>
            <Paper sx={{
              width: 220, height: 220, borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #394867, #1f2738)',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
              {spinning ? (
                <CircularProgress color="inherit" thickness={4} />
              ) : (
                <Typography variant="h6" sx={{ color: 'white' }}>{spinsCount} spin(s)</Typography>
              )}
            </Paper>
            {outcome && (
              <Typography variant="subtitle2" sx={{ color: 'white' }}>
                {outcome.label || 'Récompense obtenue !'} {outcome.bonusSpin ? '(+1 spin bonus)' : ''}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={spinning}>Fermer</Button>
          <Button onClick={doSpin} disabled={spinning || spinsCount <= 0} variant="contained">Tourner</Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

SpinLauncher.displayName = 'SpinLauncher';

export default SpinLauncher;


