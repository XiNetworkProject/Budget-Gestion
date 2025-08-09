import React, { memo } from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useStore } from '../../store';
import { gamificationService } from '../../services/gamificationService';

const images = {
  theme: {
    gradient: '/images/theme-gradient.svg',
    aurora: '/images/theme-aurora.svg',
    'premium-aurora': '/images/theme-aurora.svg',
    neon: '/images/theme-neon.svg',
    'pro-neon': '/images/theme-neon.svg'
  },
  booster: {
    default: '/images/booster.svg'
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
        const qty = Number(it.qty || 1);
        const label = it.type === 'theme' ? `Thème: ${it.id}${qty>1?` x${qty}`:''}` : it.type === 'booster' ? `Booster ${it.missionBonusPct || ''}%${qty>1?` x${qty}`:''}` : `${it.type}${qty>1?` x${qty}`:''}`;
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
                    // Appliquer immédiatement le thème dans l'UI
                    window.location.reload();
                  } catch (_) {}
                }}>Appliquer</Button>
              )}
              {it.type === 'booster' && (
                <Button size="small" variant="contained" onClick={async () => {
                  try {
                    const res = await gamificationService.activateBooster(user.id, it);
                    if (res?.gamification) setGamification(res.gamification);
                    // Décrémenter qty côté UI si besoin
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


