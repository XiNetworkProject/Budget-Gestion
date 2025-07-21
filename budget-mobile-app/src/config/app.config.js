// Configuration centralisée de l'application
export const APP_CONFIG = {
  // Informations de l'application
  APP_INFO: {
    name: 'Budget Gestion',
    version: '2.1.0',
    description: 'Application moderne de gestion de budget avec IA et gamification',
    author: 'Budget Gestion Team'
  },

  // Configuration des fonctionnalités
  FEATURES: {
    AI: {
      enabled: true,
      analysisLevel: 'full', // 'basic', 'partial', 'full'
      threshold: 10,
      recommendations: true,
      predictions: true
    },
    GAMIFICATION: {
      enabled: true,
      xpMultiplier: 1,
      dailyRewards: true,
      badges: true,
      levels: true
    },
    NOTIFICATIONS: {
      enabled: true,
      duration: 4000,
      position: 'bottom-right',
      sound: false
    },
    CACHE: {
      enabled: true,
      duration: 5 * 60 * 1000, // 5 minutes
      maxSize: 50 * 1024 * 1024 // 50MB
    },
    ANALYTICS: {
      enabled: true,
      performanceMonitoring: true,
      userBehavior: true
    }
  },

  // Configuration des thèmes
  THEMES: {
    LIGHT: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280'
    },
    DARK: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8'
    }
  },

  // Configuration des animations
  ANIMATIONS: {
    enabled: true,
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    staggerDelay: 100
  },

  // Configuration des plans d'abonnement
  SUBSCRIPTION_PLANS: {
    FREE: {
      id: 'free',
      name: 'Gratuit',
      price: 0,
      features: {
        maxTransactions: 100,
        unlimitedCategories: true,
        maxSavingsGoals: 2,
        basicAnalytics: true,
        aiAnalysis: false,
        maxActionPlans: 0,
        multipleAccounts: false,
        prioritySupport: false,
        advancedReports: false
      }
    },
    PREMIUM: {
      id: 'premium',
      name: 'Premium',
      price: 1.99,
      features: {
        maxTransactions: -1,
        unlimitedCategories: true,
        maxSavingsGoals: -1,
        basicAnalytics: true,
        aiAnalysis: 'partial',
        maxActionPlans: 1,
        multipleAccounts: false,
        prioritySupport: false,
        advancedReports: false
      }
    },
    PRO: {
      id: 'pro',
      name: 'Pro',
      price: 5.99,
      features: {
        maxTransactions: -1,
        unlimitedCategories: true,
        maxSavingsGoals: -1,
        basicAnalytics: true,
        aiAnalysis: 'full',
        maxActionPlans: -1,
        multipleAccounts: true,
        prioritySupport: true,
        advancedReports: true
      }
    }
  },

  // Configuration des limites
  LIMITS: {
    MAX_TRANSACTIONS_FREE: 100,
    MAX_CATEGORIES: 50,
    MAX_SAVINGS_GOALS_FREE: 2,
    MAX_ACTION_PLANS_FREE: 0,
    MAX_BANK_ACCOUNTS_FREE: 1
  },

  // Configuration des métriques
  METRICS: {
    SAVINGS_RATE_WARNING: 10, // %
    SAVINGS_RATE_EXCELLENT: 20, // %
    EXPENSE_CATEGORY_DOMINANT: 30, // %
    MIN_TRANSACTIONS_FOR_ANALYSIS: 5
  },

  // Configuration des notifications système
  SYSTEM_NOTIFICATIONS: [
    {
      id: 'welcome',
      type: 'success',
      title: 'Bienvenue !',
      message: 'Votre application est prête à l\'emploi.',
      showOnFirstVisit: true
    },
    {
      id: 'optimization',
      type: 'info',
      title: 'Optimisations activées',
      message: 'Les nouvelles fonctionnalités sont maintenant disponibles.',
      showOnUpdate: true
    },
    {
      id: 'ai_assistant',
      type: 'info',
      title: 'Assistant IA disponible',
      message: 'Obtenez des conseils personnalisés pour optimiser votre budget.',
      showOnFeatureUnlock: true
    }
  ],

  // Configuration des erreurs
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
    AUTH_ERROR: 'Erreur d\'authentification. Veuillez vous reconnecter.',
    SAVE_ERROR: 'Erreur de sauvegarde. Vos données sont sauvegardées localement.',
    LOAD_ERROR: 'Erreur de chargement. Utilisation des données locales.',
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.'
  },

  // Configuration des raccourcis clavier
  KEYBOARD_SHORTCUTS: {
    ADD_EXPENSE: 'e',
    ADD_INCOME: 'i',
    QUICK_ADD: 'a',
    NAVIGATE_HOME: 'h',
    NAVIGATE_ANALYTICS: 'g',
    NAVIGATE_SETTINGS: 's',
    TOGGLE_THEME: 't'
  }
};

// Configuration de développement
export const DEV_CONFIG = {
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  ENABLE_HOT_RELOAD: process.env.NODE_ENV === 'development',
  SHOW_PERFORMANCE_METRICS: process.env.NODE_ENV === 'development'
};

// Configuration de production
export const PROD_CONFIG = {
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_TRACKING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  CACHE_STRATEGY: 'aggressive',
  COMPRESSION_ENABLED: true
};

export default {
  APP_CONFIG,
  DEV_CONFIG,
  PROD_CONFIG
}; 