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
  Rocket,
  Star,
  NewReleases,
  BugReport,
  Speed,
  Security,
  Close
} from '@mui/icons-material';

const UpdateDialog = ({ open, onClose }) => {
  const currentVersion = "2.3.0";
const previousVersion = "2.2.0";
  
  const updates = [
    {
      type: 'feature',
      icon: <NewReleases color="primary" />,
      title: 'Page de login modernisée',
      description: 'Interface glassmorphism avec particules animées et design cohérent avec le thème sombre',
      category: 'Nouveau'
    },
    {
      type: 'feature',
      icon: <Star color="primary" />,
      title: 'Connexion par email',
      description: 'Nouveau système de connexion et inscription par email en plus de Google',
      category: 'Nouveau'
    },
    {
      type: 'feature',
      icon: <Security color="primary" />,
      title: 'Connexion automatique',
      description: 'Reconnexion automatique à l\'ouverture de l\'application avec option de déconnexion dans les paramètres',
      category: 'Nouveau'
    },
    {
      type: 'feature',
      icon: <CheckCircle color="primary" />,
      title: 'Gestion avancée des catégories',
      description: 'Suppression des catégories avec choix d\'icônes et couleurs personnalisées',
      category: 'Amélioration'
    },
    {
      type: 'feature',
      icon: <Speed color="primary" />,
      title: 'Paiements récurrents',
      description: 'Système complet de gestion des paiements récurrents avec rappels et suivi',
      category: 'Nouveau'
    },
    {
      type: 'feature',
      icon: <Rocket color="primary" />,
      title: 'Système de plans d\'actions',
      description: 'Créez et suivez des plans d\'actions personnalisés pour améliorer vos finances',
      category: 'Amélioration'
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
      category: 'Amélioration'
    },
    {
      type: 'fix',
      icon: <BugReport color="success" />,
      title: 'Correction de l\'onboarding',
      description: 'Correction de l\'erreur JavaScript dans l\'affichage des fonctionnalités',
      category: 'Correction'
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
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Star sx={{ color: '#FFD700' }} />
        Nouveautés de la version {currentVersion}
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

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          variant="contained" 
          onClick={onClose}
          startIcon={<Rocket />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
            }
          }}
        >
          Prêt à explorer ?
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateDialog; 