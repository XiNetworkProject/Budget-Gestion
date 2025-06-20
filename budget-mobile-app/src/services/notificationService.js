import toast from 'react-hot-toast';
import { useStore } from '../store';

// Service pour gérer les notifications liées aux abonnements
export const notificationService = {
  // Vérifier et notifier les limites d'utilisation
  checkAndNotifyLimits: (feature, currentUsage) => {
    const { checkUsageLimit, getCurrentPlan, hasSpecialAccess } = useStore.getState();
    
    // Les utilisateurs avec accès spécial ne reçoivent pas de notifications de limite
    if (hasSpecialAccess()) {
      return;
    }

    const usageLimit = checkUsageLimit(feature, currentUsage);
    const currentPlan = getCurrentPlan();

    // Si la limite est atteinte
    if (!usageLimit.allowed) {
      toast.error(
        `Limite atteinte pour ${feature}. Passez à un plan supérieur pour continuer.`,
        {
          duration: 6000,
          action: {
            text: 'Voir les plans',
            onClick: () => window.location.href = '/subscription'
          }
        }
      );
      return;
    }

    // Si on approche de la limite (moins de 10% restant)
    if (usageLimit.remaining !== -1 && usageLimit.remaining < currentPlan.features[feature] * 0.1) {
      toast.warning(
        `Attention : vous avez presque atteint votre limite de ${feature}.`,
        {
          duration: 5000,
          action: {
            text: 'Upgrade',
            onClick: () => window.location.href = '/subscription'
          }
        }
      );
      return;
    }

    // Si on approche de la limite (moins de 25% restant)
    if (usageLimit.remaining !== -1 && usageLimit.remaining < currentPlan.features[feature] * 0.25) {
      toast(
        `Il vous reste ${usageLimit.remaining} utilisations de ${feature}.`,
        {
          duration: 4000,
          icon: '⚠️'
        }
      );
    }
  },

  // Notifier l'expiration proche d'un abonnement
  notifySubscriptionExpiration: (daysUntilExpiration) => {
    if (daysUntilExpiration <= 7) {
      toast.error(
        `Votre abonnement expire dans ${daysUntilExpiration} jour(s).`,
        {
          duration: 8000,
          action: {
            text: 'Renouveler',
            onClick: () => window.location.href = '/subscription'
          }
        }
      );
    } else if (daysUntilExpiration <= 30) {
      toast.warning(
        `Votre abonnement expire dans ${daysUntilExpiration} jour(s).`,
        {
          duration: 6000,
          action: {
            text: 'Renouveler',
            onClick: () => window.location.href = '/subscription'
          }
        }
      );
    }
  },

  // Notifier un changement de plan
  notifyPlanChange: (oldPlan, newPlan) => {
    if (newPlan.price > oldPlan.price) {
      toast.success(
        `Félicitations ! Vous avez passé au plan ${newPlan.name}.`,
        {
          duration: 5000,
          icon: '🎉'
        }
      );
    } else if (newPlan.price < oldPlan.price) {
      toast.info(
        `Vous êtes passé au plan ${newPlan.name}.`,
        {
          duration: 4000
        }
      );
    }
  },

  // Notifier l'application d'un code promo
  notifyPromoCodeApplied: (code, discount, type) => {
    toast.success(
      `Code promo ${code} appliqué ! ${discount}${type === 'percentage' ? '%' : ' mois'} de réduction.`,
      {
        duration: 5000,
        icon: '🎫'
      }
    );
  },

  // Notifier une erreur de paiement
  notifyPaymentError: (error) => {
    toast.error(
      `Erreur de paiement : ${error}`,
      {
        duration: 8000,
        action: {
          text: 'Réessayer',
          onClick: () => window.location.reload()
        }
      }
    );
  },

  // Notifier un paiement réussi
  notifyPaymentSuccess: (planName) => {
    toast.success(
      `Paiement réussi ! Bienvenue au plan ${planName}.`,
      {
        duration: 6000,
        icon: '✅'
      }
    );
  },

  // Notifier l'annulation d'un abonnement
  notifySubscriptionCancelled: () => {
    toast.info(
      'Votre abonnement a été annulé. Vous conservez l\'accès jusqu\'à la fin de la période.',
      {
        duration: 8000
      }
    );
  },

  // Notifier l'utilisation d'une fonctionnalité premium
  notifyPremiumFeatureUsed: (feature) => {
    toast.success(
      `Fonctionnalité premium "${feature}" utilisée avec succès !`,
      {
        duration: 3000,
        icon: '⭐'
      }
    );
  },

  // Notifier l'approche d'une limite
  notifyApproachingLimit: (feature, remaining, total) => {
    const percentage = Math.round((remaining / total) * 100);
    
    if (percentage <= 10) {
      toast.error(
        `⚠️ Limite critique : ${remaining}/${total} ${feature} restant(s)`,
        {
          duration: 8000,
          action: {
            text: 'Upgrade',
            onClick: () => window.location.href = '/subscription'
          }
        }
      );
    } else if (percentage <= 25) {
      toast.warning(
        `⚠️ Attention : ${remaining}/${total} ${feature} restant(s)`,
        {
          duration: 6000,
          action: {
            text: 'Upgrade',
            onClick: () => window.location.href = '/subscription'
          }
        }
      );
    } else if (percentage <= 50) {
      toast(
        `ℹ️ ${remaining}/${total} ${feature} restant(s)`,
        {
          duration: 4000,
          icon: '📊'
        }
      );
    }
  }
};

// Hook pour utiliser les notifications
export const useNotificationService = () => {
  return {
    checkAndNotifyLimits: notificationService.checkAndNotifyLimits,
    notifySubscriptionExpiration: notificationService.notifySubscriptionExpiration,
    notifyPlanChange: notificationService.notifyPlanChange,
    notifyPromoCodeApplied: notificationService.notifyPromoCodeApplied,
    notifyPaymentError: notificationService.notifyPaymentError,
    notifyPaymentSuccess: notificationService.notifyPaymentSuccess,
    notifySubscriptionCancelled: notificationService.notifySubscriptionCancelled,
    notifyPremiumFeatureUsed: notificationService.notifyPremiumFeatureUsed,
    notifyApproachingLimit: notificationService.notifyApproachingLimit
  };
};

export default notificationService; 