import React, { useEffect, useState, memo } from 'react';
import { Box, Typography, Paper, Grid, Chip, Button } from '@mui/material';
import { Casino, Star, Brush, Bolt } from '@mui/icons-material';
import { useStore } from '../store';
import SpinLauncher from '../components/optimized/SpinLauncher';
import { gamificationService } from '../services/gamificationService';

const GameCenter = memo(() => {
  const { user, gamification, getCurrentPlan } = useStore();
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await gamificationService.getRewardsCatalog();
        if (mounted) setCatalog(res?.catalog || []);
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, []);

  const spins = Number(gamification?.spins || 0);
  const plan = getCurrentPlan?.();

  return (
    <Box sx={{ p: 2, minHeight: '100vh', background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Casino sx={{ color: '#ffca28' }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          Centre de jeu
        </Typography>
        <Chip label={`${spins} spin(s)`} size="small" sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
      </Box>

      <Paper sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)' }}>
        <Typography variant="h6" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>Roue d’épargne</Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
          Gagnez des spins en économisant et via le spin quotidien.
          {plan && ` Avantages ${plan.name}.`}
        </Typography>
        <SpinLauncher />
      </Paper>

      <Paper sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>Récompenses possibles</Typography>
        <Grid container spacing={2}>
          {catalog.map((r, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {r.type === 'points' && <Star sx={{ color: '#ffd54f' }} />}
                  {r.type === 'cosmetic' && <Brush sx={{ color: '#80cbc4' }} />}
                  {r.type === 'booster' && <Bolt sx={{ color: '#90caf9' }} />}
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>{r.label}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Probabilité relative: {r.weight}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)' }}>
        <Typography variant="h6" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>Inventaire</Typography>
        {Array.isArray(gamification?.inventory) && gamification.inventory.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {gamification.inventory.map((it, i) => (
              <Chip key={i} label={`${it.type}:${it.id || ''}`} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Aucun objet pour l’instant.</Typography>
        )}
      </Paper>
    </Box>
  );
});

GameCenter.displayName = 'GameCenter';

export default GameCenter;


