import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
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
  Grid
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
  Star
} from '@mui/icons-material';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('fr');
  const [currency, setCurrency] = useState('EUR');
  const [exportDialog, setExportDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [feedback, setFeedback] = useState({ type: 'feedback', message: '' });

  const handleExport = () => {
    const data = {
      settings: { darkMode, notifications, language, currency },
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDialog(false);
    setSnack({ open: true, message: 'Paramètres exportés avec succès', severity: 'success' });
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          // Ici on pourrait appliquer les paramètres importés
          setSnack({ open: true, message: 'Paramètres importés avec succès', severity: 'success' });
        } catch (error) {
          setSnack({ open: true, message: 'Erreur lors de l\'import', severity: 'error' });
        }
      };
      reader.readAsText(file);
    }
    setImportDialog(false);
  };

  const handleDeleteData = () => {
    // Simulation de suppression des données
    setSnack({ open: true, message: 'Toutes les données ont été supprimées', severity: 'warning' });
    setDeleteDialog(false);
  };

  const handleFeedback = () => {
    setSnack({ open: true, message: 'Merci pour votre feedback !', severity: 'success' });
    setFeedbackDialog(false);
    setFeedback({ type: 'feedback', message: '' });
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Paramètres
      </Typography>

      {/* Profil */}
      <Paper sx={{ mb: 2 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <Person color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Profil utilisateur" 
              secondary="Gérer vos informations personnelles"
            />
            <IconButton>
              <Edit />
            </IconButton>
          </ListItem>
        </List>
      </Paper>

      {/* Apparence */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DarkMode sx={{ mr: 1 }} />
            <Typography variant="h6">Apparence</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <ListItem>
              <ListItemText 
                primary="Mode sombre" 
                secondary="Activer le thème sombre pour l'application"
              />
              <Switch checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Langue" 
                secondary="Choisir la langue de l'application"
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languages.map(lang => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Notifications */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Notifications sx={{ mr: 1 }} />
            <Typography variant="h6">Notifications</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <ListItem>
              <ListItemText 
                primary="Notifications push" 
                secondary="Recevoir des notifications sur votre appareil"
              />
              <Switch checked={notifications} onChange={e => setNotifications(e.target.checked)} />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Rappels de budget" 
                secondary="Être alerté quand vous approchez de votre limite"
              />
              <Switch defaultChecked />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Résumé hebdomadaire" 
                secondary="Recevoir un récapitulatif de vos dépenses"
              />
              <Switch defaultChecked />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Monnaie et catégories */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CurrencyExchange sx={{ mr: 1 }} />
            <Typography variant="h6">Monnaie et catégories</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <ListItem>
              <ListItemText 
                primary="Devise principale" 
                secondary="Choisir la devise pour vos transactions"
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {currencies.map(curr => (
                    <MenuItem key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Gérer les catégories" 
                secondary="Personnaliser vos catégories de dépenses"
              />
              <IconButton>
                <Edit />
              </IconButton>
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Données et sauvegarde */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Backup sx={{ mr: 1 }} />
            <Typography variant="h6">Données et sauvegarde</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                fullWidth
                onClick={() => setExportDialog(true)}
              >
                Exporter les données
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                fullWidth
                onClick={() => setImportDialog(true)}
              >
                Importer des données
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                fullWidth
                onClick={() => setDeleteDialog(true)}
              >
                Supprimer toutes les données
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Support et feedback */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Help sx={{ mr: 1 }} />
            <Typography variant="h6">Support et feedback</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <ListItem button onClick={() => setFeedbackDialog(true)}>
              <ListItemIcon>
                <Feedback />
              </ListItemIcon>
              <ListItemText 
                primary="Envoyer un feedback" 
                secondary="Partagez votre expérience avec nous"
              />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemIcon>
                <BugReport />
              </ListItemIcon>
              <ListItemText 
                primary="Signaler un bug" 
                secondary="Aidez-nous à améliorer l'application"
              />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemIcon>
                <Star />
              </ListItemIcon>
              <ListItemText 
                primary="Évaluer l'application" 
                secondary="Donnez-nous votre avis sur le store"
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Informations */}
      <Paper sx={{ mt: 2 }}>
        <List>
          <ListItem>
            <ListItemText 
              primary="Version de l'application" 
              secondary="1.0.0 (Build 2024.1.1)"
            />
            <Chip label="À jour" color="success" size="small" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Espace utilisé" 
              secondary="2.3 MB sur 50 MB"
            />
            <Tooltip title="Espace de stockage utilisé">
              <IconButton size="small">
                <Info />
              </IconButton>
            </Tooltip>
          </ListItem>
        </List>
      </Paper>

      {/* Dialogs */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Exporter les données</DialogTitle>
        <DialogContent>
          <Typography>
            Cette action va exporter tous vos paramètres et données dans un fichier JSON.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Annuler</Button>
          <Button onClick={handleExport} variant="contained">Exporter</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
        <DialogTitle>Importer des données</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Sélectionnez un fichier JSON pour importer vos données.
          </Typography>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            id="import-file"
          />
          <label htmlFor="import-file">
            <Button variant="outlined" component="span" fullWidth>
              Choisir un fichier
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Supprimer toutes les données</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action est irréversible ! Toutes vos données seront définitivement supprimées.
          </Alert>
          <Typography>
            Êtes-vous sûr de vouloir supprimer toutes vos données ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeleteData} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Envoyer un feedback</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type de feedback</InputLabel>
            <Select
              value={feedback.type}
              onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
            >
              <MenuItem value="feedback">Feedback général</MenuItem>
              <MenuItem value="bug">Signaler un bug</MenuItem>
              <MenuItem value="feature">Demande de fonctionnalité</MenuItem>
            </Select>
          </FormControl>
          <TextField
            multiline
            rows={4}
            fullWidth
            label="Votre message"
            value={feedback.message}
            onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
            placeholder="Partagez votre expérience avec nous..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleFeedback} 
            variant="contained"
            disabled={!feedback.message.trim()}
          >
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snack.open} 
        autoHideDuration={4000} 
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 