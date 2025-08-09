import React, { memo } from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useStore } from '../../store';
import { gamificationService } from '../../services/gamificationService';

const images = {
  theme: {
    gradient: '/assets/cosmetics/theme-gradient.png',
    aurora: '/assets/cosmetics/theme-aurora.png',
    'premium-aurora': '/assets/cosmetics/theme-aurora.png',
    neon: '/assets/cosmetics/theme-neon.png',
    'pro-neon': '/assets/cosmetics/theme-neon.png'
  },
  booster: {
    default: '/assets/cosmetics/booster.png'
  }
};

const InventoryGrid = memo(() => {
  const { user, gamification, setGamification } = useStore();
  const items = Array.isArray(gamification?.inventory) ? gamification.inventory : [];

  if (items.length === 0) {
    return <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Aucun objet pour l’instant.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {items.map((it, idx) => {
        const img = images[it.type]?.[it.id] || images[it.type]?.default || images.theme.gradient;
        const label = it.type === 'theme' ? `Thème: ${it.id}` : it.type === 'booster' ? `Booster ${it.missionBonusPct || ''}%` : `${it.type}`;
        return (
          <Grid item xs={6} sm={4} md={3} key={`${it.type}-${it.id}-${idx}`}>
            <Paper sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
              <Box component="img" src={img} alt={label} sx={{ width: '100%', borderRadius: 2, aspectRatio: '1/1', objectFit: 'cover' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}>{label}</Typography>
              {it.type === 'theme' && (
                <Button size="small" variant="outlined" onClick={async () => {
                  try {
                    const res = await gamificationService.applyCosmetic(user.id, it);
                    if (res?.gamification) setGamification(res.gamification);
                  } catch (_) {}
                }}>Appliquer</Button>
              )}
              {it.type === 'booster' && (
                <Button size="small" variant="contained" onClick={async () => {
                  try {
                    const res = await gamificationService.activateBooster(user.id, it);
                    if (res?.gamification) setGamification(res.gamification);
                  } catch (_) {}
                }}>Activer</Button>
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
});

InventoryGrid.displayName = 'InventoryGrid';

export default InventoryGrid;


