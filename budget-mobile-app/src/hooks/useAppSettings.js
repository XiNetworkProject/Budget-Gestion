import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';

export const useAppSettings = () => {
  const { i18n } = useTranslation();
  const { appSettings, updateAppSettings } = useStore();

  console.log('useAppSettings: État actuel:', {
    appSettings,
    currentLanguage: i18n.language,
    theme: appSettings.theme,
    compactMode: appSettings.display?.compactMode,
    currency: appSettings.currency,
    showPercentages: appSettings.display?.showPercentages
  });

  // Appliquer la langue
  useEffect(() => {
    if (appSettings.language && appSettings.language !== i18n.language) {
      console.log('useAppSettings: Changement de langue:', appSettings.language);
      i18n.changeLanguage(appSettings.language);
    }
  }, [appSettings.language, i18n]);

  // Fonction pour changer la langue
  const changeLanguage = (language) => {
    console.log('useAppSettings: changeLanguage appelé avec:', language);
    updateAppSettings({ language });
  };

  // Fonction pour changer le thème
  const changeTheme = (theme) => {
    console.log('useAppSettings: changeTheme appelé avec:', theme);
    updateAppSettings({ theme });
  };

  // Fonction pour changer le mode compact
  const changeCompactMode = (compactMode) => {
    console.log('useAppSettings: changeCompactMode appelé avec:', compactMode);
    updateAppSettings({ 
      display: { 
        ...appSettings.display, 
        compactMode 
      } 
    });
  };

  // Fonction pour changer la devise
  const changeCurrency = (currency) => {
    console.log('useAppSettings: changeCurrency appelé avec:', currency);
    updateAppSettings({ currency });
  };

  // Fonction pour changer l'affichage des pourcentages
  const changeShowPercentages = (showPercentages) => {
    console.log('useAppSettings: changeShowPercentages appelé avec:', showPercentages);
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