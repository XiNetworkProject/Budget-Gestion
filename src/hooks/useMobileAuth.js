import { useState, useEffect } from 'react';
import { useStore } from '../store';

export const useMobileAuth = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const { login, register } = useStore();

  useEffect(() => {
    // Détecter si on est sur mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };

    // Détecter si on est dans Capacitor
    const checkCapacitor = () => {
      return window.Capacitor !== undefined;
    };

    setIsMobile(checkMobile());
    setIsCapacitor(checkCapacitor());
  }, []);

  const handleGoogleAuth = async () => {
    if (isCapacitor) {
      // Dans Capacitor, ouvrir le navigateur externe
      try {
        // Utiliser l'URL de production au lieu de localhost
        const authUrl = 'https://budget-mobile-app-pa2n.onrender.com/auth/google';
        if (window.Capacitor?.Plugins?.Browser) {
          await window.Capacitor.Plugins.Browser.open({ url: authUrl });
        } else {
          window.open(authUrl, '_system');
        }
      } catch (error) {
        console.error('Erreur ouverture navigateur:', error);
        // Fallback vers l'ouverture normale
        window.open('https://budget-mobile-app-pa2n.onrender.com/auth/google', '_system');
      }
    } else if (isMobile) {
      // Sur mobile web, ouvrir dans un nouvel onglet
      window.open('https://budget-mobile-app-pa2n.onrender.com/auth/google', '_blank');
    } else {
      // Sur desktop, utiliser l'auth normale
      // Votre logique Google Auth existante
      console.log('Auth Google desktop');
    }
  };

  const handleEmailAuth = async (email, password, mode = 'login') => {
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handlePhoneAuth = async (phone) => {
    // Implémentation de l'auth par SMS
    // À connecter avec votre service SMS (Twilio, etc.)
    try {
      // Envoyer le code SMS
      console.log('Envoi SMS à:', phone);
      return { success: true, message: 'Code envoyé' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyPhoneCode = async (phone, code) => {
    // Vérifier le code SMS
    try {
      console.log('Vérification code:', phone, code);
      // Logique de vérification
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    isMobile,
    isCapacitor,
    handleGoogleAuth,
    handleEmailAuth,
    handlePhoneAuth,
    verifyPhoneCode
  };
}; 