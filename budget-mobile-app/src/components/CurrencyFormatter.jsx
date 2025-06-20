import React from 'react';
import { useStore } from '../store';

const CurrencyFormatter = ({ amount, showSymbol = true, compact = false }) => {
  const { appSettings } = useStore();
  const currency = appSettings.currency || 'EUR';

  const formatAmount = (value) => {
    const numValue = parseFloat(value) || 0;
    
    if (compact && numValue >= 1000) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(numValue);
    }

    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  return <span>{formatAmount(amount)}</span>;
};

export default CurrencyFormatter; 