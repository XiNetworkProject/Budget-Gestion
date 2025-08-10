import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Chip, LinearProgress, ToggleButtonGroup, ToggleButton, Divider, Stack, Avatar } from '@mui/material';
import { Savings, Bolt, Brush, Shield, Casino, PlayArrow, Pause, Replay } from '@mui/icons-material';
import { resolveThemeFromCosmetics } from '../../ui/theme';

const symbolMap = {
  saver: { icon: <Box component="img" src="/images/game/symbol-saver.svg" alt="saver" sx={{ width: 36, height: 36 }} />, color: '#4caf50', label: 'Épargneur' },
  optimizer: { icon: <Box component="img" src="/images/game/symbol-optimizer.svg" alt="optimizer" sx={{ width: 36, height: 36 }} />, color: '#ffb300', label: 'Optimiseur' },
  collector: { icon: <Box component="img" src="/images/game/symbol-collector.svg" alt="collector" sx={{ width: 36, height: 36 }} />, color: '#80cbc4', label: 'Collecteur' },
  defender: { icon: <Box component="img" src="/images/game/symbol-defender.svg" alt="defender" sx={{ width: 36, height: 36 }} />, color: '#90caf9', label: 'Défenseur' },
  bonusSpin: { icon: <Box component="img" src="/images/game/symbol-bonus.svg" alt="bonus" sx={{ width: 36, height: 36 }} />, color: '#e91e63', label: 'Bonus spin' },
};

const Tile = memo(({ active, symbol, value }) => {
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
      <Box sx={{ position: 'absolute', inset: 0 }} component="img" src="/images/game/cell-frame.svg" alt="frame" />
      {meta.icon || null}
      {typeof value === 'number' && (
        <Typography variant="caption" sx={{ position: 'absolute', bottom: 6, right: 8, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>{value}</Typography>
      )}
    </Box>
  );
});

Tile.displayName = 'Tile';

const Particles = memo(({ show = false }) => {
  if (!show) return null;
  const items = Array.from({ length: 18 }, (_, i) => i);
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {items.map((i) => (
        <Box key={i} sx={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${40 + Math.random() * 20}%`,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'linear-gradient(180deg, #ffd54f, #ffb300)',
          boxShadow: '0 0 8px rgba(255,193,7,0.6)',
          animation: 'fall 900ms ease-out forwards',
          '@keyframes fall': {
            '0%': { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
            '100%': { transform: `translate3d(${(Math.random() - 0.5) * 120}px, ${60 + Math.random() * 80}px, 0) scale(0.6)`, opacity: 0 }
          }
        }} />
      ))}
    </Box>
  );
});

Particles.displayName = 'Particles';

const MoneyCartRun = memo(({ open, onClose, run }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [bonusSpin, setBonusSpin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState('normal'); // 'slow' | 'normal' | 'fast'
  const [flickerSymbol, setFlickerSymbol] = useState(null);
  const [finished, setFinished] = useState(false);
  const [flash, setFlash] = useState(false);
  const [board, setBoard] = useState(Array.from({ length: 12 }, () => ({ symbol: null, value: null })));
  const timerRef = useRef(null);
  const flickerRef = useRef(null);

  const events = run?.events || [];
  const totalSteps = events.length || 0;

  const grid = useMemo(() => {
    const rows = 3, cols = 4; // 3 lignes x 4 colonnes como mock
    const cells = Array.from({ length: rows * cols }, (_, i) => ({ idx: i, symbol: null, active: false, value: null }));
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
      // Mettre à jour le board persistant basique
      setBoard((prev) => {
        const next = [...prev];
        const centerIdx = Math.floor(next.length / 2);
        const base = (stepIndex % 4);
        const rowStart = centerIdx - 2; // rangée centrale
        const revealIdxs = [rowStart + base, rowStart + ((base + 3) % 4), rowStart + ((base + 1) % 4)];
        revealIdxs.forEach((ri, k) => {
          const val = k === 0 ? (ev?.gain || Math.floor(1 + Math.random() * 20)) : null;
          next[ri] = { symbol: ev.symbol, value: val ?? next[ri].value };
        });
        // Effets simples
        if (ev.symbol === 'saver') {
          const sum = next.reduce((s, c) => s + (Number(c.value) || 0), 0);
          setTotalPoints((p) => p + Math.round(sum * currentMultiplier));
        }
        if (ev.symbol === 'optimizer') {
          const ri = revealIdxs[0];
          const v = Number(next[ri].value || 0);
          next[ri].value = v * 2 || 2;
          setCurrentMultiplier((m) => m * 2);
        }
        if (ev.symbol === 'collector') {
          const ri = revealIdxs[0];
          const neighbors = [ri - 1, ri + 1].filter((i) => i >= 0 && i < next.length);
          const gain = neighbors.reduce((s, i) => s + (Number(next[i]?.value || 0)), 0);
          setTotalPoints((p) => p + Math.round(gain * currentMultiplier));
        }
        if (ev.symbol === 'bonusSpin' && ev.bonus) setBonusSpin(true);
        return next;
      });
      if (ev.symbol === 'saver' && ev.gain) setTotalPoints((p) => p + ev.gain);
      if (ev.symbol === 'optimizer' && ev.multiplier) setCurrentMultiplier(ev.multiplier);
      if (ev.symbol === 'bonusSpin' && ev.bonus) setBonusSpin(true);
      setFlash(true);
      setTimeout(() => setFlash(false), 180);
      setStepIndex((i) => i + 1);
    }, stepDuration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (flickerRef.current) clearInterval(flickerRef.current);
    };
  }, [open, isPlaying, finished, stepIndex, totalSteps, speed]);

  const tiles = useMemo(() => {
    // Maquette: 5x4 board visible, révélation dans la rangée du milieu
    const cells = grid.cells.map((c) => ({ ...c, active: false, symbol: null, value: null }));
    const centerIdx = Math.floor(cells.length / 2);
    const rowStart = centerIdx - 2;
    for (let i = 0; i < 4; i++) {
      const idx = rowStart + i;
      // Utiliser l'état persistant si présent
      const cellState = board[idx] || {};
      cells[idx] = { ...cells[idx], symbol: cellState.symbol || 'defender', value: cellState.value ?? null };
    }
    const ev = events[stepIndex] || null;
    const sym = flickerSymbol || ev?.symbol || null;
    if (sym) {
      const base = (stepIndex % 4);
      // Révéler 3 cases (base, base-1, base+1) pour un effet plus "jeu"
      const reveal = [base, (base + 3) % 4, (base + 1) % 4];
      reveal.forEach((offset, k) => {
        const revealIdx = rowStart + offset;
        cells[revealIdx] = { ...cells[revealIdx], active: k === 0, symbol: sym, value: k === 0 ? (ev?.gain || null) : null };
      });
    }
    return cells;
  }, [grid.cells, events, stepIndex, flickerSymbol, board]);

  const themeMode = resolveThemeFromCosmetics();
  const bgImage = themeMode === 'neon' ? '/images/game/bg-neon.svg' : '/images/game/bg-aurora.svg';
  const spinsLeft = Math.max(0, totalSteps - stepIndex);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Run Money Cart</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip size="small" label={`x${currentMultiplier}`} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
          <Chip size="small" label={`${totalPoints} pts`} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
          {bonusSpin && <Chip size="small" label={'+1 spin'} sx={{ bgcolor: 'rgba(233,30,99,0.25)', color: 'white' }} />}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip size="small" label={`Spins restants: ${spinsLeft}`} />
          <LinearProgress variant="determinate" value={totalSteps ? (stepIndex / totalSteps) * 100 : 0} sx={{ flex: 1 }} />
          <ToggleButtonGroup size="small" value={speed} exclusive onChange={(e, val) => val && setSpeed(val)}>
            <ToggleButton value="slow">Lent</ToggleButton>
            <ToggleButton value="normal">Normal</ToggleButton>
            <ToggleButton value="fast">Rapide</ToggleButton>
          </ToggleButtonGroup>
          <Button onClick={() => setIsPlaying((p) => !p)} size="small" startIcon={isPlaying ? <Pause /> : <PlayArrow />}>{isPlaying ? 'Pause' : 'Play'}</Button>
          <Button onClick={reset} size="small" startIcon={<Replay />}>Relancer</Button>
        </Box>
        <Box sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(0,0,0,0.25)'
        }}>
          <Box component="img" src={bgImage} alt="bg" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
          {flash && (
            <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22), transparent 60%)', pointerEvents: 'none' }} />
          )}
          <Particles show={flash} />
          <Grid container spacing={1.25} columns={4} sx={{ p: 1.25, position: 'relative' }}>
          {tiles.map((t) => (
            <Grid item xs={1} key={t.idx}>
              <Tile active={t.active} symbol={t.symbol} value={t.value} />
            </Grid>
          ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 2, opacity: 0.2 }} />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(symbolMap).map(([key, meta]) => (
            <Chip key={key} icon={meta.icon} label={meta.label} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white' }} />
          ))}
        </Box>

        {finished && (
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Récap</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip label={`+${run?.pointsEarned || 0} pts`} />
              {run?.bonusSpin && <Chip label={'+1 spin'} color="secondary" />}
              {(run?.inventoryDrops || []).slice(0, 4).map((d, i) => (
                <Avatar key={i} variant="rounded" src={d?.id?.includes('neon') ? '/images/theme-neon.svg' : d?.id?.includes('aurora') ? '/images/theme-aurora.svg' : '/images/theme-gradient.svg'} sx={{ width: 32, height: 32 }} />
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
});

MoneyCartRun.displayName = 'MoneyCartRun';

export default MoneyCartRun;


