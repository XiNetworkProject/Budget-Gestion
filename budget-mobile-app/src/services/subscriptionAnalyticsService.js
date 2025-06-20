import { useStore } from '../store';

// Service pour analyser l'utilisation des abonnements
export const subscriptionAnalyticsService = {
  // Obtenir les statistiques d'utilisation
  getUsageStats: () => {
    const state = useStore.getState();
    const { transactions, savings, expenses } = state;
    
    return {
      transactions: transactions?.length || 0,
      savingsGoals: savings?.length || 0,
      expenses: expenses?.length || 0,
      actionPlans: 0, // À implémenter quand les plans d'action seront créés
      categories: state.categories?.length || 0
    };
  },

  // Obtenir les statistiques par plan
  getPlanStats: () => {
    const state = useStore.getState();
    const currentPlan = state.getCurrentPlan();
    const usageStats = subscriptionAnalyticsService.getUsageStats();
    
    const planLimits = currentPlan.features;
    const usagePercentages = {};
    
    Object.keys(planLimits).forEach(feature => {
      const limit = planLimits[feature];
      if (limit !== -1 && limit !== false && limit !== 0) {
        const usage = usageStats[feature] || 0;
        usagePercentages[feature] = Math.round((usage / limit) * 100);
      }
    });
    
    return {
      currentPlan: currentPlan.name,
      usageStats,
      usagePercentages,
      planLimits
    };
  },

  // Obtenir les recommandations d'upgrade
  getUpgradeRecommendations: () => {
    const state = useStore.getState();
    const currentPlan = state.getCurrentPlan();
    const usageStats = subscriptionAnalyticsService.getUsageStats();
    const recommendations = [];
    
    // Vérifier les limites atteintes
    Object.entries(currentPlan.features).forEach(([feature, limit]) => {
      if (limit !== -1 && limit !== false && limit !== 0) {
        const usage = usageStats[feature] || 0;
        const percentage = (usage / limit) * 100;
        
        if (percentage >= 90) {
          recommendations.push({
            type: 'critical',
            feature,
            message: `Limite critique atteinte pour ${feature}`,
            percentage
          });
        } else if (percentage >= 75) {
          recommendations.push({
            type: 'warning',
            feature,
            message: `Limite proche pour ${feature}`,
            percentage
          });
        } else if (percentage >= 50) {
          recommendations.push({
            type: 'info',
            feature,
            message: `Utilisation modérée de ${feature}`,
            percentage
          });
        }
      }
    });
    
    return recommendations;
  },

  // Obtenir les métriques de conversion
  getConversionMetrics: () => {
    const state = useStore.getState();
    const { subscription } = state;
    
    return {
      currentPlan: subscription.currentPlan,
      planDuration: subscription.startDate ? 
        Math.floor((new Date() - new Date(subscription.startDate)) / (1000 * 60 * 60 * 24)) : 0,
      isActive: subscription.status === 'active',
      hasStripeIntegration: !!subscription.stripeCustomerId
    };
  },

  // Obtenir l'historique des changements de plan
  getPlanHistory: () => {
    // À implémenter avec une vraie base de données
    return [
      {
        date: new Date().toISOString(),
        fromPlan: 'FREE',
        toPlan: 'PREMIUM',
        reason: 'Upgrade manuel'
      }
    ];
  },

  // Obtenir les statistiques de rétention
  getRetentionStats: () => {
    const state = useStore.getState();
    const { subscription } = state;
    
    if (!subscription.startDate) {
      return {
        daysSinceStart: 0,
        retentionRate: 100,
        churnRisk: 'low'
      };
    }
    
    const daysSinceStart = Math.floor((new Date() - new Date(subscription.startDate)) / (1000 * 60 * 60 * 24));
    
    // Calcul simple du risque de churn basé sur l'utilisation
    const usageStats = subscriptionAnalyticsService.getUsageStats();
    const totalUsage = Object.values(usageStats).reduce((sum, val) => sum + val, 0);
    const usagePerDay = daysSinceStart > 0 ? totalUsage / daysSinceStart : 0;
    
    let churnRisk = 'low';
    if (usagePerDay < 1) churnRisk = 'high';
    else if (usagePerDay < 3) churnRisk = 'medium';
    
    return {
      daysSinceStart,
      retentionRate: subscription.status === 'active' ? 100 : 0,
      churnRisk,
      usagePerDay: Math.round(usagePerDay * 100) / 100
    };
  },

  // Obtenir les insights d'utilisation
  getUsageInsights: () => {
    const usageStats = subscriptionAnalyticsService.getUsageStats();
    const planStats = subscriptionAnalyticsService.getPlanStats();
    const insights = [];
    
    // Insight sur l'utilisation des transactions
    if (usageStats.transactions > 0) {
      const transactionPercentage = planStats.usagePercentages.maxTransactions || 0;
      if (transactionPercentage > 80) {
        insights.push({
          type: 'warning',
          title: 'Utilisation élevée des transactions',
          message: `Vous avez utilisé ${transactionPercentage}% de votre quota de transactions.`,
          action: 'Considérez un upgrade pour plus de transactions.'
        });
      }
    }
    
    // Insight sur les objectifs d'épargne
    if (usageStats.savingsGoals > 0) {
      const savingsPercentage = planStats.usagePercentages.maxSavingsGoals || 0;
      if (savingsPercentage > 50) {
        insights.push({
          type: 'info',
          title: 'Objectifs d\'épargne actifs',
          message: `Vous avez ${usageStats.savingsGoals} objectifs d'épargne actifs.`,
          action: 'Continuez à suivre vos objectifs !'
        });
      }
    }
    
    // Insight sur les catégories
    if (usageStats.categories > 5) {
      insights.push({
        type: 'success',
        title: 'Organisation optimale',
        message: `Vous utilisez ${usageStats.categories} catégories pour organiser vos finances.`,
        action: 'Excellente organisation !'
      });
    }
    
    return insights;
  },

  // Générer un rapport complet
  generateReport: () => {
    const usageStats = subscriptionAnalyticsService.getUsageStats();
    const planStats = subscriptionAnalyticsService.getPlanStats();
    const recommendations = subscriptionAnalyticsService.getUpgradeRecommendations();
    const conversionMetrics = subscriptionAnalyticsService.getConversionMetrics();
    const retentionStats = subscriptionAnalyticsService.getRetentionStats();
    const insights = subscriptionAnalyticsService.getUsageInsights();
    
    return {
      generatedAt: new Date().toISOString(),
      usageStats,
      planStats,
      recommendations,
      conversionMetrics,
      retentionStats,
      insights,
      summary: {
        totalFeatures: Object.keys(planStats.planLimits).length,
        featuresUsed: Object.keys(usageStats).filter(key => usageStats[key] > 0).length,
        upgradeRecommended: recommendations.some(r => r.type === 'critical' || r.type === 'warning'),
        overallUsage: Math.round(
          Object.values(planStats.usagePercentages).reduce((sum, val) => sum + val, 0) / 
          Object.values(planStats.usagePercentages).length
        )
      }
    };
  }
};

// Hook pour utiliser les analytics
export const useSubscriptionAnalytics = () => {
  return {
    getUsageStats: subscriptionAnalyticsService.getUsageStats,
    getPlanStats: subscriptionAnalyticsService.getPlanStats,
    getUpgradeRecommendations: subscriptionAnalyticsService.getUpgradeRecommendations,
    getConversionMetrics: subscriptionAnalyticsService.getConversionMetrics,
    getPlanHistory: subscriptionAnalyticsService.getPlanHistory,
    getRetentionStats: subscriptionAnalyticsService.getRetentionStats,
    getUsageInsights: subscriptionAnalyticsService.getUsageInsights,
    generateReport: subscriptionAnalyticsService.generateReport
  };
};

export default subscriptionAnalyticsService; 