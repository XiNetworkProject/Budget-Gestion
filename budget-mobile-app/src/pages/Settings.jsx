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
  Badge
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
    hasSpecialAccess
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        {t('settings.title')}
      </Typography>

      {/* En-tête */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t('settings.title')}
          </Typography>
          <IconButton color="primary">
            <Info />
          </IconButton>
        </Box>
      </Paper>

      {/* Tabs principales */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
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
          {/* Profil utilisateur */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar 
                    src={userProfile.avatar} 
                    sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}
                  >
                    {userProfile.firstName?.charAt(0) || userProfile.email?.charAt(0) || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={`${userProfile.firstName || t('settings.firstName')} ${userProfile.lastName || t('settings.lastName')}`}
                  secondary={userProfile.email || t('settings.noEmail')}
                />
                <IconButton onClick={() => setProfileDialog(true)}>
                  <Edit />
                </IconButton>
              </ListItem>
            </List>
          </Paper>

          {/* Informations du compte */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AccountCircle color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.accountCreated')} 
                  secondary={userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('fr-FR') : t('settings.notAvailable')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Timeline color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.lastLogin')} 
                  secondary={userProfile.lastLogin ? new Date(userProfile.lastLogin).toLocaleDateString('fr-FR') : t('settings.notAvailable')}
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Thème */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary={t('settings.darkMode')} 
                  secondary={t('settings.darkModeDescription')}
                />
                <Switch 
                  checked={currentTheme === 'dark'} 
                  onChange={(e) => changeTheme(e.target.checked ? 'dark' : 'light')} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary={t('settings.compactMode')} 
                  secondary={t('settings.compactModeDescription')}
                />
                <Switch 
                  checked={isCompactMode} 
                  onChange={(e) => changeCompactMode(e.target.checked)} 
                />
              </ListItem>
            </List>
          </Paper>

          {/* Langue et devise */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary={t('settings.language')} 
                  secondary={t('settings.languageDescription')}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={currentLanguage}
                    onChange={(e) => changeLanguage(e.target.value)}
                  >
                    {languages.map(lang => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary={t('settings.currency')} 
                  secondary={t('settings.currencyDescription')}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={currentCurrency}
                    onChange={(e) => changeCurrency(e.target.value)}
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

          {/* Affichage */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary={t('settings.showPercentages')} 
                  secondary={t('settings.showPercentagesDescription')}
                />
                <Switch 
                  checked={showPercentages} 
                  onChange={(e) => changeShowPercentages(e.target.checked)} 
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          {/* Authentification */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary={t('settings.autoLock')} 
                  secondary={t('settings.autoLockDescription')}
                />
                <Switch 
                  checked={appSettings.privacy?.autoLock || true} 
                  onChange={e => updateAppSettings({ 
                    privacy: { 
                      ...appSettings.privacy, 
                      autoLock: e.target.checked 
                    } 
                  })} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary={t('settings.biometricAuth')} 
                  secondary={t('settings.biometricAuthDescription')}
                />
                <Switch 
                  checked={appSettings.privacy?.biometricAuth || false} 
                  onChange={e => updateAppSettings({ 
                    privacy: { 
                      ...appSettings.privacy, 
                      biometricAuth: e.target.checked 
                    } 
                  })} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary={t('settings.dataSharing')} 
                  secondary={t('settings.dataSharingDescription')}
                />
                <Switch 
                  checked={appSettings.privacy?.dataSharing || false} 
                  onChange={e => updateAppSettings({ 
                    privacy: { 
                      ...appSettings.privacy, 
                      dataSharing: e.target.checked 
                    } 
                  })} 
                />
              </ListItem>
            </List>
          </Paper>

          {/* Changer le mot de passe */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <VpnKey color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.changePassword')} 
                  secondary={t('settings.changePasswordDescription')}
                />
                <Button variant="outlined" size="small">
                  {t('settings.modify')}
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          {/* Notifications */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary={t('settings.budgetAlerts')} 
                  secondary={t('settings.budgetAlertsDescription')}
                />
                <Switch 
                  checked={appSettings.notifications?.budgetAlerts || true} 
                  onChange={e => updateAppSettings({ 
                    notifications: { 
                      ...appSettings.notifications, 
                      budgetAlerts: e.target.checked 
                    } 
                  })} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary={t('settings.billReminders')} 
                  secondary={t('settings.billRemindersDescription')}
                />
                <Switch 
                  checked={appSettings.notifications?.billReminders || true} 
                  onChange={e => updateAppSettings({ 
                    notifications: { 
                      ...appSettings.notifications, 
                      billReminders: e.target.checked 
                    } 
                  })} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary={t('settings.savingsGoals')} 
                  secondary={t('settings.savingsGoalsDescription')}
                />
                <Switch 
                  checked={appSettings.notifications?.savingsGoals || true} 
                  onChange={e => updateAppSettings({ 
                    notifications: { 
                      ...appSettings.notifications, 
                      savingsGoals: e.target.checked 
                    } 
                  })} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary={t('settings.weeklyReports')} 
                  secondary={t('settings.weeklyReportsDescription')}
                />
                <Switch 
                  checked={appSettings.notifications?.weeklyReports || true} 
                  onChange={e => updateAppSettings({ 
                    notifications: { 
                      ...appSettings.notifications, 
                      weeklyReports: e.target.checked 
                    } 
                  })} 
                />
              </ListItem>
            </List>
          </Paper>

          {/* Export/Import */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CloudDownload color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.exportData')} 
                  secondary={t('settings.exportDataDescription')}
                />
                <Button variant="outlined" size="small" onClick={handleExport}>
                  {t('settings.export')}
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CloudUpload color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.importData')} 
                  secondary={t('settings.importDataDescription')}
                />
                <Button variant="outlined" size="small" component="label">
                  {t('settings.import')}
                  <input type="file" hidden accept=".json" onChange={handleImport} />
                </Button>
              </ListItem>
            </List>
          </Paper>

          {/* Abonnement */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CardMembership color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.subscription')} 
                  secondary={`${t('settings.currentPlan')}: ${getCurrentPlan().name}`}
                />
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={() => navigate('/subscription')}
                  startIcon={<Star />}
                >
                  {t('settings.manageSubscription')}
                </Button>
              </ListItem>
              {hasSpecialAccess() && (
                <>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('settings.specialAccess')} 
                      secondary={t('settings.specialAccessDescription')}
                    />
                    <Chip label={t('settings.developer')} color="success" size="small" />
                  </ListItem>
                </>
              )}
            </List>
          </Paper>

          {/* Réinitialisation des données */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Refresh color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.resetData')} 
                  secondary={t('settings.resetDataDescription')}
                />
                <Button 
                  variant="outlined" 
                  color="warning" 
                  size="small"
                  onClick={() => setResetDialog(true)}
                >
                  {t('settings.reset')}
                </Button>
              </ListItem>
            </List>
          </Paper>

          {/* Suppression des données */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Delete color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.deleteData')} 
                  secondary={t('settings.deleteDataDescription')}
                />
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={() => setDeleteDialog(true)}
                >
                  {t('settings.delete')}
                </Button>
              </ListItem>
            </List>
          </Paper>

          {/* Déconnexion */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Logout color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.logout')} 
                  secondary={t('settings.logoutDescription')}
                />
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={logout}
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
          {/* Tutoriel */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <School color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.tutorial')} 
                  secondary={t('settings.tutorialDescription')}
                />
                <Button variant="outlined" size="small" onClick={handleRestartTutorial}>
                  {t('settings.restart')}
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Help color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.helpCenter')} 
                  secondary={t('settings.helpCenterDescription')}
                />
                <Button variant="outlined" size="small">
                  {t('settings.visit')}
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Feedback color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.giveFeedback')} 
                  secondary={t('settings.giveFeedbackDescription')}
                />
                <Button variant="outlined" size="small" onClick={() => setFeedbackDialog(true)}>
                  {t('settings.feedback')}
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <BugReport color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.reportBug')} 
                  secondary={t('settings.reportBugDescription')}
                />
                <Button variant="outlined" size="small">
                  {t('settings.report')}
                </Button>
              </ListItem>
            </List>
          </Paper>

          {/* Informations sur l'app */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.appVersion')} 
                  secondary={`Budget Gestion v${appVersion}`}
                />
                <Button variant="outlined" size="small" onClick={handleShowUpdates}>
                  {t('settings.seeUpdates')}
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Star color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.rateApp')} 
                  secondary={t('settings.rateAppDescription')}
                />
                <Button variant="outlined" size="small">
                  {t('settings.rate')}
                </Button>
              </ListItem>
            </List>
          </Paper>

          {/* Contact */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AccountCircle color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('settings.clientSupport')} 
                  secondary={t('settings.clientSupportDescription')}
                />
                <Button variant="outlined" size="small">
                  {t('settings.contact')}
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      {/* Dialog de profil */}
      <Dialog open={profileDialog} onClose={() => setProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('settings.editProfile')}</DialogTitle>
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
          <Button onClick={() => setProfileDialog(false)}>{t('settings.cancel')}</Button>
          <Button onClick={handleProfileSave} variant="contained">
            {t('settings.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de réinitialisation */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>{t('settings.resetConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('settings.resetConfirmDescription')}
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>{t('settings.resetWarning')}</strong>
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>{t('settings.cancel')}</Button>
          <Button 
            onClick={handleResetToDefaults} 
            color="warning" 
            variant="contained"
          >
            {t('settings.reset')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>{t('settings.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('settings.deleteConfirmDescription')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>{t('settings.cancel')}</Button>
          <Button 
            onClick={handleDeleteData} 
            color="error" 
            variant="contained"
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
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 