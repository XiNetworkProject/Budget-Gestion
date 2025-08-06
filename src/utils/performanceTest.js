// Utilitaire de test de performance
export class PerformanceTester {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  // Mesurer le temps d'exécution d'une fonction
  measureExecutionTime(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    this.metrics.set(name, {
      type: 'execution',
      duration,
      timestamp: Date.now()
    });
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }

  // Mesurer l'utilisation mémoire
  measureMemoryUsage(name) {
    if (performance.memory) {
      const memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
      
      this.metrics.set(name, {
        type: 'memory',
        ...memory,
        timestamp: Date.now()
      });
      
      console.log(`🧠 ${name}:`, {
        used: `${(memory.used / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.total / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.limit / 1024 / 1024).toFixed(2)}MB`
      });
      
      return memory;
    }
    return null;
  }

  // Mesurer les re-renders d'un composant
  measureRenders(componentName, renderCount) {
    this.metrics.set(`${componentName}_renders`, {
      type: 'renders',
      count: renderCount,
      timestamp: Date.now()
    });
    
    console.log(`🔄 ${componentName}: ${renderCount} re-renders`);
  }

  // Mesurer le temps de chargement
  measureLoadTime(name) {
    const loadTime = performance.now() - this.startTime;
    
    this.metrics.set(name, {
      type: 'load',
      duration: loadTime,
      timestamp: Date.now()
    });
    
    console.log(`📦 ${name}: ${loadTime.toFixed(2)}ms`);
    return loadTime;
  }

  // Générer un rapport de performance
  generateReport() {
    const report = {
      timestamp: Date.now(),
      totalDuration: performance.now() - this.startTime,
      metrics: Array.from(this.metrics.entries()).map(([name, data]) => ({
        name,
        ...data
      })),
      summary: this.generateSummary()
    };
    
    console.log('📊 RAPPORT DE PERFORMANCE:', report);
    return report;
  }

  // Générer un résumé
  generateSummary() {
    const executionTimes = Array.from(this.metrics.values())
      .filter(m => m.type === 'execution')
      .map(m => m.duration);
    
    const memoryUsage = Array.from(this.metrics.values())
      .filter(m => m.type === 'memory')
      .map(m => m.used);
    
    const renderCounts = Array.from(this.metrics.values())
      .filter(m => m.type === 'renders')
      .map(m => m.count);
    
    return {
      avgExecutionTime: executionTimes.length > 0 
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length 
        : 0,
      maxExecutionTime: executionTimes.length > 0 
        ? Math.max(...executionTimes) 
        : 0,
      avgMemoryUsage: memoryUsage.length > 0 
        ? memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length 
        : 0,
      totalRenders: renderCounts.reduce((a, b) => a + b, 0),
      totalMetrics: this.metrics.size
    };
  }

  // Exporter les métriques
  exportMetrics() {
    return {
      metrics: Array.from(this.metrics.entries()),
      report: this.generateReport()
    };
  }

  // Nettoyer les métriques
  clear() {
    this.metrics.clear();
    this.startTime = performance.now();
  }
}

// Hook React pour mesurer les performances
export const usePerformanceMonitor = (componentName) => {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    setLastRenderTime(performance.now());
  });

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} rendered ${renderCount} times`);
    }
  }, [renderCount, componentName]);

  return { renderCount, lastRenderTime };
};

// Fonction utilitaire pour mesurer les performances d'une fonction
export const measurePerformance = (name, fn) => {
  const tester = new PerformanceTester();
  return tester.measureExecutionTime(name, fn);
};

// Fonction utilitaire pour mesurer l'utilisation mémoire
export const measureMemory = (name) => {
  const tester = new PerformanceTester();
  return tester.measureMemoryUsage(name);
};

// Fonction utilitaire pour comparer les performances
export const comparePerformance = (testName, functions) => {
  const tester = new PerformanceTester();
  const results = {};
  
  Object.entries(functions).forEach(([name, fn]) => {
    results[name] = tester.measureExecutionTime(`${testName}_${name}`, fn);
  });
  
  const report = tester.generateReport();
  console.log(`🏁 Comparaison ${testName}:`, results);
  
  return { results, report };
};

// Fonction utilitaire pour tester les performances de rendu
export const testRenderPerformance = (component, props, iterations = 100) => {
  const tester = new PerformanceTester();
  
  console.log(`🎭 Test de rendu: ${iterations} itérations`);
  
  for (let i = 0; i < iterations; i++) {
    tester.measureExecutionTime(`render_${i}`, () => {
      // Simuler un rendu
      return component(props);
    });
  }
  
  const report = tester.generateReport();
  console.log(`📊 Performance de rendu:`, report.summary);
  
  return report;
};

// Fonction utilitaire pour analyser les performances de l'application
export const analyzeAppPerformance = () => {
  const tester = new PerformanceTester();
  
  // Mesurer le temps de chargement initial
  tester.measureLoadTime('initial_load');
  
  // Mesurer l'utilisation mémoire
  tester.measureMemoryUsage('initial_memory');
  
  // Mesurer les performances de navigation
  if (window.performance && window.performance.navigation) {
    const navigation = window.performance.navigation;
    console.log(`🧭 Navigation type: ${navigation.type}`);
    console.log(`🔄 Redirects: ${navigation.redirectCount}`);
  }
  
  // Mesurer les ressources chargées
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    const totalSize = resources.reduce((sum, resource) => sum + resource.transferSize, 0);
    console.log(`📦 Resources loaded: ${resources.length}`);
    console.log(`💾 Total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  }
  
  return tester.generateReport();
};

// Instance globale pour le monitoring
export const globalPerformanceTester = new PerformanceTester();

// Fonction pour démarrer le monitoring automatique
export const startPerformanceMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Démarrage du monitoring de performance');
    
    // Monitorer les performances au chargement
    window.addEventListener('load', () => {
      setTimeout(() => {
        analyzeAppPerformance();
      }, 1000);
    });
    
    // Monitorer les performances périodiquement
    setInterval(() => {
      globalPerformanceTester.measureMemoryUsage('periodic_memory');
    }, 30000); // Toutes les 30 secondes
  }
};

export default PerformanceTester; 