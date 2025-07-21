import { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../store';

// Cache pour les calculs coûteux
const calculationCache = new Map();

// Fonction utilitaire pour créer une clé de cache
const createCacheKey = (data, params) => {
  return JSON.stringify({ data: data.slice(0, 10), params });
};

// Fonction utilitaire pour nettoyer le cache
const cleanupCache = () => {
  if (calculationCache.size > 100) {
    const keys = Array.from(calculationCache.keys());
    keys.slice(0, 50).forEach(key => calculationCache.delete(key));
  }
};

export const useOptimizedData = () => {
  const store = useStore();
  const [optimizedData, setOptimizedData] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Fonction optimisée pour calculer les données du mois sélectionné
  const calculateSelectedMonthData = useCallback((expenses, incomeTransactions, selectedMonth, selectedYear) => {
    const cacheKey = createCacheKey(expenses, { selectedMonth, selectedYear });
    
    if (calculationCache.has(cacheKey)) {
      return calculationCache.get(cacheKey);
    }

    const isDateInSelectedMonth = (dateString) => {
      if (!dateString) return false;
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return false;
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      } catch (error) {
        return false;
      }
    };

    const selectedMonthExpenses = expenses
      .filter(e => isDateInSelectedMonth(e.date))
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const selectedMonthIncome = incomeTransactions
      .filter(t => isDateInSelectedMonth(t.date))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const selectedMonthSaved = selectedMonthIncome - selectedMonthExpenses;

    const result = {
      expenses: selectedMonthExpenses,
      income: selectedMonthIncome,
      saved: selectedMonthSaved,
      transactions: [
        ...incomeTransactions.filter(t => isDateInSelectedMonth(t.date)),
        ...expenses.filter(e => isDateInSelectedMonth(e.date))
      ].sort((a, b) => new Date(b.date) - new Date(a.date))
    };

    calculationCache.set(cacheKey, result);
    cleanupCache();
    
    return result;
  }, []);

  // Fonction optimisée pour calculer les prévisions
  const calculateForecast = useCallback((expenses, incomeTransactions, selectedMonth, selectedYear) => {
    const cacheKey = createCacheKey([...expenses, ...incomeTransactions], { selectedMonth, selectedYear, type: 'forecast' });
    
    if (calculationCache.has(cacheKey)) {
      return calculationCache.get(cacheKey);
    }

    const getMonthData = (monthOffset) => {
      const targetDate = new Date(selectedYear, selectedMonth - monthOffset, 1);
      const isDateInMonth = (dateString) => {
        if (!dateString) return false;
        try {
          const date = new Date(dateString);
          return date.getMonth() === targetDate.getMonth() && date.getFullYear() === targetDate.getFullYear();
        } catch (error) {
          return false;
        }
      };

      const monthExpenses = expenses
        .filter(e => isDateInMonth(e.date))
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const monthIncome = incomeTransactions
        .filter(t => isDateInMonth(t.date))
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      return { expenses: monthExpenses, income: monthIncome };
    };

    const recentMonths = [0, 1, 2].map(i => getMonthData(i));
    
    // Calcul pondéré
    const weights = [0.5, 0.3, 0.2];
    const avgIncome = recentMonths.reduce((sum, month, index) => sum + month.income * weights[index], 0);
    const avgExpenses = recentMonths.reduce((sum, month, index) => sum + month.expenses * weights[index], 0);

    // Analyse de tendance
    const incomeTrend = recentMonths[0].income - recentMonths[2].income;
    const expenseTrend = recentMonths[0].expenses - recentMonths[2].expenses;

    // Ajustement selon la tendance
    const adjustedIncome = avgIncome * (1 + (incomeTrend / Math.max(avgIncome, 1)) * 0.3);
    const adjustedExpenses = avgExpenses * (1 + (expenseTrend / Math.max(avgExpenses, 1)) * 0.3);

    const result = {
      income: Math.max(adjustedIncome, 0),
      expenses: Math.max(adjustedExpenses, 0),
      balance: adjustedIncome - adjustedExpenses,
      incomeTrend,
      expenseTrend,
      confidence: Math.max(0.5, 1 - Math.abs(incomeTrend + expenseTrend) / Math.max(avgIncome + avgExpenses, 1))
    };

    calculationCache.set(cacheKey, result);
    cleanupCache();
    
    return result;
  }, []);

  // Fonction optimisée pour calculer les recommandations
  const calculateRecommendations = useCallback((forecast, selectedMonthData) => {
    const cacheKey = createCacheKey([], { 
      forecast: JSON.stringify(forecast), 
      selectedMonthData: JSON.stringify(selectedMonthData),
      type: 'recommendations' 
    });
    
    if (calculationCache.has(cacheKey)) {
      return calculationCache.get(cacheKey);
    }

    const recommendations = [];
    const savingsRate = forecast.income > 0 ? (forecast.balance / forecast.income) * 100 : 0;

    if (savingsRate < 10) {
      recommendations.push({
        type: 'warning',
        title: 'Taux d\'épargne faible',
        message: `Votre taux d'épargne est de ${Math.round(savingsRate)}%. Il est recommandé d'épargner au moins 20% de vos revenus.`,
        priority: 'high'
      });
    }

    if (forecast.expenses > selectedMonthData.expenses * 1.2) {
      recommendations.push({
        type: 'error',
        title: 'Augmentation des dépenses prévue',
        message: 'Vos dépenses devraient augmenter de plus de 20% le mois prochain.',
        priority: 'high'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'Finances en bonne santé',
        message: 'Vos finances sont bien gérées. Continuez sur cette voie !',
        priority: 'low'
      });
    }

    calculationCache.set(cacheKey, recommendations);
    cleanupCache();
    
    return recommendations;
  }, []);

  // Calcul des données optimisées
  useEffect(() => {
    setIsCalculating(true);
    
    // Utiliser requestIdleCallback pour les calculs non critiques
    const calculateData = () => {
      try {
        const selectedMonthData = calculateSelectedMonthData(
          store.expenses,
          store.incomeTransactions,
          store.selectedMonth,
          store.selectedYear
        );

        const forecast = calculateForecast(
          store.expenses,
          store.incomeTransactions,
          store.selectedMonth,
          store.selectedYear
        );

        const recommendations = calculateRecommendations(forecast, selectedMonthData);

        setOptimizedData({
          selectedMonthData,
          forecast,
          recommendations,
          lastCalculated: Date.now()
        });
      } catch (error) {
        console.error('Erreur lors du calcul des données optimisées:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    // Utiliser requestIdleCallback si disponible, sinon setTimeout
    if (window.requestIdleCallback) {
      window.requestIdleCallback(calculateData, { timeout: 1000 });
    } else {
      setTimeout(calculateData, 0);
    }
  }, [
    store.expenses,
    store.incomeTransactions,
    store.selectedMonth,
    store.selectedYear,
    calculateSelectedMonthData,
    calculateForecast,
    calculateRecommendations
  ]);

  // Données memoizées pour éviter les re-calculs inutiles
  const memoizedData = useMemo(() => {
    return {
      ...optimizedData,
      isCalculating,
      hasData: Object.keys(optimizedData).length > 0
    };
  }, [optimizedData, isCalculating]);

  return memoizedData;
};

export default useOptimizedData; 