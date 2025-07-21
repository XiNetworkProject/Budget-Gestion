// Configuration d'environnement pour les optimisations
export const ENV_CONFIG = {
  // Optimisations de performance
  ENABLE_CACHE: import.meta.env.VITE_ENABLE_CACHE !== 'false',
  VIRTUALIZATION_THRESHOLD: parseInt(import.meta.env.VITE_VIRTUALIZATION_THRESHOLD) || 100,
  DEBOUNCE_DELAY: parseInt(import.meta.env.VITE_DEBOUNCE_DELAY) || 500,
  ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false',
  ENABLE_LAZY_LOADING: import.meta.env.VITE_ENABLE_LAZY_LOADING !== 'false',
  ENABLE_MEMOIZATION: import.meta.env.VITE_ENABLE_MEMOIZATION !== 'false',

  // Configuration des graphiques
  CHART_ANIMATION_DURATION: parseInt(import.meta.env.VITE_CHART_ANIMATION_DURATION) || 300,
  CHART_LAZY_LOAD_DELAY: parseInt(import.meta.env.VITE_CHART_LAZY_LOAD_DELAY) || 200,

  // Configuration du cache
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL) || 300000, // 5 minutes
  CACHE_MAX_SIZE: parseInt(import.meta.env.VITE_CACHE_MAX_SIZE) || 100,
  CACHE_CLEANUP_INTERVAL: parseInt(import.meta.env.VITE_CACHE_CLEANUP_INTERVAL) || 120000, // 2 minutes

  // Configuration des animations
  ANIMATION_DURATION: parseInt(import.meta.env.VITE_ANIMATION_DURATION) || 300,
  ANIMATION_EASING: import.meta.env.VITE_ANIMATION_EASING || 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Configuration de la virtualisation
  VIRTUALIZATION_ITEM_HEIGHT: parseInt(import.meta.env.VITE_VIRTUALIZATION_ITEM_HEIGHT) || 60,
  VIRTUALIZATION_BUFFER_SIZE: parseInt(import.meta.env.VITE_VIRTUALIZATION_BUFFER_SIZE) || 5,

  // Configuration des calculs
  CALCULATION_BATCH_SIZE: parseInt(import.meta.env.VITE_CALCULATION_BATCH_SIZE) || 50,
  CALCULATION_IDLE_TIMEOUT: parseInt(import.meta.env.VITE_CALCULATION_IDLE_TIMEOUT) || 1000,
  CALCULATION_PRIORITY_THRESHOLD: parseFloat(import.meta.env.VITE_CALCULATION_PRIORITY_THRESHOLD) || 0.8,

  // Configuration des notifications
  TOAST_DURATION: parseInt(import.meta.env.VITE_TOAST_DURATION) || 4000,
  TOAST_POSITION: import.meta.env.VITE_TOAST_POSITION || 'bottom-right',

  // Configuration du monitoring
  PERFORMANCE_MONITORING_INTERVAL: parseInt(import.meta.env.VITE_PERFORMANCE_MONITORING_INTERVAL) || 30000,
  MEMORY_MONITORING_ENABLED: import.meta.env.VITE_MEMORY_MONITORING_ENABLED !== 'false',
  RENDER_MONITORING_ENABLED: import.meta.env.VITE_RENDER_MONITORING_ENABLED !== 'false',

  // Mode développement
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,

  // Configuration API
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',

  // Configuration des fonctionnalités
  ENABLE_AI_FEATURES: import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false',
  ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE !== 'false',
  ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA !== 'false'
};

// Fonction pour vérifier si une fonctionnalité est activée
export const isFeatureEnabled = (feature) => {
  return ENV_CONFIG[`ENABLE_${feature.toUpperCase()}`] !== false;
};

// Fonction pour obtenir la configuration d'une fonctionnalité
export const getFeatureConfig = (feature) => {
  const config = {};
  Object.keys(ENV_CONFIG).forEach(key => {
    if (key.startsWith(feature.toUpperCase())) {
      config[key] = ENV_CONFIG[key];
    }
  });
  return config;
};

// Configuration par défaut pour le développement
export const DEV_CONFIG = {
  ...ENV_CONFIG,
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_MEMORY_MONITORING: true,
  ENABLE_RENDER_MONITORING: true,
  CACHE_TTL: 60000, // 1 minute en développement
  CHART_ANIMATION_DURATION: 100, // Plus rapide en développement
  DEBOUNCE_DELAY: 100 // Plus réactif en développement
};

// Configuration pour la production
export const PROD_CONFIG = {
  ...ENV_CONFIG,
  ENABLE_PERFORMANCE_MONITORING: false,
  ENABLE_MEMORY_MONITORING: false,
  ENABLE_RENDER_MONITORING: false,
  CACHE_TTL: 300000, // 5 minutes en production
  CHART_ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500
};

// Configuration active selon l'environnement
export const ACTIVE_CONFIG = ENV_CONFIG.IS_DEVELOPMENT ? DEV_CONFIG : PROD_CONFIG;

export default ENV_CONFIG; 