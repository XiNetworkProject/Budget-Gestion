import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Divider,
  TextField,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Savings as SavingsIcon,
  TrendingUp,
  AutoAwesome,
  Lock,
  GetApp,
  Assessment,
  Add,
  Edit,
  Delete,
  Bolt,
  Star
} from '@mui/icons-material';

function FeatureLock({ title, description, ctaLabel = 'Voir les offres', onCta }) {
  return (
    <Paper sx={{
      p: 3,
      background: 'rgba(255, 255, 255, 0.06)',
      border: '1px dashed rgba(255,255,255,0.25)',
      backdropFilter: 'blur(10px)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Lock />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{description}</Typography>
        </Box>
        <Button variant="contained" onClick={onCta}>
          {ctaLabel}
        </Button>
      </Box>
    </Paper>
  );
}

const SavingsAdvanced = () => {
  const navigate = useNavigate();
  const {
    savings,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    sideByMonth,
    getCurrentPlan,
    hasPartialAI,
    hasFullAI,
    isFeatureAvailable,
    checkUsageLimit
  } = useStore();

  const plan = getCurrentPlan();
  const [tab, setTab] = useState(0);

  const goals = savings;
  const totalSaved = goals.reduce((sum, g) => sum + (g.current || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + (g.target || 0), 0);
  const overallProgressPct = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;

  const averageMonthlySavings = useMemo(() => {
    if (!sideByMonth?.length) return 0;
    return sideByMonth.reduce((a, b) => a + (b || 0), 0) / sideByMonth.length;
  }, [sideByMonth]);

  const [projectionAmount, setProjectionAmount] = useState(Math.round(averageMonthlySavings || 100));
  const [projectionGoalIdx, setProjectionGoalIdx] = useState(0);

  const selectedGoal = goals[projectionGoalIdx] || null;
  const monthsToTarget = useMemo(() => {
    if (!selectedGoal) return 0;
    const remaining = Math.max(0, (selectedGoal.target || 0) - (selectedGoal.current || 0));
    if (projectionAmount <= 0) return Infinity;
    return Math.ceil(remaining / projectionAmount);
  }, [selectedGoal, projectionAmount]);

  // Règles d'épargne (stockées localement pour l'instant)
  const [rules, setRules] = useState([
    // Exemple: 10% des revenus vers le goal 0
  ]);

  const rulesLimit = checkUsageLimit('maxActionPlans', rules.length);
  const canAddRules = rulesLimit.allowed || rulesLimit.remaining === -1;

  const handleAddRule = () => {
    setRules(prev => [...prev, { id: Date.now().toString(), percent: 10, goalIndex: 0 }]);
  };
  const handleUpdateRule = (id, patch) => {
    setRules(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };
  const handleDeleteRule = (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  // Export (CSV) - gated via advancedReports
  const handleExportCSV = () => {
    const rows = [
      ['Nom', 'Objectif', 'Actuel', 'Progression%'],
      ...goals.map(g => [g.name, g.target, g.current || 0, ((g.current || 0) / (g.target || 1) * 100).toFixed(1)])
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'epargne.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const projectionPanel = (
    <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TrendingUp />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Projections d'épargne</Typography>
        <Chip size="small" label={plan.id.toUpperCase()} sx={{ ml: 'auto' }} />
      </Box>
      {!goals.length ? (
        <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}>Ajoutez au moins un objectif pour voir des projections.</Alert>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="goal-select-label">Objectif</InputLabel>
              <Select
                labelId="goal-select-label"
                value={projectionGoalIdx}
                label="Objectif"
                onChange={(e) => setProjectionGoalIdx(Number(e.target.value))}
              >
                {goals.map((g, idx) => (
                  <MenuItem key={g.id} value={idx}>{g.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="Versement mensuel"
              value={projectionAmount}
              onChange={(e) => setProjectionAmount(Math.max(0, Number(e.target.value || 0)))}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Temps estimé pour atteindre l'objectif:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {monthsToTarget === Infinity ? '—' : `${monthsToTarget} mois`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Aperçu</Typography>
              <LinearProgress variant="determinate" value={overallProgressPct} sx={{ height: 10, borderRadius: 5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">Total: {totalSaved.toLocaleString()}€ / {totalTarget.toLocaleString()}€</Typography>
                <Typography variant="body2">Moyenne mensuelle: {Math.round(averageMonthlySavings)}€</Typography>
              </Box>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.15)' }} />
              {hasPartialAI() ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesome sx={{ color: '#ffd700' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Suggestion IA: augmentez votre versement mensuel de {Math.ceil(projectionAmount * 0.1)}€ pour réduire de ~{Math.max(1, Math.round(monthsToTarget * 0.1))} mois le délai.
                  </Typography>
                </Box>
              ) : (
                <FeatureLock
                  title="Suggestions intelligentes"
                  description="Débloquez des recommandations personnalisées (Premium/Pro)."
                  onCta={() => navigate('/subscription')}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      )}
    </Paper>
  );

  const rulesPanel = (
    <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Bolt />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Règles d'épargne automatiques</Typography>
        <Chip size="small" label={plan.id.toUpperCase()} sx={{ ml: 'auto' }} />
      </Box>
      {!canAddRules && (
        <FeatureLock
          title="Plus de règles disponibles en Premium/Pro"
          description="Créez un nombre illimité de règles d'allocation automatiques."
          onCta={() => navigate('/subscription')}
        />
      )}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {rules.map(rule => (
          <Paper key={rule.id} sx={{ p: 2, background: 'rgba(255,255,255,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                size="small"
                type="number"
                label="% revenu"
                value={rule.percent}
                onChange={e => handleUpdateRule(rule.id, { percent: Math.max(0, Math.min(100, Number(e.target.value || 0))) })}
                sx={{ width: 120 }}
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id={`rule-goal-${rule.id}`}>Objectif</InputLabel>
                <Select
                  labelId={`rule-goal-${rule.id}`}
                  value={Math.min(rule.goalIndex, Math.max(0, goals.length - 1))}
                  label="Objectif"
                  onChange={(e) => handleUpdateRule(rule.id, { goalIndex: Number(e.target.value) })}
                >
                  {goals.map((g, idx) => (
                    <MenuItem key={g.id} value={idx}>{g.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Supprimer">
                <IconButton color="error" onClick={() => handleDeleteRule(rule.id)}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        ))}
        <Button
          startIcon={<Add />}
          variant="outlined"
          onClick={handleAddRule}
          disabled={!canAddRules}
        >
          Ajouter une règle
        </Button>
      </Box>
    </Paper>
  );

  const exportPanel = (
    <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Assessment />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Rapports et export</Typography>
      </Box>
      {isFeatureAvailable('advancedReports') ? (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button startIcon={<GetApp />} variant="contained" onClick={handleExportCSV}>Exporter CSV</Button>
          <Button startIcon={<GetApp />} variant="outlined" disabled>Exporter PDF (bientôt)</Button>
        </Box>
      ) : (
        <FeatureLock
          title="Rapports avancés"
          description="Exports CSV/PDF, rapports détaillés et comparatifs (Pro)."
          onCta={() => navigate('/subscription')}
        />
      )}
    </Paper>
  );

  const interestPanel = (
    <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Star />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Intérêts composés</Typography>
      </Box>
      {hasFullAI() ? (
        <CompoundInterestSimulator />
      ) : (
        <FeatureLock
          title="Simulateur d'intérêts composés"
          description="Projetez votre épargne avec des intérêts composés (Pro)."
          onCta={() => navigate('/subscription')}
        />
      )}
    </Paper>
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
      p: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SavingsIcon />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Épargne</Typography>
        <Chip label={plan.id.toUpperCase()} size="small" sx={{ ml: 1 }} />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, background: 'rgba(25, 118, 210, 0.15)', border: '1px solid rgba(25,118,210,0.3)' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Progression globale</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{Math.round(overallProgressPct)}%</Typography>
            <LinearProgress variant="determinate" value={overallProgressPct} sx={{ height: 10, borderRadius: 5, mt: 1 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>Total: {totalSaved.toLocaleString()}€ / {totalTarget.toLocaleString()}€</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, background: 'rgba(76, 175, 80, 0.15)', border: '1px solid rgba(76,175,80,0.3)' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Moyenne mensuelle</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{Math.round(averageMonthlySavings)}€</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Basé sur l'historique récent</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
          <Tab label="Projections" />
          <Tab label="Règles" />
          <Tab label="Rapports" />
          <Tab label="Intérêts" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2, display: tab === 0 ? 'block' : 'none' }}>{projectionPanel}</Box>
      <Box sx={{ mt: 2, display: tab === 1 ? 'block' : 'none' }}>{rulesPanel}</Box>
      <Box sx={{ mt: 2, display: tab === 2 ? 'block' : 'none' }}>{exportPanel}</Box>
      <Box sx={{ mt: 2, display: tab === 3 ? 'block' : 'none' }}>{interestPanel}</Box>
    </Box>
  );
};

function CompoundInterestSimulator() {
  const [initial, setInitial] = useState(0);
  const [contrib, setContrib] = useState(200);
  const [rate, setRate] = useState(4);
  const [years, setYears] = useState(3);

  const total = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    let futureValue = initial * Math.pow(1 + monthlyRate, months);
    for (let m = 1; m <= months; m++) {
      futureValue += contrib * Math.pow(1 + monthlyRate, months - m);
    }
    return futureValue;
  }, [initial, contrib, rate, years]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <TextField fullWidth type="number" label="Capital de départ (€)" value={initial} onChange={e => setInitial(Number(e.target.value || 0))} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth type="number" label="Versement mensuel (€)" value={contrib} onChange={e => setContrib(Number(e.target.value || 0))} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth type="number" label="Taux annuel (%)" value={rate} onChange={e => setRate(Number(e.target.value || 0))} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth type="number" label="Durée (années)" value={years} onChange={e => setYears(Math.max(0, Number(e.target.value || 0)))} />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Valeur future estimée:</Typography>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{Math.round(total).toLocaleString()}€</Typography>
      </Box>
    </Box>
  );
}

export default SavingsAdvanced;

