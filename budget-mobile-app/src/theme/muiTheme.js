import { createTheme } from '@mui/material/styles';

// Thème MUI personnalisé
export const theme = createTheme({
  palette: {
    primary: {
      main: '#0B2545', // bleu nuit
    },
    secondary: {
      main: '#FFFFFF', // blanc
      contrastText: '#0B2545',
    },
    accent: {
      main: '#FF6B6B', // rouge clair
    },
    background: {
      default: '#1e293b',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    caption: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
  },
  spacing: 4, // unité de base de 4px
}); 