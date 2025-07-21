import React, { memo, useState, useEffect, useCallback, Suspense } from 'react';
import { Box, Typography, Skeleton, Paper } from '@mui/material';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Legend,
  ArcElement,
  Tooltip,
  Filler
} from 'chart.js';

// Enregistrer les composants Chart.js une seule fois
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Legend,
  ArcElement,
  Tooltip,
  Filler
);

// Composant de chargement pour les graphiques
const ChartSkeleton = ({ height = 350 }) => (
  <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box sx={{ textAlign: 'center' }}>
      <Skeleton variant="rectangular" width={300} height={200} sx={{ borderRadius: 2, mb: 2 }} />
      <Skeleton variant="text" width={200} sx={{ mx: 'auto' }} />
      <Skeleton variant="text" width={150} sx={{ mx: 'auto' }} />
    </Box>
  </Box>
);

// Graphique en ligne optimisé
const OptimizedLineChart = memo(({ 
  data, 
  title, 
  height = 350, 
  loading = false,
  options = {},
  onDataPointClick
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255,255,255,0.8)',
          font: {
            size: 12
          },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.y.toLocaleString()}€`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255,255,255,0.1)'
        },
        ticks: {
          color: 'rgba(255,255,255,0.7)'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255,255,255,0.1)'
        },
        ticks: {
          color: 'rgba(255,255,255,0.7)',
          callback: function(value) {
            return value.toLocaleString() + '€';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 2
      },
      line: {
        tension: 0.4,
        borderWidth: 3
      }
    },
    onClick: onDataPointClick
  };

  if (loading) {
    return <ChartSkeleton height={height} />;
  }

  if (!isVisible) {
    return <ChartSkeleton height={height} />;
  }

  return (
    <Box sx={{ height, position: 'relative' }}>
      {title && (
        <Typography variant="h6" sx={{ 
          mb: 2, 
          fontWeight: 600,
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {title}
        </Typography>
      )}
      <Line data={data} options={{ ...defaultOptions, ...options }} />
    </Box>
  );
});

// Graphique en camembert optimisé
const OptimizedDoughnutChart = memo(({ 
  data, 
  title, 
  height = 350, 
  loading = false,
  options = {},
  onSegmentClick
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255,255,255,0.8)',
          font: {
            size: 12
          },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toLocaleString()}€ (${percentage}%)`;
          }
        }
      }
    },
    onClick: onSegmentClick,
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.1)'
      }
    }
  };

  if (loading) {
    return <ChartSkeleton height={height} />;
  }

  if (!isVisible) {
    return <ChartSkeleton height={height} />;
  }

  return (
    <Box sx={{ height, position: 'relative' }}>
      {title && (
        <Typography variant="h6" sx={{ 
          mb: 2, 
          fontWeight: 600,
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {title}
        </Typography>
      )}
      <Doughnut data={data} options={{ ...defaultOptions, ...options }} />
    </Box>
  );
});

// Composant wrapper pour les graphiques avec lazy loading
const LazyChart = ({ children, fallback = <ChartSkeleton /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Hook personnalisé pour optimiser les données de graphiques
export const useChartData = (rawData, type = 'line') => {
  const [optimizedData, setOptimizedData] = useState(null);

  useEffect(() => {
    if (!rawData) return;

    // Utiliser requestIdleCallback pour optimiser les calculs
    const optimizeData = () => {
      try {
        let optimized;
        
        if (type === 'line') {
          optimized = {
            ...rawData,
            datasets: rawData.datasets.map(dataset => ({
              ...dataset,
              fill: dataset.fill !== undefined ? dataset.fill : false,
              tension: dataset.tension !== undefined ? dataset.tension : 0.4
            }))
          };
        } else if (type === 'doughnut') {
          optimized = {
            ...rawData,
            datasets: rawData.datasets.map(dataset => ({
              ...dataset,
              backgroundColor: dataset.backgroundColor || [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
              ]
            }))
          };
        }

        setOptimizedData(optimized);
      } catch (error) {
        console.error('Erreur lors de l\'optimisation des données de graphique:', error);
        setOptimizedData(rawData);
      }
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(optimizeData, { timeout: 1000 });
    } else {
      setTimeout(optimizeData, 0);
    }
  }, [rawData, type]);

  return optimizedData;
};

// Composant principal pour les graphiques financiers
const FinancialCharts = memo(({ 
  lineData, 
  doughnutData, 
  loading = false,
  onLineClick,
  onDoughnutClick
}) => {
  const optimizedLineData = useChartData(lineData, 'line');
  const optimizedDoughnutData = useChartData(doughnutData, 'doughnut');

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      <Paper sx={{ 
        flex: 2,
        p: 3,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }
      }}>
        <LazyChart>
          <OptimizedLineChart
            data={optimizedLineData}
            title="Évolution financière"
            loading={loading}
            onDataPointClick={onLineClick}
          />
        </LazyChart>
      </Paper>

      <Paper sx={{ 
        flex: 1,
        p: 3,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }
      }}>
        <LazyChart>
          <OptimizedDoughnutChart
            data={optimizedDoughnutData}
            title="Répartition des dépenses"
            loading={loading}
            onSegmentClick={onDoughnutClick}
          />
        </LazyChart>
      </Paper>
    </Box>
  );
});

OptimizedLineChart.displayName = 'OptimizedLineChart';
OptimizedDoughnutChart.displayName = 'OptimizedDoughnutChart';
FinancialCharts.displayName = 'FinancialCharts';

export {
  OptimizedLineChart,
  OptimizedDoughnutChart,
  FinancialCharts,
  LazyChart,
  ChartSkeleton
};

export default FinancialCharts; 