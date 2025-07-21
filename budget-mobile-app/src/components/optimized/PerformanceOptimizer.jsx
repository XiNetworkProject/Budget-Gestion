import React, { memo, useMemo, useCallback } from 'react';
import { useStore } from '../../store';

// Hook personnalisé pour optimiser les sélecteurs du store
export const useOptimizedStore = (selector, deps = []) => {
  return useStore(useCallback(selector, deps));
};

// Composant de base optimisé avec React.memo
export const OptimizedComponent = memo(({ children, ...props }) => {
  return <div {...props}>{children}</div>;
});

// Hook pour la virtualisation des listes
export const useVirtualization = (items, itemHeight, containerHeight) => {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(window.scrollY / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, items.length);
    
    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight]);
};

// Hook pour le debounce des actions
export const useDebounce = (callback, delay) => {
  const timeoutRef = React.useRef();
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Hook pour la gestion des animations
export const useAnimation = (initialState = false) => {
  const [isAnimating, setIsAnimating] = React.useState(initialState);
  
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);
  
  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);
  
  return { isAnimating, startAnimation, stopAnimation };
};

// Composant de cache pour les calculs coûteux
export const CachedCalculation = memo(({ calculation, deps, children }) => {
  const result = useMemo(() => calculation(), deps);
  return children(result);
});

// Hook pour la gestion des erreurs avec retry
export const useRetry = (callback, maxRetries = 3, delay = 1000) => {
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);
  
  const executeWithRetry = useCallback(async (...args) => {
    try {
      setIsRetrying(true);
      const result = await callback(...args);
      setRetryCount(0);
      setIsRetrying(false);
      return result;
    } catch (error) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, delay * (retryCount + 1)));
        return executeWithRetry(...args);
      } else {
        setIsRetrying(false);
        throw error;
      }
    }
  }, [callback, maxRetries, delay, retryCount]);
  
  return { executeWithRetry, isRetrying, retryCount };
};

// Composant de lazy loading
export const LazyComponent = React.lazy(({ component }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ default: component });
    }, 100);
  });
});

// Hook pour la gestion du cache local
export const useLocalCache = (key, defaultValue = null) => {
  const [value, setValue] = React.useState(() => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  
  const updateValue = useCallback((newValue) => {
    setValue(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch {
      // Ignore les erreurs de localStorage
    }
  }, [key]);
  
  return [value, updateValue];
};

// Composant de préchargement
export const Preloader = memo(({ onLoad, children }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      onLoad?.();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [onLoad]);
  
  if (!isLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100px' 
      }}>
        <div>Chargement...</div>
      </div>
    );
  }
  
  return children;
});

// Hook pour la gestion des intersections (lazy loading)
export const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);
  
  return isIntersecting;
};

// Composant de gestion des erreurs
export const ErrorBoundary = React.memo(({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    const handleError = (error) => {
      console.error('Error caught by boundary:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return fallback || <div>Une erreur est survenue</div>;
  }
  
  return children;
});

export default {
  useOptimizedStore,
  OptimizedComponent,
  useVirtualization,
  useDebounce,
  useAnimation,
  CachedCalculation,
  useRetry,
  LazyComponent,
  useLocalCache,
  Preloader,
  useIntersectionObserver,
  ErrorBoundary
}; 