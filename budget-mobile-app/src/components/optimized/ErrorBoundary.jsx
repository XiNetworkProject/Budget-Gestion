import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Alert,
  AlertTitle,
  Fade
} from '@mui/material';
import { 
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error }) => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 2,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <Card
          sx={{
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <ErrorIcon 
              sx={{ 
                fontSize: 64, 
                color: '#ef4444', 
                mb: 2 
              }} 
            />
            
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Oups ! Une erreur est survenue
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Nous nous excusons pour ce désagrément. L'équipe technique a été notifiée.
            </Typography>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <AlertTitle>Que faire ?</AlertTitle>
              Essayez de rafraîchir la page ou retournez à l'accueil.
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{ 
                  bgcolor: '#2563eb',
                  '&:hover': { bgcolor: '#1d4ed8' }
                }}
              >
                Rafraîchir
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
              >
                Accueil
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && error && (
              <Box sx={{ mt: 3, textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary">
                  Détails techniques (développement uniquement) :
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    mt: 1,
                    p: 2,
                    bgcolor: '#f1f5f9',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: 200
                  }}
                >
                  {error.toString()}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default ErrorBoundary; 