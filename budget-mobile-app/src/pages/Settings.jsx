import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useAppSettings } from '../hooks/useAppSettings';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  ListItemAvatar,
  Divider, 
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Avatar,
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  Slider,
  InputAdornment,
  Fab,
  Badge,
  AppBar
} from '@mui/material';
import {
  DarkMode,
  Notifications,
  Language,
  Security,
  Backup,
  Delete,
  Edit,
  Download,
  Upload,
  Info,
  ExpandMore,
  Person,
  CurrencyExchange,
  Category,
  DataUsage,
  Help,
  Feedback,
  BugReport,
  Star,
  Add,
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
  Save,
  Cancel,
  Warning,
  CheckCircle,
  Settings as SettingsIcon,
  Palette,
  Smartphone,
  Computer,
  CloudUpload,
  CloudDownload,
  Refresh,
  Logout,
  VpnKey,
  Fingerprint,
  Shield,
  PrivacyTip,
  Analytics,
  Timeline,
  Assessment,
  School,
  CardMembership
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { 
    userProfile, 
    appSettings, 
    updateUserProfile, 
    updateAppSettings,
    logout,
    clearAllData,
    resetToDefaults,
    forceShowTutorial,
    appVersion,
    checkForUpdates,
    getCurrentPlan,
    hasSpecialAccess,
    fetchSubscriptionFromStripe,
    reloadBudgetData
  } = useStore();

  const {
    changeLanguage,
    changeTheme,
    changeCompactMode,
    changeCurrency,
    changeShowPercentages,
    currentLanguage,
    currentTheme,
    isCompactMode,
    currentCurrency,
    showPercentages
  } = useAppSettings();

  const { t } = useTranslation();

  const navigate = useNavigate();

  // Listes de langues et devises
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  const currencies = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'Dollar US', symbol: '$' },
    { code: 'GBP', name: 'Livre Sterling', symbol: '£' },
    { code: 'CHF', name: 'Franc Suisse', symbol: 'CHF' },
    { code: 'CAD', name: 'Dollar Canadien', symbol: 'C$' }
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [profileDialog, setProfileDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  
  // États pour les formulaires
  const [profileForm, setProfileForm] = useState({
    firstName: userProfile.firstName || '',
    lastName: userProfile.lastName || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    avatar: userProfile.avatar || ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Charger les données du profil au démarrage
  useEffect(() => {
    setProfileForm({
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      avatar: userProfile.avatar || ''
    });
  }, [userProfile]);

  const handleProfileSave = () => {
    updateUserProfile(profileForm);
    setProfileDialog(false);
    setSnack({ open: true, message: t('settings.profileUpdated'), severity: 'success' });
  };

  const handleDeleteData = () => {
    // Supprimer toutes les données du store
    clearAllData();
    setDeleteDialog(false);
    setSnack({ open: true, message: t('settings.allDataDeleted'), severity: 'info' });
  };

  const handleResetToDefaults = () => {
    // Réinitialiser avec les données par défaut
    resetToDefaults();
    setResetDialog(false);
    setSnack({ open: true, message: t('settings.dataReset'), severity: 'success' });
  };

  const handleExport = () => {
    const data = {
      userProfile,
      appSettings,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSnack({ open: true, message: t('settings.dataExported'), severity: 'success' });
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.userProfile) updateUserProfile(data.userProfile);
          if (data.appSettings) updateAppSettings(data.appSettings);
          setSnack({ open: true, message: t('settings.dataImported'), severity: 'success' });
        } catch (error) {
          setSnack({ open: true, message: t('settings.importError'), severity: 'error' });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFeedback = () => {
    setSnack({ open: true, message: t('settings.thankYouFeedback'), severity: 'success' });
    setFeedbackDialog(false);
  };

  const handleRestartTutorial = () => {
    forceShowTutorial();
    setSnack({ open: true, message: t('settings.tutorialRestarted'), severity: 'success' });
    // Rediriger vers la page d'accueil pour déclencher le tutoriel
  };

  const handleShowUpdates = () => {
    checkForUpdates();
    setSnack({ open: true, message: t('settings.updateDialogReloaded'), severity: 'success' });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules animées */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '@keyframes float': {
                '0%': {
                  transform: 'translateY(0px) rotate(0deg)',
                  opacity: 0
                },
                '10%': {
                  opacity: 1
                },
                '90%': {
                  opacity: 1
                },
                '100%': {
                  transform: 'translateY(-100vh) rotate(360deg)',
                  opacity: 0
                }
              }
            }}
          />
        ))}
      </Box>

      {/* AppBar glassmorphism */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'none',
          mb: 2
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {t('settings.title')}
          </Typography>
        </Box>
      </AppBar>

      <Box sx={{ p: 2, pb: 10, position: 'relative', zIndex: 1 }}>
        {/* Tabs principales glassmorphism */}
        <Paper sx={{ 
          mb: 2,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 'bold'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'white'
              }
            }}
          >
            <Tab label={t('settings.tabs.profile')} />
            <Tab label={t('settings.tabs.appearance')} />
            <Tab label={t('settings.tabs.security')} />
            <Tab label={t('settings.tabs.data')} />
            <Tab label={t('settings.tabs.help')} />
          </Tabs>
        </Paper>

        {/* Contenu des tabs */}
        {activeTab === 0 && (
          <Box>
            {/* Profil utilisateur glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar 
                      src={userProfile.avatar} 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {userProfile.firstName?.charAt(0) || userProfile.email?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`${userProfile.firstName || t('settings.firstName')} ${userProfile.lastName || t('settings.lastName')}`}
                    secondary={userProfile.email || t('settings.noEmail')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <IconButton 
                    onClick={() => setProfileDialog(true)}
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <Edit />
                  </IconButton>
                </ListItem>
              </List>
            </Paper>

            {/* Informations du compte glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccountCircle sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.accountCreated')} 
                    secondary={userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('fr-FR') : t('settings.notAvailable')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Timeline sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.lastLogin')} 
                    secondary={userProfile.lastLogin ? new Date(userProfile.lastLogin).toLocaleDateString('fr-FR') : t('settings.notAvailable')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {/* Thème glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={t('settings.darkMode')} 
                    secondary={t('settings.darkModeDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Switch 
                    checked={currentTheme === 'dark'} 
                    onChange={(e) => changeTheme(e.target.checked ? 'dark' : 'light')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemText 
                    primary={t('settings.compactMode')} 
                    secondary={t('settings.compactModeDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Switch 
                    checked={isCompactMode} 
                    onChange={(e) => changeCompactMode(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </Paper>

            {/* Langue et devise glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={t('settings.language')} 
                    secondary={t('settings.languageDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={currentLanguage}
                      onChange={(e) => changeLanguage(e.target.value)}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'white'
                        }
                      }}
                    >
                      {languages.map(lang => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemText 
                    primary={t('settings.currency')} 
                    secondary={t('settings.currencyDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={currentCurrency}
                      onChange={(e) => changeCurrency(e.target.value)}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'white'
                        }
                      }}
                    >
                      {currencies.map(curr => (
                        <MenuItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItem>
              </List>
            </Paper>

            {/* Affichage glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={t('settings.showPercentages')} 
                    secondary={t('settings.showPercentagesDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Switch 
                    checked={showPercentages} 
                    onChange={(e) => changeShowPercentages(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {/* Authentification glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={t('settings.autoLock')} 
                    secondary={t('settings.autoLockDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Switch 
                    checked={appSettings.privacy?.autoLock || true} 
                    onChange={e => updateAppSettings({ 
                      privacy: { 
                        ...appSettings.privacy, 
                        autoLock: e.target.checked 
                      } 
                    })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemText 
                    primary={t('settings.biometricAuth')} 
                    secondary={t('settings.biometricAuthDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Switch 
                    checked={appSettings.privacy?.biometricAuth || false} 
                    onChange={e => updateAppSettings({ 
                      privacy: { 
                        ...appSettings.privacy, 
                        biometricAuth: e.target.checked 
                      } 
                    })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemText 
                    primary={t('settings.dataSharing')} 
                    secondary={t('settings.dataSharingDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Switch 
                    checked={appSettings.privacy?.dataSharing || false} 
                    onChange={e => updateAppSettings({ 
                      privacy: { 
                        ...appSettings.privacy, 
                        dataSharing: e.target.checked 
                      } 
                    })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </Paper>

            {/* Changer le mot de passe glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <VpnKey sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.changePassword')} 
                    secondary={t('settings.changePasswordDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.modify')}
                  </Button>
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            {/* Notifications glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={t('settings.budgetAlerts')} 
                    secondary={t('settings.budgetAlertsDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Switch 
                    checked={appSettings.notifications?.budgetAlerts || true} 
                    onChange={e => updateAppSettings({ 
                      notifications: { 
                        ...appSettings.notifications, 
                        budgetAlerts: e.target.checked 
                      } 
                    })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemText 
                    primary={t('settings.billReminders')} 
                    secondary={t('settings.billRemindersDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Switch 
                    checked={appSettings.notifications?.billReminders || true} 
                    onChange={e => updateAppSettings({ 
                      notifications: { 
                        ...appSettings.notifications, 
                        billReminders: e.target.checked 
                      } 
                    })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemText 
                    primary={t('settings.savingsGoals')} 
                    secondary={t('settings.savingsGoalsDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Switch 
                    checked={appSettings.notifications?.savingsGoals || true} 
                    onChange={e => updateAppSettings({ 
                      notifications: { 
                        ...appSettings.notifications, 
                        savingsGoals: e.target.checked 
                      } 
                    })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemText 
                    primary={t('settings.weeklyReports')} 
                    secondary={t('settings.weeklyReportsDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Switch 
                    checked={appSettings.notifications?.weeklyReports || true} 
                    onChange={e => updateAppSettings({ 
                      notifications: { 
                        ...appSettings.notifications, 
                        weeklyReports: e.target.checked 
                      } 
                    })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </Paper>

            {/* Export/Import glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CloudDownload sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.exportData')} 
                    secondary={t('settings.exportDataDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleExport}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.export')}
                  </Button>
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemIcon>
                    <CloudUpload sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.importData')} 
                    secondary={t('settings.importDataDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    component="label"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.import')}
                    <input type="file" hidden accept=".json" onChange={handleImport} />
                  </Button>
                </ListItem>
              </List>
            </Paper>

            {/* Abonnement glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CardMembership sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.subscription')} 
                    secondary={`${t('settings.currentPlan')}: ${getCurrentPlan().name}`}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={async () => {
                        await fetchSubscriptionFromStripe();
                        setSnack({ open: true, message: 'Vérification de l\'abonnement terminée', severity: 'info' });
                      }}
                      startIcon={<Refresh />}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          background: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Vérifier
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => navigate('/subscription')}
                      startIcon={<Star />}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                        }
                      }}
                    >
                      {t('settings.manageSubscription')}
                    </Button>
                  </Box>
                </ListItem>
                {hasSpecialAccess() && (
                  <>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={t('settings.specialAccess')} 
                        secondary={t('settings.specialAccessDescription')}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: 'white',
                            fontWeight: 'bold'
                          },
                          '& .MuiListItemText-secondary': {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        }}
                      />
                      <Chip 
                        label={t('settings.developer')} 
                        sx={{ 
                          background: 'rgba(76, 175, 80, 0.2)',
                          backdropFilter: 'blur(10px)',
                          color: '#4caf50',
                          border: '1px solid rgba(76, 175, 80, 0.3)'
                        }} 
                        size="small" 
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>

            {/* Rechargement des données glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CloudDownload sx={{ color: '#03a9f4' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Recharger les données" 
                    secondary="Récupérer les données depuis le serveur"
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={async () => {
                      await reloadBudgetData();
                      setSnack({ open: true, message: 'Données rechargées', severity: 'info' });
                    }}
                    startIcon={<CloudDownload />}
                    sx={{
                      borderColor: 'rgba(3, 169, 244, 0.3)',
                      color: '#03a9f4',
                      '&:hover': {
                        borderColor: 'rgba(3, 169, 244, 0.5)',
                        background: 'rgba(3, 169, 244, 0.1)'
                      }
                    }}
                  >
                    Recharger
                  </Button>
                </ListItem>
              </List>
            </Paper>

            {/* Réinitialisation des données glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Refresh sx={{ color: '#ff9800' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.resetData')} 
                    secondary={t('settings.resetDataDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setResetDialog(true)}
                    sx={{
                      borderColor: 'rgba(255, 152, 0, 0.3)',
                      color: '#ff9800',
                      '&:hover': {
                        borderColor: 'rgba(255, 152, 0, 0.5)',
                        background: 'rgba(255, 152, 0, 0.1)'
                      }
                    }}
                  >
                    {t('settings.reset')}
                  </Button>
                </ListItem>
              </List>
            </Paper>

            {/* Suppression des données glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Delete sx={{ color: '#f44336' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.deleteData')} 
                    secondary={t('settings.deleteDataDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setDeleteDialog(true)}
                    sx={{
                      borderColor: 'rgba(244, 67, 54, 0.3)',
                      color: '#f44336',
                      '&:hover': {
                        borderColor: 'rgba(244, 67, 54, 0.5)',
                        background: 'rgba(244, 67, 54, 0.1)'
                      }
                    }}
                  >
                    {t('settings.delete')}
                  </Button>
                </ListItem>
              </List>
            </Paper>

            {/* Déconnexion glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Logout sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.logout')} 
                    secondary={t('settings.logoutDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={logout}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.logout')}
                  </Button>
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            {/* Tutoriel glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <School sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.tutorial')} 
                    secondary={t('settings.tutorialDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleRestartTutorial}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.restart')}
                  </Button>
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemIcon>
                    <Help sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.helpCenter')} 
                    secondary={t('settings.helpCenterDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.visit')}
                  </Button>
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemIcon>
                    <Feedback sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.giveFeedback')} 
                    secondary={t('settings.giveFeedbackDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => setFeedbackDialog(true)}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.feedback')}
                  </Button>
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemIcon>
                    <BugReport sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.reportBug')} 
                    secondary={t('settings.reportBugDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.report')}
                  </Button>
                </ListItem>
              </List>
            </Paper>

            {/* Informations sur l'app glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Info sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.appVersion')} 
                    secondary={`Budget Gestion v${appVersion}`}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleShowUpdates}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.seeUpdates')}
                  </Button>
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem>
                  <ListItemIcon>
                    <Star sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.rateApp')} 
                    secondary={t('settings.rateAppDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.rate')}
                  </Button>
                </ListItem>
              </List>
            </Paper>

            {/* Contact glassmorphism */}
            <Paper sx={{ 
              mb: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccountCircle sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('settings.clientSupport')} 
                    secondary={t('settings.clientSupportDescription')}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {t('settings.contact')}
                  </Button>
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}

        {/* Dialog de profil glassmorphism */}
        <Dialog 
          open={profileDialog} 
          onClose={() => setProfileDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#333', fontWeight: 'bold' }}>
            {t('settings.editProfile')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label={t('settings.firstName')}
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('settings.lastName')}
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('settings.email')}
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('settings.phone')}
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('settings.avatarURL')}
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setProfileDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('settings.cancel')}
            </Button>
            <Button 
              onClick={handleProfileSave} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              {t('settings.save')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de réinitialisation glassmorphism */}
        <Dialog 
          open={resetDialog} 
          onClose={() => setResetDialog(false)}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#333', fontWeight: 'bold' }}>
            {t('settings.resetConfirmTitle')}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#333' }}>
              {t('settings.resetConfirmDescription')}
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>{t('settings.resetWarning')}</strong>
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setResetDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('settings.cancel')}
            </Button>
            <Button 
              onClick={handleResetToDefaults} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)'
                }
              }}
            >
              {t('settings.reset')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de suppression glassmorphism */}
        <Dialog 
          open={deleteDialog} 
          onClose={() => setDeleteDialog(false)}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#333', fontWeight: 'bold' }}>
            {t('settings.deleteConfirmTitle')}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#333' }}>
              {t('settings.deleteConfirmDescription')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog(false)}
              sx={{ color: '#666' }}
            >
              {t('settings.cancel')}
            </Button>
            <Button 
              onClick={handleDeleteData} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
                }
              }}
            >
              {t('settings.delete')}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snack.open} 
          autoHideDuration={3000} 
          onClose={() => setSnack(s => ({ ...s, open: false }))} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnack(s => ({ ...s, open: false }))} 
            severity={snack.severity} 
            sx={{ width: '100%' }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Settings; 