import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  NewReleases,
  BugReport,
  Speed,
  Security,
  Star,
  Close
} from '@mui/icons-material';

const UpdateDialog = ({ open, onClose }) => {
  const currentVersion = "2.1.0";
  const previousVersion = "2.0.0";
  
  const updates = [
    {
      type: 'feature',
      icon: <NewReleases color="primary" />,
      title: 'Système de plans d\'actions',
      description: 'Créez et suivez des plans d\'actions personnalisés pour améliorer vos finances',
      category: 'Nouveau'
    },
    {
      type: 'feature',
      icon: <Star color="primary" />,
      title: 'Prévisions intelligentes améliorées',
      description: 'Analyses de tendance avec indicateurs de confiance et ajustements saisonniers',
      category: 'Amélioration'
    },
    {
      type: 'feature',
      icon: <Speed color="primary" />,
      title: 'Analyse des dépenses par catégorie',
      description: 'Interface interactive avec actions concrètes pour chaque catégorie',
      category: 'Amélioration'
    },
    {
      type: 'feature',
      icon: <CheckCircle color="primary" />,
      title: 'Recommandations IA avancées',
      description: 'Conseils personnalisés avec création automatique de plans d\'actions',
      category: 'Nouveau'
    },
    {
      type: 'fix',
      icon: <BugReport color="success" />,
      title: 'Correction des prévisions',
      description: 'Les prévisions utilisent maintenant le mois sélectionné au lieu de la date actuelle',
      category: 'Correction'
    },
    {
      type: 'fix',
      icon: <Security color="success" />,
      title: 'Amélioration de la navigation',
      description: 'Remplacement du bouton "Ajouter" redondant par "Plans d\'actions"',
      category: 'Amélioration'
    }
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Nouveau': return 'primary';
      case 'Amélioration': return 'secondary';
      case 'Correction': return 'success';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 50, height: 50 }}>
              <NewReleases sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Mise à jour disponible !
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Version {currentVersion} - {new Date().toLocaleDateString('fr-FR')}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={onClose}
            sx={{ color: 'white', minWidth: 'auto' }}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, bgcolor: 'background.paper', color: 'text.primary' }}>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark' }}>
            🎉 Nouveautés de la version {currentVersion}
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.dark' }}>
            Découvrez les nouvelles fonctionnalités et améliorations qui vont transformer votre gestion budgétaire !
          </Typography>
        </Box>

        <List>
          {updates.map((update, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {update.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {update.title}
                      </Typography>
                      <Chip 
                        label={update.category}
                        size="small"
                        color={getCategoryColor(update.category)}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {update.description}
                    </Typography>
                  }
                />
              </ListItem>
              {index < updates.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'success.dark' }}>
            🚀 Prêt à explorer ?
          </Typography>
          <Typography variant="body2" sx={{ color: 'success.dark' }}>
            Toutes ces fonctionnalités sont maintenant disponibles dans votre application. 
            Commencez par explorer les plans d'actions et les nouvelles analyses !
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          size="large"
          sx={{ px: 4 }}
        >
          Commencer à utiliser
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateDialog; 