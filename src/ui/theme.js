import { createTheme, alpha } from '@mui/material/styles';

const primary = {
  main: '#1976d2',
  light: '#63a4ff',
  dark: '#004ba0',
  contrastText: '#ffffff',
};

const secondary = {
  main: '#00e1d6',
  light: '#66efe8',
  dark: '#00a69d',
  contrastText: '#0e111a',
};

const success = { main: '#4caf50' };
const warning = { main: '#ff9800' };
const error = { main: '#f44336' };
const info = { main: '#03a9f4' };

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary,
    secondary,
    success,
    warning,
    error,
    info,
    background: {
      default: '#10131a',
      paper: alpha('#ffffff', 0.06),
    },
    text: {
      primary: '#ffffff',
      secondary: alpha('#ffffff', 0.75),
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shadows: Array(25).fill('0 12px 40px rgba(0,0,0,0.22)'),
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)',
        },
        '::selection': { background: alpha('#00e1d6', 0.35) },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'transparent',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00e1d6 0%, #1976d2 100%)',
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.32)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, rgba(16,19,26,0.96) 0%, rgba(35,41,70,0.92) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px) saturate(120%)',
          maxHeight: '85vh',
          color: '#fff'
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#fff',
          fontWeight: 800,
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 20px',
          '& .MuiButton-root': { fontWeight: 700 },
          '& .MuiButton-outlined': { borderColor: 'rgba(255,255,255,0.28)' },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.92)'
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10,12,20,0.6)',
          backdropFilter: 'blur(4px)'
        },
      },
    },
    MuiCircularProgress: {
      defaultProps: { thickness: 4, color: 'secondary' },
      styleOverrides: {
        root: { filter: 'drop-shadow(0 6px 14px rgba(0,225,214,0.35))' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.22)'
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8 },
        bar: { borderRadius: 8 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: 'rgba(20,20,30,0.96)', border: '1px solid rgba(255,255,255,0.12)' },
      },
    },
  },
  custom: {
    gradients: {
      hero: 'linear-gradient(135deg, #00e1d6 0%, #1976d2 100%)',
      card: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)',
    },
    glass: {
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.18)',
      backdropFilter: 'blur(18px)'
    },
  },
});

export default appTheme;


