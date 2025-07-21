// Configuration des optimisations de performance
export const PERFORMANCE_CONFIG = {
  // Cache et memoization
  CACHE: {
    MAX_SIZE: 100,
    TTL: 5 * 60 * 1000, // 5 minutes
    CLEANUP_INTERVAL: 2 * 60 * 1000 // 2 minutes
  },

  // Virtualisation
  VIRTUALIZATION: {
    ITEM_HEIGHT: 60,
    BUFFER_SIZE: 5,
    THRESHOLD: 100 // Nombre d'éléments avant activation de la virtualisation
  },

  // Debounce et throttling
  DEBOUNCE: {
    SAVE: 500,
    SEARCH: 300,
    SCROLL: 100
  },

  // Lazy loading
  LAZY_LOADING: {
    THRESHOLD: 0.1,
    ROOT_MARGIN: '50px'
  },

  // Animations
  ANIMATIONS: {
    DURATION: 300,
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Calculs optimisés
  CALCULATIONS: {
    BATCH_SIZE: 50,
    IDLE_TIMEOUT: 1000,
    PRIORITY_THRESHOLD: 0.8
  }
};

// Fonctions utilitaires pour les optimisations
export const PerformanceUtils = {
  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // RequestIdleCallback polyfill
  requestIdleCallback: (callback, options = {}) => {
    if (window.requestIdleCallback) {
      return window.requestIdleCallback(callback, options);
    }
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - performance.now()))
      });
    }, 1);
  },

  // Intersection Observer polyfill
  createIntersectionObserver: (callback, options = {}) => {
    if (window.IntersectionObserver) {
      return new IntersectionObserver(callback, options);
    }
    // Fallback simple
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    };
  },

  // Performance monitoring
  measurePerformance: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
    return result;
  },

  // Memory usage monitoring
  getMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
};

// Cache intelligent avec TTL
export class SmartCache {
  constructor(maxSize = PERFORMANCE_CONFIG.CACHE.MAX_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.timestamps = new Map();
  }

  set(key, value, ttl = PERFORMANCE_CONFIG.CACHE.TTL) {
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (timestamp && Date.now() > timestamp) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        this.delete(key);
      }
    }
    
    // Si encore trop d'éléments, supprimer les plus anciens
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.slice(0, Math.floor(this.maxSize / 2)).forEach(([key]) => {
        this.delete(key);
      });
    }
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

// Instance globale du cache
export const globalCache = new SmartCache();

// Optimisations pour React
export const ReactOptimizations = {
  // Memoization helper
  memoize: (fn, deps) => {
    let lastDeps = null;
    let lastResult = null;
    
    return (...args) => {
      const currentDeps = deps ? deps(...args) : args;
      
      if (lastDeps && JSON.stringify(lastDeps) === JSON.stringify(currentDeps)) {
        return lastResult;
      }
      
      lastDeps = currentDeps;
      lastResult = fn(...args);
      return lastResult;
    };
  },

  // Component memoization
  memoizeComponent: (Component, propsAreEqual) => {
    return React.memo(Component, propsAreEqual);
  },

  // Callback optimization
  useCallbackOptimized: (callback, deps) => {
    return useCallback(callback, deps);
  },

  // Memo optimization
  useMemoOptimized: (factory, deps) => {
    return useMemo(factory, deps);
  }
};

export default PERFORMANCE_CONFIG; 