import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Chip, LinearProgress, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import { Savings, Bolt, Brush, Shield, Casino, PlayArrow, Pause, Replay } from '@mui/icons-material';

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
        height: 72,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: active ? `0 10px 28px ${meta.color || 'rgba(0,0,0,0.3)'}40` : 'none',
        transition: 'all 260ms ease',
        position: 'relative',
        overflow: 'hidden',
        '&::after': active ? {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(60% 60% at 50% 50%, ${(meta.color || '#fff')}22, transparent 60%)`
        } : {}
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState('normal'); // 'slow' | 'normal' | 'fast'
  const [flickerSymbol, setFlickerSymbol] = useState(null);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);
  const flickerRef = useRef(null);

  const events = run?.events || [];
  const totalSteps = events.length || 0;

  const grid = useMemo(() => {
    const rows = 3, cols = 4;
    const cells = Array.from({ length: rows * cols }, (_, i) => ({ idx: i, symbol: null, active: false }));
    return { rows, cols, cells };
  }, []);

  const reset = () => {
    setStepIndex(0);
    setCurrentMultiplier(1);
    setTotalPoints(0);
    setBonusSpin(false);
    setFinished(false);
    setIsPlaying(true);
  };

  const stepDuration = speed === 'slow' ? 1600 : speed === 'fast' ? 700 : 1100;
  const flickerInterval = speed === 'slow' ? 150 : speed === 'fast' ? 70 : 100;

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open]);

  useEffect(() => {
    if (!open || !isPlaying || finished) return;
    if (stepIndex >= totalSteps) {
      setFinished(true);
      return;
    }
    const ev = events[stepIndex];
    // Pré-animation: flicker symbol
    const symbols = Object.keys(symbolMap);
    flickerRef.current = setInterval(() => {
      const r = Math.floor(Math.random() * symbols.length);
      setFlickerSymbol(symbols[r]);
    }, flickerInterval);
    timerRef.current = setTimeout(() => {
      // Fin flicker
      if (flickerRef.current) clearInterval(flickerRef.current);
      setFlickerSymbol(null);
      // Appliquer effet
      if (ev.symbol === 'saver' && ev.gain) setTotalPoints((p) => p + ev.gain);
      if (ev.symbol === 'optimizer' && ev.multiplier) setCurrentMultiplier(ev.multiplier);
      if (ev.symbol === 'bonusSpin' && ev.bonus) setBonusSpin(true);
      setStepIndex((i) => i + 1);
    }, stepDuration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (flickerRef.current) clearInterval(flickerRef.current);
    };
  }, [open, isPlaying, finished, stepIndex, totalSteps, speed]);

  const tiles = useMemo(() => {
    const cells = grid.cells.map((c) => ({ ...c, active: false, symbol: null }));
    const centerIdx = Math.floor(cells.length / 2);
    const ev = events[stepIndex] || null;
    const sym = flickerSymbol || ev?.symbol || null;
    if (sym) {
      cells[centerIdx] = { ...cells[centerIdx], active: true, symbol: sym };
    }
    return cells;
  }, [grid.cells, events, stepIndex, flickerSymbol]);

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
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <LinearProgress variant="determinate" value={totalSteps ? (stepIndex / totalSteps) * 100 : 0} sx={{ flex: 1 }} />
          <ToggleButtonGroup size="small" value={speed} exclusive onChange={(e, val) => val && setSpeed(val)}>
            <ToggleButton value="slow">Lent</ToggleButton>
            <ToggleButton value="normal">Normal</ToggleButton>
            <ToggleButton value="fast">Rapide</ToggleButton>
          </ToggleButtonGroup>
          <Button onClick={() => setIsPlaying((p) => !p)} size="small" startIcon={isPlaying ? <Pause /> : <PlayArrow />}>{isPlaying ? 'Pause' : 'Play'}</Button>
          <Button onClick={reset} size="small" startIcon={<Replay />}>Relancer</Button>
        </Box>

        <Grid container spacing={1.25} columns={4}
          sx={{
            p: 1.25,
            borderRadius: 2,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
            border: '1px solid rgba(255,255,255,0.12)'
          }}
        >
          {tiles.map((t) => (
            <Grid item xs={1} key={t.idx}>
              <Tile active={t.active} symbol={t.symbol} />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2, opacity: 0.2 }} />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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


