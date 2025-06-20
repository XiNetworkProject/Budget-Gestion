import React from 'react';
import { useStore } from '../store';

const CurrencyFormatter = ({ amount, showSymbol = true, compact = false }) => {
  const { appSettings } = useStore();
  const currency = appSettings.currency || 'EUR';
  const language = appSettings.language || 'fr';

  const formatAmount = (value) => {
    const numValue = parseFloat(value) || 0;
    
    if (compact && numValue >= 1000) {
      return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
        style: 'currency',
        currency: currency,
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(numValue);
    }

    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  return <span>{formatAmount(amount)}</span>;
};

export default CurrencyFormatter;

// Composant pour afficher les pourcentages selon les paramètres
export const PercentageFormatter = ({ value, showPercentages = true }) => {
  const { appSettings } = useStore();
  const shouldShow = appSettings.display?.showPercentages !== false && showPercentages;
  
  if (!shouldShow) return null;
  
  return <span>{value.toFixed(1)}%</span>;
}; 