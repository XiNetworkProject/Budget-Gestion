import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';

export const useAppSettings = () => {
  const { i18n } = useTranslation();
  const { appSettings, updateAppSettings } = useStore();

  // Appliquer la langue
  useEffect(() => {
    if (appSettings.language && appSettings.language !== i18n.language) {
      i18n.changeLanguage(appSettings.language);
    }
  }, [appSettings.language, i18n]);

  // Fonction pour changer la langue
  const changeLanguage = (language) => {
    updateAppSettings({ language });
  };

  // Fonction pour changer le thème
  const changeTheme = (theme) => {
    updateAppSettings({ theme });
  };

  // Fonction pour changer le mode compact
  const changeCompactMode = (compactMode) => {
    updateAppSettings({ 
      display: { 
        ...appSettings.display, 
        compactMode 
      } 
    });
  };

  // Fonction pour changer la devise
  const changeCurrency = (currency) => {
    updateAppSettings({ currency });
  };

  // Fonction pour changer l'affichage des pourcentages
  const changeShowPercentages = (showPercentages) => {
    updateAppSettings({ 
      display: { 
        ...appSettings.display, 
        showPercentages 
      } 
    });
  };

  return {
    appSettings,
    changeLanguage,
    changeTheme,
    changeCompactMode,
    changeCurrency,
    changeShowPercentages,
    currentLanguage: i18n.language,
    currentTheme: appSettings.theme || 'light',
    isCompactMode: appSettings.display?.compactMode || false,
    currentCurrency: appSettings.currency || 'EUR',
    showPercentages: appSettings.display?.showPercentages !== false
  };
}; 