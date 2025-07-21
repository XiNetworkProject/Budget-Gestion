import React, { useEffect, useState } from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertTitle,
  Slide,
  Fade
} from '@mui/material';
import { useStore } from '../../store';
import { NOTIFICATION_CONFIG } from '../../config/optimizations';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const { appSettings } = useStore();

  // Simuler des notifications système
  useEffect(() => {
    const systemNotifications = [
      {
        id: 'welcome',
        type: 'success',
        title: 'Bienvenue !',
        message: 'Votre application est prête à l\'emploi.',
        duration: NOTIFICATION_CONFIG.DURATIONS.NORMAL,
        show: true
      },
      {
        id: 'optimization',
        type: 'info',
        title: 'Optimisations activées',
        message: 'Les nouvelles fonctionnalités sont maintenant disponibles.',
        duration: NOTIFICATION_CONFIG.DURATIONS.LONG,
        show: true
      }
    ];

    // Afficher les notifications système avec un délai
    systemNotifications.forEach((notification, index) => {
      setTimeout(() => {
        addNotification(notification);
      }, (index + 1) * 2000); // Délai progressif
    });
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || Date.now().toString(),
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);
    
    if (!currentNotification) {
      setCurrentNotification(newNotification);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    if (currentNotification?.id === id) {
      const nextNotification = notifications.find(n => n.id !== id);
      setCurrentNotification(nextNotification || null);
    }
  };

  const handleClose = () => {
    if (currentNotification) {
      removeNotification(currentNotification.id);
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'success':
        return appSettings.theme === 'dark' ? '#34d399' : '#10b981';
      case 'error':
        return appSettings.theme === 'dark' ? '#f87171' : '#ef4444';
      case 'warning':
        return appSettings.theme === 'dark' ? '#fbbf24' : '#f59e0a';
      case 'info':
        return appSettings.theme === 'dark' ? '#60a5fa' : '#3b82f6';
      default:
        return appSettings.theme === 'dark' ? '#60a5fa' : '#3b82f6';
    }
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Snackbar
      open={!!currentNotification}
      autoHideDuration={currentNotification.duration || NOTIFICATION_CONFIG.DURATIONS.NORMAL}
      onClose={handleClose}
      anchorOrigin={{ 
        vertical: 'bottom', 
        horizontal: 'right' 
      }}
      TransitionComponent={(props) => (
        <Slide {...props} direction="up" />
      )}
      sx={{
        '& .MuiSnackbar-root': {
          bottom: 80 // Au-dessus de la navigation bottom
        }
      }}
    >
      <Fade in timeout={300}>
        <Alert
          onClose={handleClose}
          severity={currentNotification.type}
          variant="filled"
          sx={{
            width: '100%',
            maxWidth: 400,
            background: `linear-gradient(135deg, ${getAlertColor(currentNotification.type)} 0%, ${getAlertColor(currentNotification.type)}dd 100%)`,
            color: 'white',
            fontWeight: 500,
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-message': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          {currentNotification.title && (
            <AlertTitle sx={{ color: 'white', fontWeight: 'bold' }}>
              {currentNotification.title}
            </AlertTitle>
          )}
          {currentNotification.message}
        </Alert>
      </Fade>
    </Snackbar>
  );
};

export default NotificationManager; 