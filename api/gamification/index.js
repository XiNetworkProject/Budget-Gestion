import { dbUtils } from '../../supabase-config.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method } = req;
    if (method === 'GET') return await handleGet(req, res);
    if (method === 'POST') return await handlePost(req, res);
    return res.status(405).json({ message: 'Méthode non autorisée' });
  } catch (error) {
    console.error('Erreur API gamification:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

async function handleGet(req, res) {
  const { userId, action } = req.query || {};
  // Support GET catalogue/shop pour éviter 400 si POST indisponible
  if (action === 'catalog') {
    return res.status(200).json({ success: true, catalog: baseCatalog() });
  }
  if (action === 'shop') {
    return res.status(200).json({ success: true, shop: baseShop() });
  }
  if (!userId) {
    // Retourner un état par défaut + infos catalogue/shop
    return res.status(200).json({ success: true, catalog: baseCatalog(), shop: baseShop(), gamification: defaultGamification() });
  }
  const state = await dbUtils.getGamification(userId);
  return res.status(200).json({ success: true, gamification: state || defaultGamification() });
}

async function handlePost(req, res) {
  const { action, userId } = req.body || {};
  if (!userId) return res.status(400).json({ message: 'userId requis' });

  if (action === 'grantSpin') {
    const { amount = 1 } = req.body || {};
    const current = (await dbUtils.getGamification(userId)) || defaultGamification();
    const nowIso = new Date().toISOString();
    const next = { 
      ...current, 
      spins: Math.max(0, Number(current.spins || 0)) + Number(amount),
      lastDailyGrant: nowIso
    };
    const saved = await dbUtils.saveGamification(userId, next);
    return res.status(200).json({ success: true, gamification: saved });
  }

  if (action === 'spin') {
    const current = (await dbUtils.getGamification(userId)) || defaultGamification();
    const spins = Number(current.spins || 0);
    if (spins <= 0) return res.status(400).json({ message: 'Aucun spin disponible' });

    const plan = await safeGetPlan(userId);
    const outcome = rollReward(plan);

    // Appliquer la récompense
    const nowIso = new Date().toISOString();
    const nextBase = {
      ...current,
      spins: spins - 1 + (outcome.bonusSpin ? 1 : 0),
      points: Math.max(0, Number(current.points || 0)) + (outcome.points || 0),
      lastSpinAt: nowIso,
      inventory: Array.isArray(current.inventory) ? [...current.inventory] : [],
      boosters: { ...(current.boosters || {}), ...(outcome.booster || {}) }
    };
    const next = {
      ...nextBase,
      inventory: mergeInventory(
        nextBase.inventory,
        [
          ...(outcome.cosmetic ? [outcome.cosmetic] : []),
          ...(outcome.freeze ? [{ type: 'freeze' }] : [])
        ]
      ),
      recentLog: addLog(current.recentLog, { kind: 'spin', label: outcome.label, points: outcome.points || 0, bonusSpin: !!outcome.bonusSpin, freeze: !!outcome.freeze })
    };

    const saved = await dbUtils.saveGamification(userId, next);
    return res.status(200).json({ success: true, outcome, gamification: saved });
  }

  if (action === 'getRewards') {
    return res.status(200).json({ success: true, catalog: baseCatalog() });
  }

  if (action === 'getShop') {
    return res.status(200).json({ success: true, shop: baseShop() });
  }

  if (action === 'grantWelcome') {
    const current = (await dbUtils.getGamification(userId)) || defaultGamification();
    if (current.welcomeGranted) {
      return res.status(200).json({ success: true, gamification: current });
    }
    const next = {
      ...current,
      spins: Math.max(0, Number(current.spins || 0)) + 50,
      welcomeGranted: true
    };
    const saved = await dbUtils.saveGamification(userId, next);
    return res.status(200).json({ success: true, gamification: saved });
  }

  if (action === 'redeem') {
    const { kind = 'pointsToSpins', amount = 1 } = req.body || {};
    const current = (await dbUtils.getGamification(userId)) || defaultGamification();
    if (kind === 'pointsToSpins') {
      const costPerSpin = 100;
      const needed = costPerSpin * Number(amount);
      if ((current.points || 0) < needed) {
        return res.status(400).json({ message: 'Points insuffisants' });
      }
      const next = {
        ...current,
        points: Number(current.points || 0) - needed,
        spins: Number(current.spins || 0) + Number(amount)
      };
      const saved = await dbUtils.saveGamification(userId, next);
      return res.status(200).json({ success: true, gamification: saved });
    }
    return res.status(400).json({ message: 'Type de conversion invalide' });
  }

  if (action === 'activateBooster') {
    const { booster } = req.body || {};
    const current = (await dbUtils.getGamification(userId)) || defaultGamification();
    if (!booster || typeof booster !== 'object') {
      return res.status(400).json({ message: 'Booster invalide' });
    }
    // Retirer un booster identique de l'inventaire
    const inv = Array.isArray(current.inventory) ? [...current.inventory] : [];
    const idx = inv.findIndex((it) => it && it.type === 'booster' && JSON.stringify(it) === JSON.stringify(booster));
    if (idx === -1) {
      return res.status(400).json({ message: 'Booster non trouvé dans l\'inventaire' });
    }
    inv.splice(idx, 1);
    const expiresAt = booster.expiresInHours ? new Date(Date.now() + booster.expiresInHours * 3600 * 1000).toISOString() : null;
    const next = {
      ...current,
      inventory: inv,
      boosters: {
        ...(current.boosters || {}),
        missionBonusPct: Math.max(Number(current.boosters?.missionBonusPct || 0), Number(booster.missionBonusPct || 0)),
        missionBonusExpiresAt: expiresAt
      }
    };
    const saved = await dbUtils.saveGamification(userId, next);
    return res.status(200).json({ success: true, gamification: saved });
  }

  if (action === 'applyCosmetic') {
    const { cosmetic } = req.body || {};
    const current = (await dbUtils.getGamification(userId)) || defaultGamification();
    if (!cosmetic || typeof cosmetic !== 'object') {
      return res.status(400).json({ message: 'Cosmétique invalide' });
    }
    const next = {
      ...current,
      activeCosmetics: {
        ...(current.activeCosmetics || {}),
        [cosmetic.type]: cosmetic.id || true
      }
    };
    const saved = await dbUtils.saveGamification(userId, next);
    return res.status(200).json({ success: true, gamification: saved });
  }

  if (action === 'run') {
    const current = (await dbUtils.getGamification(userId)) || defaultGamification();
    const spins = Number(current.spins || 0);
    if (spins <= 0) return res.status(400).json({ message: 'Aucun spin disponible' });

    const plan = await safeGetPlan(userId);
    const result = simulateMoneyCartRun(plan);

    // Appliquer récompenses
    const nextBase = {
      ...current,
      spins: spins - 1 + (result.bonusSpin ? 1 : 0),
      points: Math.max(0, Number(current.points || 0)) + result.pointsEarned,
      inventory: Array.isArray(current.inventory) ? [...current.inventory] : []
    };
    const next = {
      ...nextBase,
      inventory: mergeInventory(nextBase.inventory, result.inventoryDrops || []),
      recentLog: addLog(current.recentLog, { kind: 'run', label: 'Run terminé', points: result.pointsEarned || 0, bonusSpin: !!result.bonusSpin })
    };
    const saved = await dbUtils.saveGamification(userId, next);
    return res.status(200).json({ success: true, run: result, gamification: saved });
  }

  if (action === 'buy') {
    const { itemId } = req.body || {};
    const shop = baseShop();
    const item = shop.find(s => s.id === itemId);
    if (!item) return res.status(400).json({ message: 'Article introuvable' });
    const current = (await dbUtils.getGamification(userId)) || defaultGamification();
    const points = Number(current.points || 0);
    if (points < item.pricePoints) return res.status(400).json({ message: 'Points insuffisants' });
    const next = { ...current, points: points - item.pricePoints, inventory: Array.isArray(current.inventory) ? [...current.inventory] : [] };
    if (item.kind === 'spinPack') {
      next.spins = Number(next.spins || 0) + (item.payload?.spins || 0);
    } else if (item.kind === 'booster') {
      next.inventory = mergeInventory(next.inventory, [{ type: 'booster', ...item.payload }]);
    } else if (item.kind === 'cosmetic') {
      next.inventory = mergeInventory(next.inventory, [{ type: 'theme', id: item.payload?.id }]);
    }
    next.recentLog = addLog(current.recentLog, { kind: 'buy', label: item.label, pricePoints: item.pricePoints });
    const saved = await dbUtils.saveGamification(userId, next);
    return res.status(200).json({ success: true, gamification: saved });
  }

  if (action === 'useFreeze') {
    const current = (await dbUtils.getGamification(userId)) || defaultGamification();
    const inv = Array.isArray(current.inventory) ? [...current.inventory] : [];
    const idx = inv.findIndex(it => it && it.type === 'freeze');
    if (idx === -1) return res.status(400).json({ message: 'Aucun jeton freeze' });
    const item = inv[idx];
    const qty = Math.max(1, Number(item.qty || 1));
    if (qty > 1) inv[idx] = { ...item, qty: qty - 1 };
    else inv.splice(idx, 1);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const next = {
      ...current,
      inventory: inv,
      boosters: { ...(current.boosters || {}), freezeActive: true, freezeExpiresAt: endOfDay.toISOString() },
      recentLog: addLog(current.recentLog, { kind: 'freeze', label: 'Freeze activé', expiresAt: endOfDay.toISOString() })
    };
    const saved = await dbUtils.saveGamification(userId, next);
    return res.status(200).json({ success: true, gamification: saved });
  }

  if (action === 'save') {
    const { data } = req.body || {};
    if (!data || typeof data !== 'object') return res.status(400).json({ message: 'Données invalides' });
    const saved = await dbUtils.saveGamification(userId, data);
    return res.status(200).json({ success: true, gamification: saved });
  }

  return res.status(400).json({ message: 'Action invalide' });
}

function defaultGamification() {
  return {
    spins: 0,
    points: 0,
    level: 1,
    streakDays: 0,
    bestStreak: 0,
    freezeTokens: 0,
    lastSpinAt: null,
    inventory: [],
    boosters: {}
  };
}

async function safeGetPlan(userId) {
  try {
    const plan = await dbUtils.getSubscriptionPlan?.(userId);
    return plan || 'FREE';
  } catch (_) {
    return 'FREE';
  }
}

function baseCatalog() {
  // Catalogue de base avec poids (odds) et rareté indicative
  return [
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
}

function rollReward(plan) {
  const catalog = baseCatalog().map((r) => ({ ...r }));
  // Récompenses exclusives selon le plan
  if (plan === 'PREMIUM') {
    catalog.push({ type: 'cosmetic', label: 'Thème Aurora (Premium)', cosmetic: { type: 'theme', id: 'premium-aurora' }, weight: 4 });
  }
  if (plan === 'PRO') {
    catalog.push({ type: 'cosmetic', label: 'Thème Néon (Pro)', cosmetic: { type: 'theme', id: 'pro-neon' }, weight: 6 });
    catalog.push({ type: 'booster', label: 'Booster +20% missions (24h) (Pro)', booster: { missionBonusPct: 20, expiresInHours: 24 }, weight: 4 });
  }
  // Avantages abonnés: meilleurs poids sur rares et chance de spin bonus
  let rareBoost = 1;
  let bonusSpinChance = 0;
  if (plan === 'PREMIUM') { rareBoost = 1.3; bonusSpinChance = 0.15; }
  if (plan === 'PRO') { rareBoost = 1.7; bonusSpinChance = 0.3; }

  // Booster les entrées moins fréquentes
  for (const r of catalog) {
    if (r.type === 'cosmetic' || r.type === 'freeze' || r.type === 'booster') {
      r.weight = Math.max(1, Math.round(r.weight * rareBoost));
    }
  }

  const total = catalog.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of catalog) {
    if ((roll -= r.weight) <= 0) {
      const outcome = normalizeOutcome(r);
      if (!outcome.bonusSpin && Math.random() < bonusSpinChance) {
        outcome.bonusSpin = true;
      }
      return outcome;
    }
  }
  return normalizeOutcome(catalog[0]);
}

function normalizeOutcome(r) {
  const out = { kind: r.type, label: r.label };
  if (r.points) out.points = r.points;
  if (r.cosmetic) out.cosmetic = r.cosmetic;
  if (r.booster) out.booster = r.booster;
  if (r.freeze) out.freeze = r.freeze;
  if (r.bonusSpin) out.bonusSpin = true;
  return out;
}

function simulateMoneyCartRun(plan) {
  // Simulation simple inspirée: 3 tours minimum, multiplicateurs, symboles persistants
  const steps = 5;
  let multiplier = 1;
  let points = 0;
  const drops = [];
  let bonusSpin = false;
  const events = [];

  for (let i = 0; i < steps; i++) {
    const roll = Math.random();
    if (roll < 0.4) {
      // Épargneur: +X% du pot
      const gain = Math.round(50 * (1 + i * 0.2) * multiplier);
      points += gain;
      events.push({ step: i + 1, symbol: 'saver', gain, multiplier });
    } else if (roll < 0.6) {
      // Optimiseur: double le prochain
      multiplier *= 2;
      events.push({ step: i + 1, symbol: 'optimizer', multiplier });
    } else if (roll < 0.75) {
      // Collecteur: petit objet cosmétique
      const drop = { type: 'theme', id: i % 2 === 0 ? 'gradient' : 'aurora' };
      drops.push(drop);
      events.push({ step: i + 1, symbol: 'collector', drop, multiplier });
    } else if (roll < 0.9) {
      // Défenseur: protège (no-op mais pourrait empêcher un malus)
      // placeholder
      events.push({ step: i + 1, symbol: 'defender', multiplier });
    } else {
      // Bonus spin rare
      bonusSpin = bonusSpin || Math.random() < (plan === 'PRO' ? 0.4 : plan === 'PREMIUM' ? 0.2 : 0.1);
      events.push({ step: i + 1, symbol: 'bonusSpin', bonus: bonusSpin, multiplier });
    }
  }

  // Plan influence finale
  const planBonus = plan === 'PRO' ? 1.5 : plan === 'PREMIUM' ? 1.2 : 1.0;
  points = Math.round(points * planBonus);

  return {
    steps,
    multiplier,
    pointsEarned: points,
    inventoryDrops: drops,
    bonusSpin,
    events
  };
}

function baseShop() {
  return [
    { id: 'pack-1', kind: 'spinPack', label: 'Pack 5 spins', pricePoints: 400, payload: { spins: 5 } },
    { id: 'pack-2', kind: 'spinPack', label: 'Pack 15 spins', pricePoints: 1100, payload: { spins: 15 } },
    { id: 'pack-3', kind: 'spinPack', label: 'Pack 30 spins', pricePoints: 2000, payload: { spins: 30 } },
    { id: 'boost-10', kind: 'booster', label: 'Booster +10% (24h)', pricePoints: 600, payload: { missionBonusPct: 10, expiresInHours: 24 } },
    { id: 'boost-15', kind: 'booster', label: 'Booster +15% (24h)', pricePoints: 900, payload: { missionBonusPct: 15, expiresInHours: 24 } },
    { id: 'cos-aurora', kind: 'cosmetic', label: 'Thème Aurora', pricePoints: 800, payload: { id: 'premium-aurora' } },
    { id: 'cos-neon', kind: 'cosmetic', label: 'Thème Néon', pricePoints: 800, payload: { id: 'pro-neon' } },
  ];
}

function mergeInventory(existing, incoming) {
  const makeKey = (it) => `${it.type}:${it.id || JSON.stringify(it)}`;
  const result = [];
  const map = new Map();
  // seed from existing
  for (const it of existing) {
    const k = makeKey(it);
    const base = { ...it };
    base.qty = Math.max(1, Number(base.qty || 1));
    map.set(k, base);
  }
  // merge incoming
  for (const it of incoming) {
    const k = makeKey(it);
    if (map.has(k)) {
      const cur = map.get(k);
      cur.qty = Math.max(1, Number(cur.qty || 1)) + 1;
      map.set(k, cur);
    } else {
      map.set(k, { ...it, qty: 1 });
    }
  }
  // to array
  for (const v of map.values()) result.push(v);
  return result;
}

function addLog(existing, entry) {
  const arr = Array.isArray(existing) ? existing.slice(0, 19) : [];
  const withTs = { ts: new Date().toISOString(), ...entry };
  return [withTs, ...arr];
}


