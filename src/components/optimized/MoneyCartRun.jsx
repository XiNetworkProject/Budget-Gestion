import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Chip, LinearProgress } from '@mui/material';
import { Savings, Bolt, Brush, Shield, Casino } from '@mui/icons-material';

const symbolMap = {
  saver: { icon: <Savings sx={{ color: '#4caf50' }} />, color: '#4caf50', label: 'Épargneur' },
  optimizer: { icon: <Bolt sx={{ color: '#ffb300' }} />, color: '#ffb300', label: 'Optimiseur' },
  collector: { icon: <Brush sx={{ color: '#80cbc4' }} />, color: '#80cbc4', label: 'Collecteur' },
  defender: { icon: <Shield sx={{ color: '#90caf9' }} />, color: '#90caf9', label: 'Défenseur' },
  bonusSpin: { icon: <Casino sx={{ color: '#e91e63' }} />, color: '#e91e63', label: 'Bonus spin' },
};

const Tile = memo(({ active, symbol }) => {
  const meta = symbolMap[symbol] || {};
  return (
    <Box
      sx={{
        height: 64,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: active ? `0 6px 18px ${meta.color || 'rgba(0,0,0,0.2)'}40` : 'none',
        transition: 'all 250ms ease',
      }}
    >
      {meta.icon || null}
    </Box>
  );
});

Tile.displayName = 'Tile';

const MoneyCartRun = memo(({ open, onClose, run }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [bonusSpin, setBonusSpin] = useState(false);
  const timerRef = useRef(null);

  const events = run?.events || [];
  const totalSteps = events.length || 0;

  const grid = useMemo(() => {
    // 3x4 grid de base
    const rows = 3, cols = 4;
    const cells = Array.from({ length: rows * cols }, (_, i) => ({ idx: i, symbol: null, active: false }));
    return { rows, cols, cells };
  }, []);

  useEffect(() => {
    if (!open) return;
    // Reset
    setStepIndex(0);
    setCurrentMultiplier(1);
    setTotalPoints(0);
    setBonusSpin(false);

    // Lecture animée des événements
    const play = () => {
      if (stepIndex >= totalSteps) return;
      const ev = events[stepIndex];
      // logiques UI
      if (ev.symbol === 'saver' && ev.gain) {
        setTotalPoints((p) => p + ev.gain);
      }
      if (ev.symbol === 'optimizer' && ev.multiplier) {
        setCurrentMultiplier(ev.multiplier);
      }
      if (ev.symbol === 'bonusSpin' && ev.bonus) {
        setBonusSpin(true);
      }
      // Avancer
      timerRef.current = setTimeout(() => setStepIndex((i) => i + 1), 700);
    };
    play();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [open, stepIndex, totalSteps, events]);

  const tiles = useMemo(() => {
    // placer l’événement courant au centre, le reste inactif
    const cells = grid.cells.map((c) => ({ ...c, active: false, symbol: null }));
    const centerIdx = Math.floor(cells.length / 2);
    const ev = events[stepIndex] || null;
    if (ev) {
      cells[centerIdx] = { ...cells[centerIdx], active: true, symbol: ev.symbol };
    }
    return cells;
  }, [grid.cells, events, stepIndex]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Run Money Cart</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip size="small" label={`x${currentMultiplier}`} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
          <Chip size="small" label={`${totalPoints} pts`} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
          {bonusSpin && <Chip size="small" label={'+1 spin'} sx={{ bgcolor: 'rgba(233,30,99,0.25)', color: 'white' }} />}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={totalSteps ? (stepIndex / totalSteps) * 100 : 0} />
        </Box>

        <Grid container spacing={1.25} columns={4}>
          {tiles.map((t) => (
            <Grid item xs={1} key={t.idx}>
              <Tile active={t.active} symbol={t.symbol} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(symbolMap).map(([key, meta]) => (
            <Chip key={key} icon={meta.icon} label={meta.label} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white' }} />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
});

MoneyCartRun.displayName = 'MoneyCartRun';

export default MoneyCartRun;


