import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
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
  School
} from '@mui/icons-material';

const Settings = () => {
  const { 
    userProfile, 
    appSettings, 
    accounts, 
    activeAccount,
    updateUserProfile, 
    updateAppSettings,
    addAccount,
    updateAccount,
    deleteAccount,
    setActiveAccount,
    logout,
    clearAllData,
    forceShowTutorial
  } = useStore();

  const [activeTab, setActiveTab] = useState(0);
  const [profileDialog, setProfileDialog] = useState(false);
  const [accountDialog, setAccountDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
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

  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'personal',
    balance: 0,
    currency: 'EUR',
    color: '#1976d2'
  });

  const [editingAccount, setEditingAccount] = useState(null);
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
    setSnack({ open: true, message: 'Profil mis à jour avec succès', severity: 'success' });
  };

  const handleAccountSave = () => {
    if (editingAccount) {
      updateAccount(editingAccount.id, accountForm);
      setSnack({ open: true, message: 'Compte mis à jour avec succès', severity: 'success' });
    } else {
      addAccount(accountForm);
      setSnack({ open: true, message: 'Compte ajouté avec succès', severity: 'success' });
    }
    setAccountDialog(false);
    setEditingAccount(null);
    setAccountForm({ name: '', type: 'personal', balance: 0, currency: 'EUR', color: '#1976d2' });
  };

  const handleAccountEdit = (account) => {
    setEditingAccount(account);
    setAccountForm({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      color: account.color
    });
    setAccountDialog(true);
  };

  const handleAccountDelete = (accountId) => {
    deleteAccount(accountId);
    setDeleteDialog(false);
    setSnack({ open: true, message: 'Compte supprimé avec succès', severity: 'info' });
  };

  const handleChangeActiveAccount = (accountId) => {
    setActiveAccount(accountId);
    setSnack({ open: true, message: 'Compte actif changé avec succès', severity: 'success' });
  };

  const handleDeleteData = () => {
    // Supprimer toutes les données du store
    clearAllData();
    setDeleteDialog(false);
    setSnack({ open: true, message: 'Toutes les données ont été supprimées', severity: 'info' });
  };

  const handleExport = () => {
    const data = {
      userProfile,
      appSettings,
      accounts,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSnack({ open: true, message: 'Données exportées avec succès', severity: 'success' });
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
          setSnack({ open: true, message: 'Données importées avec succès', severity: 'success' });
        } catch (error) {
          setSnack({ open: true, message: 'Erreur lors de l\'import', severity: 'error' });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFeedback = () => {
    setSnack({ open: true, message: 'Merci pour votre feedback !', severity: 'success' });
    setFeedbackDialog(false);
  };

  const handleRestartTutorial = () => {
    forceShowTutorial();
    setSnack({ open: true, message: 'Tutoriel relancé ! Il se lancera automatiquement.', severity: 'success' });
    // Rediriger vers la page d'accueil pour déclencher le tutoriel
    setTimeout(() => {
      window.location.href = '/home';
    }, 1000);
  };

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  const currencies = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'Dollar US', symbol: '$' },
    { code: 'GBP', name: 'Livre Sterling', symbol: '£' },
    { code: 'CHF', name: 'Franc Suisse', symbol: 'CHF' }
  ];

  const accountTypes = [
    { value: 'personal', label: 'Personnel', icon: '👤' },
    { value: 'business', label: 'Professionnel', icon: '💼' },
    { value: 'savings', label: 'Épargne', icon: '💰' },
    { value: 'investment', label: 'Investissement', icon: '📈' }
  ];

  const getAccountIcon = (type) => {
    const accountType = accountTypes.find(t => t.value === type);
    return accountType ? accountType.icon : '💳';
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* En-tête */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Paramètres
          </Typography>
          <IconButton color="primary">
            <Info />
          </IconButton>
        </Box>
      </Paper>

      {/* Tabs principales */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Profil" />
          <Tab label="Comptes" />
          <Tab label="Apparence" />
          <Tab label="Sécurité" />
          <Tab label="Données" />
          <Tab label="Aide" />
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
                  primary={`${userProfile.firstName || 'Prénom'} ${userProfile.lastName || 'Nom'}`}
                  secondary={userProfile.email || 'Aucun email'}
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
                  primary="Compte créé le" 
                  secondary={userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Timeline color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Dernière connexion" 
                  secondary={userProfile.lastLogin ? new Date(userProfile.lastLogin).toLocaleDateString('fr-FR') : 'Non disponible'}
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Compte actif */}
          {activeAccount && (
            <Paper sx={{ mb: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Compte actif
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: activeAccount.color, width: 50, height: 50 }}>
                  {getAccountIcon(activeAccount.type)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{activeAccount.name}</Typography>
                  <Typography variant="body2" color="text.secondary" component="span">
                    {activeAccount.balance.toLocaleString()} {activeAccount.currency}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Liste des comptes */}
          <Paper sx={{ mb: 2 }}>
            <List>
              {accounts.map((account) => (
                <React.Fragment key={account.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: account.color }}>
                        {getAccountIcon(account.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={account.name}
                      secondary={`${account.balance.toLocaleString()} ${account.currency}`}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {account.id === activeAccount?.id && (
                        <Chip label="Actif" size="small" color="primary" />
                      )}
                      {account.id !== activeAccount?.id && (
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleChangeActiveAccount(account.id)}
                        >
                          Activer
                        </Button>
                      )}
                      <IconButton onClick={() => handleAccountEdit(account)}>
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => {
                          setEditingAccount(account);
                          setDeleteDialog(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Bouton d'ajout */}
          <Fab
            color="primary"
            aria-label="add account"
            sx={{ position: 'fixed', bottom: 80, right: 16 }}
            onClick={() => setAccountDialog(true)}
          >
            <Add />
          </Fab>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          {/* Thème */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Mode sombre" 
                  secondary="Activer le thème sombre pour l'application"
                />
                <Switch 
                  checked={appSettings.theme === 'dark'} 
                  onChange={e => updateAppSettings({ theme: e.target.checked ? 'dark' : 'light' })} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Mode compact" 
                  secondary="Réduire l'espacement des éléments"
                />
                <Switch 
                  checked={appSettings.display?.compactMode || false} 
                  onChange={e => updateAppSettings({ 
                    display: { 
                      ...appSettings.display, 
                      compactMode: e.target.checked 
                    } 
                  })} 
                />
              </ListItem>
            </List>
          </Paper>

          {/* Langue et devise */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Langue" 
                  secondary="Choisir la langue de l'application"
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={appSettings.language || 'fr'}
                    onChange={(e) => updateAppSettings({ language: e.target.value })}
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
                  primary="Devise" 
                  secondary="Choisir la devise d'affichage"
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={appSettings.currency || 'EUR'}
                    onChange={(e) => updateAppSettings({ currency: e.target.value })}
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
                  primary="Afficher les pourcentages" 
                  secondary="Montrer les pourcentages dans les graphiques"
                />
                <Switch 
                  checked={appSettings.display?.showPercentages || true} 
                  onChange={e => updateAppSettings({ 
                    display: { 
                      ...appSettings.display, 
                      showPercentages: e.target.checked 
                    } 
                  })} 
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          {/* Authentification */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Verrouillage automatique" 
                  secondary="Verrouiller l'app après inactivité"
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
                  primary="Authentification biométrique" 
                  secondary="Utiliser l'empreinte digitale ou Face ID"
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
                  primary="Partage de données" 
                  secondary="Autoriser le partage de données anonymes"
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
                  primary="Changer le mot de passe" 
                  secondary="Modifier votre mot de passe de sécurité"
                />
                <Button variant="outlined" size="small">
                  Modifier
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          {/* Notifications */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Alertes de budget" 
                  secondary="Recevoir des alertes quand vous dépassez votre budget"
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
                  primary="Rappels de factures" 
                  secondary="Rappels pour les factures à venir"
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
                  primary="Objectifs d'épargne" 
                  secondary="Notifications pour les objectifs d'épargne"
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
                  primary="Rapports hebdomadaires" 
                  secondary="Recevoir un résumé hebdomadaire"
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
                  primary="Exporter les données" 
                  secondary="Sauvegarder toutes vos données"
                />
                <Button variant="outlined" size="small" onClick={handleExport}>
                  Exporter
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CloudUpload color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Importer les données" 
                  secondary="Restaurer vos données depuis un fichier"
                />
                <Button variant="outlined" size="small" component="label">
                  Importer
                  <input type="file" hidden accept=".json" onChange={handleImport} />
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
                  primary="Supprimer toutes les données" 
                  secondary="Cette action est irréversible"
                />
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={() => setDeleteDialog(true)}
                >
                  Supprimer
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
                  primary="Se déconnecter" 
                  secondary="Fermer votre session"
                />
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={logout}
                >
                  Déconnexion
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      {activeTab === 5 && (
        <Box>
          {/* Tutoriel */}
          <Paper sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <School color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Tutoriel interactif" 
                  secondary="Relancer le guide d'introduction pour découvrir toutes les fonctionnalités"
                />
                <Button variant="outlined" size="small" onClick={handleRestartTutorial}>
                  Relancer
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Help color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Centre d'aide" 
                  secondary="Consulter la documentation et les FAQ"
                />
                <Button variant="outlined" size="small">
                  Consulter
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Feedback color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Envoyer un feedback" 
                  secondary="Partager vos suggestions et signaler des problèmes"
                />
                <Button variant="outlined" size="small" onClick={() => setFeedbackDialog(true)}>
                  Feedback
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <BugReport color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Signaler un bug" 
                  secondary="Signaler un problème technique"
                />
                <Button variant="outlined" size="small">
                  Signaler
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
                  primary="Version de l'application" 
                  secondary="Budget Gestion v1.0.0"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Star color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Évaluer l'application" 
                  secondary="Donner votre avis sur l'App Store"
                />
                <Button variant="outlined" size="small">
                  Évaluer
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
                  primary="Support client" 
                  secondary="Contacter notre équipe support"
                />
                <Button variant="outlined" size="small">
                  Contacter
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      {/* Dialog de profil */}
      <Dialog open={profileDialog} onClose={() => setProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier le profil</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Prénom"
              value={profileForm.firstName}
              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Nom"
              value={profileForm.lastName}
              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Téléphone"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="URL de l'avatar (optionnel)"
              value={profileForm.avatar}
              onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialog(false)}>Annuler</Button>
          <Button onClick={handleProfileSave} variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de compte */}
      <Dialog open={accountDialog} onClose={() => setAccountDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAccount ? 'Modifier le compte' : 'Ajouter un compte'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nom du compte"
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type de compte</InputLabel>
              <Select
                value={accountForm.type}
                onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                label="Type de compte"
              >
                {accountTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Solde initial"
              type="number"
              value={accountForm.balance}
              onChange={(e) => setAccountForm({ ...accountForm, balance: parseFloat(e.target.value) || 0 })}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Devise</InputLabel>
              <Select
                value={accountForm.currency}
                onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value })}
                label="Devise"
              >
                {currencies.map(curr => (
                  <MenuItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Couleur du compte"
              type="color"
              value={accountForm.color}
              onChange={(e) => setAccountForm({ ...accountForm, color: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleAccountSave} 
            variant="contained"
            disabled={!accountForm.name}
          >
            {editingAccount ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer {editingAccount ? `le compte "${editingAccount.name}"` : 'toutes les données'} ? 
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Annuler</Button>
          <Button 
            onClick={() => editingAccount ? handleAccountDelete(editingAccount.id) : handleDeleteData()} 
            color="error" 
            variant="contained"
          >
            Supprimer
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