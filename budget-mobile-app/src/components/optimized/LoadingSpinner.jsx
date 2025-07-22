import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ 
  message = "Chargement en cours...", 
  size = 60, 
  fullScreen = false,
  variant = "default" 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "minimal":
        return {
          container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          },
          spinner: {
            color: '#2196f3'
          }
        };
      case "elegant":
        return {
          container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: fullScreen ? '100vh' : '200px',
            background: fullScreen ? 'linear-gradient(135deg, #10131a 0%, #232946 100%)' : 'transparent',
            p: 4
          },
          spinner: {
            color: '#2196f3',
            filter: 'drop-shadow(0 4px 8px rgba(33, 150, 243, 0.3))'
          },
          message: {
            color: fullScreen ? 'white' : 'text.primary',
            mt: 2,
            fontWeight: 500,
            textShadow: fullScreen ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
          }
        };
      default:
        return {
          container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: fullScreen ? '100vh' : '200px',
            background: fullScreen ? 'rgba(0,0,0,0.8)' : 'transparent',
            p: 4
          },
          spinner: {
            color: '#2196f3'
          },
          message: {
            color: fullScreen ? 'white' : 'text.primary',
            mt: 2,
            fontWeight: 500
          }
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Box sx={styles.container}>
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          size={size}
          sx={{
            ...styles.spinner,
            animation: 'spin 1s linear infinite',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
        {variant === "elegant" && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              animation: 'pulse 2s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(33, 150, 243, 0.5)'
            }}
          />
        )}
      </Box>
      {message && (
        <Typography variant="body1" sx={styles.message}>
          {message}
        </Typography>
      )}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}
      </style>
    </Box>
  );
};

export default LoadingSpinner; 