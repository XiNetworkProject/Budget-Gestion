// Configuration des optimisations de performance
export const PERFORMANCE_CONFIG = {
  // Debounce pour les sauvegardes
  SAVE_DEBOUNCE_MS: 500,
  
  // Cache des calculs coûteux
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  
  // Virtualisation des listes
  VIRTUALIZATION: {
    ITEM_HEIGHT: 60,
    BUFFER_SIZE: 5
  },
  
  // Animations
  ANIMATIONS: {
    DURATION: 300,
    STAGGER_DELAY: 100
  },
  
  // Lazy loading
  LAZY_LOADING: {
    THRESHOLD: 0.1,
    ROOT_MARGIN: '50px'
  }
};

// Configuration des fonctionnalités IA
export const AI_CONFIG = {
  // Seuils pour les recommandations
  THRESHOLDS: {
    SAVINGS_RATE_WARNING: 10, // %
    SAVINGS_RATE_EXCELLENT: 20, // %
    EXPENSE_CATEGORY_DOMINANT: 30, // %
    MIN_TRANSACTIONS_FOR_ANALYSIS: 5
  },
  
  // Types de recommandations
  RECOMMENDATION_TYPES: {
    WARNING: 'warning',
    SUCCESS: 'success',
    INFO: 'info',
    TIP: 'tip'
  },
  
  // Priorités des recommandations
  PRIORITIES: {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  }
};

// Configuration de la gamification
export const GAMIFICATION_CONFIG = {
  // XP par action
  XP_REWARDS: {
    SAVINGS_PER_10_EUR: 1,
    SAVINGS_RATE_10_PERCENT: 50,
    SAVINGS_RATE_20_PERCENT: 100,
    TRANSACTIONS_PER_5: 1,
    SAVINGS_GOAL: 25,
    DAILY_LOGIN: 5
  },
  
  // Niveaux
  LEVELS: {
    XP_PER_LEVEL: 100,
    MAX_LEVEL: 100
  },
  
  // Badges
  BADGES: {
    SAVER: {
      id: 'saver',
      name: 'Épargnant',
      description: 'A économisé de l\'argent ce mois-ci',
      xpReward: 10
    },
    SMART_SAVER: {
      id: 'smart_saver',
      name: 'Épargnant Intelligent',
      description: 'Taux d\'épargne de 10% ou plus',
      xpReward: 25
    },
    EXPERT_SAVER: {
      id: 'expert_saver',
      name: 'Expert Épargnant',
      description: 'Taux d\'épargne de 20% ou plus',
      xpReward: 50
    },
    ACTIVE_USER: {
      id: 'active_user',
      name: 'Utilisateur Actif',
      description: '10 transactions ou plus',
      xpReward: 15
    },
    GOAL_SETTER: {
      id: 'goal_setter',
      name: 'Définisseur d\'Objectifs',
      description: 'A créé au moins un objectif d\'épargne',
      xpReward: 20
    }
  }
};

// Configuration de l'interface utilisateur
export const UI_CONFIG = {
  // Thèmes
  THEMES: {
    LIGHT: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      background: '#f8fafc',
      surface: '#ffffff',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0a',
      info: '#3b82f6'
    },
    DARK: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      error: '#f87171',
      success: '#34d399',
      warning: '#fbbf24',
      info: '#60a5fa'
    }
  },
  
  // Animations
  TRANSITIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  
  // Espacements
  SPACING: {
    COMPACT: 1,
    NORMAL: 2,
    RELAXED: 3
  },
  
  // Bordures
  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12,
    XLARGE: 16
  }
};

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  // Durées
  DURATIONS: {
    SHORT: 2000,
    NORMAL: 4000,
    LONG: 6000
  },
  
  // Positions
  POSITIONS: {
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right'
  },
  
  // Types
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  }
};

// Configuration du cache
export const CACHE_CONFIG = {
  // Clés de cache
  KEYS: {
    USER_DATA: 'user_data',
    BUDGET_DATA: 'budget_data',
    SETTINGS: 'app_settings',
    THEME: 'app_theme',
    LANGUAGE: 'app_language'
  },
  
  // Durées de cache
  DURATIONS: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 heures
    PERMANENT: null // Pas d'expiration
  }
};

// Configuration des optimisations React
export const REACT_OPTIMIZATIONS = {
  // Memoization
  MEMOIZATION: {
    ENABLED: true,
    DEPENDENCIES_CHECK: true
  },
  
  // Lazy loading
  LAZY_LOADING: {
    ENABLED: true,
    PRELOAD_THRESHOLD: 0.1
  },
  
  // Virtualization
  VIRTUALIZATION: {
    ENABLED: true,
    MIN_ITEMS_FOR_VIRTUALIZATION: 50
  },
  
  // Error boundaries
  ERROR_BOUNDARIES: {
    ENABLED: true,
    FALLBACK_UI: true
  }
};

// Configuration des métriques de performance
export const METRICS_CONFIG = {
  // Métriques à tracker
  TRACKED_METRICS: [
    'first-contentful-paint',
    'largest-contentful-paint',
    'first-input-delay',
    'cumulative-layout-shift'
  ],
  
  // Seuils de performance
  THRESHOLDS: {
    GOOD: {
      FCP: 1800,
      LCP: 2500,
      FID: 100,
      CLS: 0.1
    },
    NEEDS_IMPROVEMENT: {
      FCP: 3000,
      LCP: 4000,
      FID: 300,
      CLS: 0.25
    }
  }
};

export default {
  PERFORMANCE_CONFIG,
  AI_CONFIG,
  GAMIFICATION_CONFIG,
  UI_CONFIG,
  NOTIFICATION_CONFIG,
  CACHE_CONFIG,
  REACT_OPTIMIZATIONS,
  METRICS_CONFIG
}; 