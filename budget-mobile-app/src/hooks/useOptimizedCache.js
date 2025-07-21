import { useRef, useCallback, useMemo } from 'react';

// Cache intelligent avec TTL (Time To Live)
class SmartCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
  }

  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    
    const timestamp = this.timestamps.get(key);
    if (Date.now() > timestamp) {
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Nettoyage automatique des entrées expirées
  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        this.delete(key);
      }
    }
  }
}

// Cache global pour l'application
const globalCache = new SmartCache();

// Hook pour utiliser le cache intelligent
export const useSmartCache = () => {
  const cacheRef = useRef(globalCache);

  const getCached = useCallback((key) => {
    return cacheRef.current.get(key);
  }, []);

  const setCached = useCallback((key, value, ttl) => {
    cacheRef.current.set(key, value, ttl);
  }, []);

  const invalidateCache = useCallback((pattern) => {
    if (pattern) {
      // Invalider par pattern (ex: "budget-*")
      for (const key of cacheRef.current.cache.keys()) {
        if (key.includes(pattern.replace('*', ''))) {
          cacheRef.current.delete(key);
        }
      }
    } else {
      cacheRef.current.clear();
    }
  }, []);

  return { getCached, setCached, invalidateCache };
};

// Hook pour les calculs coûteux avec cache
export const useCachedCalculation = (key, calculation, dependencies, ttl = 5 * 60 * 1000) => {
  const { getCached, setCached } = useSmartCache();

  return useMemo(() => {
    // Essayer de récupérer du cache
    const cached = getCached(key);
    if (cached !== null) {
      return cached;
    }

    // Calculer et mettre en cache
    const result = calculation();
    setCached(key, result, ttl);
    return result;
  }, dependencies);
};

// Hook pour les données avec cache et fallback
export const useCachedData = (key, fetchFunction, dependencies, ttl = 10 * 60 * 1000) => {
  const { getCached, setCached } = useSmartCache();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Essayer le cache d'abord
      const cached = getCached(key);
      if (cached !== null) {
        setData(cached);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchFunction();
        setData(result);
        setCached(key, result, ttl);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
};

// Hook pour optimiser les listes longues
export const useVirtualizedList = (items, itemHeight = 60, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      virtualIndex: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    containerStyle: {
      height: containerHeight,
      overflow: 'auto',
      position: 'relative'
    }
  };
};

// Hook pour la debounce optimisée
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook pour la throttle optimisée
export const useThrottle = (callback, delay = 100) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Nettoyage automatique du cache toutes les 10 minutes
setInterval(() => {
  globalCache.cleanup();
}, 10 * 60 * 1000); 