const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
let API_BASE = API_ORIGIN;
try {
  if (typeof window !== 'undefined' && API_BASE) {
    const configured = new URL(API_BASE, window.location.origin);
    if (configured.origin !== window.location.origin) {
      console.warn('[API] VITE_API_URL cross-origin, fallback to relative /api');
      API_BASE = '';
    }
  }
} catch (_) { API_BASE = ''; }

const buildApiUrl = (path, query) => {
  const base = API_BASE ? `${API_BASE}${path}` : `${path}`;
  if (query && Object.keys(query).length > 0) {
    const qs = new URLSearchParams(query).toString();
    return `${base}?${qs}`;
  }
  return base;
};

export const gamificationService = {
  async getState(userId) {
    const url = buildApiUrl('/api/gamification', { userId });
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error('Erreur récupération gamification');
    const json = await res.json();
    return json.gamification || null;
  },

  async spin(userId) {
    const url = buildApiUrl('/api/gamification');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'spin', userId })
    });
    if (!res.ok) throw new Error('Spin indisponible');
    return res.json();
  },

  async grantSpin(userId, amount = 1) {
    const url = buildApiUrl('/api/gamification');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'grantSpin', userId, amount })
    });
    if (!res.ok) throw new Error('Impossible de créditer un spin');
    return res.json();
  },

  async getRewardsCatalog() {
    const url = buildApiUrl('/api/gamification');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getRewards' })
    });
    if (!res.ok) throw new Error('Erreur catalogue');
    return res.json();
  }
};


