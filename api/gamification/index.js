import { dbUtils } from '../../supabase-config';

export default async function handler(req, res) {
  // CORS basique
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });

  try {
    const { action } = req.body || {};
    switch (action) {
      case 'spin-log':
        return await logSpin(req, res);
      case 'rewards-catalog':
        return await rewardsCatalog(req, res);
      default:
        return res.status(400).json({ message: 'Action non reconnue' });
    }
  } catch (e) {
    console.error('[Gamification API] Erreur:', e);
    return res.status(500).json({ message: 'Erreur interne' });
  }
}

async function logSpin(req, res) {
  const { userId, outcome } = req.body || {};
  if (!userId || !outcome) return res.status(400).json({ message: 'Paramètres manquants' });
  try {
    await dbUtils.logSpin({ userId, outcome });
  } catch (e) {
    // Non bloquant si la table n'existe pas encore
    console.warn('[Gamification API] logSpin non persistant:', e?.message);
  }
  return res.status(200).json({ success: true });
}

async function rewardsCatalog(req, res) {
  // Catalogue statique minimal; les boosts d’abonnement sont gérés côté client
  const catalog = [
    { tier: 'small', reward: { code: 'POINTS_25', kind: 'points', value: 25 } },
    { tier: 'medium', reward: { code: 'POINTS_100', kind: 'points', value: 100 } },
    { tier: 'rare', reward: { code: 'BOOST_10', kind: 'booster', booster: { kind: 'pointsBonus', value: 0.10, durationHours: 24 } } },
    { tier: 'epic', reward: { code: 'FREEZE_1', kind: 'token', token: 'freeze', value: 1 } }
  ];
  return res.status(200).json({ success: true, catalog });
}

export const config = { runtime: 'nodejs' };


