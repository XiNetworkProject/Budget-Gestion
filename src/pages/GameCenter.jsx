import React, { useEffect, useState, memo } from 'react';
import { Box, Typography, Paper, Grid, Chip, Button, TextField } from '@mui/material';
import { Casino, Star, Brush, Bolt } from '@mui/icons-material';
import { useStore } from '../store';
import SpinLauncher from '../components/optimized/SpinLauncher';
import { gamificationService } from '../services/gamificationService';
import InventoryGrid from '../components/optimized/InventoryGrid';
import MoneyCartRun from '../components/optimized/MoneyCartRun';
import MoneyCartPixi from '../components/optimized/MoneyCartPixi';
import TestGame from '../components/optimized/TestGame';
import SimpleTest from '../components/optimized/SimpleTest';

const GameCenter = memo(() => {
  const { user, gamification, setGamification, getCurrentPlan } = useStore();
  const [catalog, setCatalog] = useState([]);
  const [shop, setShop] = useState([]);
  const [redeemCount, setRedeemCount] = useState(1);
  const [showRun, setShowRun] = useState(false);
  const [runPreview, setRunPreview] = useState(null);
  const [showTestGame, setShowTestGame] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await gamificationService.getRewardsCatalog();
        if (mounted) {
          const fallbackCatalog = [
            { type: 'points', label: '+50 points', points: 50, weight: 40, rarity: 'common' },
            { type: 'points', label: '+150 points', points: 150, weight: 24, rarity: 'uncommon' },
            { type: 'points', label: '+300 points', points: 300, weight: 10, rarity: 'rare' },
            { type: 'booster', label: 'Booster +10% missions (24h)', booster: { missionBonusPct: 10, expiresInHours: 24 }, weight: 10, rarity: 'uncommon' },
            { type: 'booster', label: 'Booster +15% missions (24h)', booster: { missionBonusPct: 15, expiresInHours: 24 }, weight: 6, rarity: 'rare' },
            { type: 'cosmetic', label: 'Thème Gradient', cosmetic: { type: 'theme', id: 'gradient' }, weight: 6, rarity: 'uncommon' },
            { type: 'cosmetic', label: 'Thème Aurora', cosmetic: { type: 'theme', id: 'premium-aurora' }, weight: 3, rarity: 'epic' },
            { type: 'cosmetic', label: 'Thème Néon', cosmetic: { type: 'theme', id: 'pro-neon' }, weight: 3, rarity: 'epic' },
            { type: 'freeze', label: 'Jeton Freeze Streak', freeze: 1, weight: 5, rarity: 'rare' },
            { type: 'bonusSpin', label: 'Spin bonus', bonusSpin: true, weight: 3, rarity: 'legendary' }
          ];
          setCatalog(Array.isArray(res?.catalog) && res.catalog.length > 0 ? res.catalog : fallbackCatalog);
        }
        const s = await gamificationService.getShop();
        if (mounted) setShop((s && Array.isArray(s.shop) && s.shop.length>0) ? s.shop : [
          { id: 'pack-1', kind: 'spinPack', label: 'Pack 5 spins', pricePoints: 400, payload: { spins: 5 } },
          { id: 'boost-10', kind: 'booster', label: 'Booster +10% (24h)', pricePoints: 600, payload: { missionBonusPct: 10, expiresInHours: 24 } },
          { id: 'cos-aurora', kind: 'cosmetic', label: 'Thème Aurora', pricePoints: 800, payload: { id: 'premium-aurora' } },
          { id: 'cos-neon', kind: 'cosmetic', label: 'Thème Néon', pricePoints: 800, payload: { id: 'pro-neon' } },
        ]);
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
        <Grid container spacing={1}>
          {catalog.map((r, idx) => (
            <Grid item xs={6} sm={4} md={3} key={idx}>
              <Paper sx={{ p: 1.25, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {r.type === 'points' && <Box component="img" src="/images/token-points.svg" alt="points" sx={{ width: 24, height: 24 }} />}
                  {r.type === 'cosmetic' && <Box component="img" src={r.cosmetic?.id?.includes('neon') ? '/images/theme-neon.svg' : r.cosmetic?.id?.includes('aurora') ? '/images/theme-aurora.svg' : '/images/theme-gradient.svg'} alt="cosmetic" sx={{ width: 24, height: 24, borderRadius: 0.75 }} />}
                  {r.type === 'booster' && <Box component="img" src="/images/booster.svg" alt="booster" sx={{ width: 24, height: 24 }} />}
                  {r.type === 'freeze' && <Box component="img" src="/images/token-freeze.svg" alt="freeze" sx={{ width: 24, height: 24 }} />}
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.1 }}>{r.label}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Rareté: {r.rarity || '—'} • Poids: {r.weight}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)' }}>
        <Typography variant="h6" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>Inventaire</Typography>
        <InventoryGrid />
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button size="small" variant="outlined" onClick={async () => {
            try {
              const res = await gamificationService.useFreeze(user.id);
              if (res?.gamification) setGamification(res.gamification);
            } catch (_) {}
          }}>Utiliser un Freeze</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)' }}>
        <Typography variant="h6" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>Convertir des points → spins</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>100 points = 1 spin</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField 
            size="small" 
            type="number" 
            value={redeemCount}
            onChange={(e) => setRedeemCount(Math.max(1, parseInt(e.target.value || '1', 10)))}
            inputProps={{ min: 1 }}
            sx={{ width: 100 }}
          />
          <Button 
            variant="contained"
            onClick={async () => {
              try {
                const res = await gamificationService.redeemPointsToSpins(user.id, redeemCount);
                if (res?.gamification) setGamification(res.gamification);
              } catch (e) {
                // noop
              }
            }}
          >
            Convertir
          </Button>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Points: {Number(gamification?.points || 0).toLocaleString()}
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mt: 3, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>Boutique (points)</Typography>
        <Grid container spacing={2}>
          {shop.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>{item.label}</Typography>
                {item.kind === 'booster' && (
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>+{item.payload?.missionBonusPct}% • {item.payload?.expiresInHours}h</Typography>
                )}
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Prix: {item.pricePoints} pts</Typography>
                <Box sx={{ mt: 1 }}>
                  <Button 
                    size="small"
                    variant="outlined"
                    onClick={async () => {
                      try {
                        const res = await gamificationService.buy(user.id, item.id);
                        if (res?.gamification) setGamification(res.gamification);
                        // Appliquer immédiatement un thème acheté
                        if (item.kind === 'cosmetic') {
                          await gamificationService.applyCosmetic(user.id, { type: 'theme', id: item.payload?.id });
                          setTimeout(() => window.location.reload(), 100);
                        }
                      } catch (_) {}
                    }}
                  >
                    Acheter
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

                        <Paper sx={{ p: 2, mt: 3, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>Test Simple PixiJS</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                      Test de base pour vérifier que PixiJS fonctionne sans erreur.
                    </Typography>
                    <SimpleTest />
                  </Paper>

                  <Paper sx={{ p: 2, mt: 3, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>Test des systèmes PixiJS</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                      Testez les systèmes de particules, d'éclairage et de spritesheet sans erreur.
                    </Typography>
                    <Button variant="contained" onClick={() => setShowTestGame(!showTestGame)}>
                      {showTestGame ? 'Masquer le test' : 'Tester les systèmes'}
                    </Button>

                    {showTestGame && (
                      <Box sx={{ mt: 2 }}>
                        <TestGame />
                      </Box>
                    )}
                  </Paper>

      <Paper sx={{ p: 2, mt: 3, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)' }}>
        <Typography variant="h6" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>Mini‑jeu "Run" (style Money Cart)</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
          Lance un run rapide et accumule des multiplicateurs, objets et points.
        </Typography>
        <Button variant="contained" onClick={async () => {
          try {
            const res = await gamificationService.runMiniGame(user.id);
            if (res?.gamification) setGamification(res.gamification);
            // Affichage compact des événements jusqu'à ce que le board visuel soit prêt
            if (res?.run) {
              setShowRun(true);
              setRunPreview(res.run);
            }
          } catch (_) {}
        }}>Lancer un run</Button>

        {showRun && runPreview && (
          <MoneyCartRun open={showRun} onClose={() => setShowRun(false)} run={runPreview} />
        )}
        {/* Aperçu rendu WebGL (expérimental) */}
        {showRun && runPreview && runPreview.events && runPreview.events.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <MoneyCartPixi events={runPreview.events} />
          </Box>
        )}
      </Paper>
    </Box>
  );
});

GameCenter.displayName = 'GameCenter';

export default GameCenter;


