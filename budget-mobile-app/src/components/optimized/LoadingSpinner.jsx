import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography,
  Fade,
  Zoom
} from '@mui/material';
import { useStore } from '../../store';

const LoadingSpinner = ({ message = "Chargement...", size = 40 }) => {
  const { appSettings } = useStore();

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          gap: 2
        }}
      >
        <Zoom in timeout={500}>
          <CircularProgress
            size={size}
            sx={{
              color: appSettings.theme === 'dark' ? '#3b82f6' : '#2563eb',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
        </Zoom>
        
        <Fade in timeout={800}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            {message}
          </Typography>
        </Fade>
      </Box>
    </Fade>
  );
};

export default LoadingSpinner; 