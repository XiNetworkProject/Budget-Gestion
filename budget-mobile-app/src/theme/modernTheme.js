import { createTheme } from '@mui/material/styles';
import { DESIGN_SYSTEM, THEMES } from './designSystem';

// Créer un thème MUI moderne basé sur notre système de design
export const createModernTheme = (mode = 'light') => {
  const theme = THEMES[mode];
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: DESIGN_SYSTEM.colors.primary[500],
        light: DESIGN_SYSTEM.colors.primary[300],
        dark: DESIGN_SYSTEM.colors.primary[700],
        contrastText: '#ffffff',
        50: DESIGN_SYSTEM.colors.primary[50],
        100: DESIGN_SYSTEM.colors.primary[100],
        200: DESIGN_SYSTEM.colors.primary[200],
        300: DESIGN_SYSTEM.colors.primary[300],
        400: DESIGN_SYSTEM.colors.primary[400],
        500: DESIGN_SYSTEM.colors.primary[500],
        600: DESIGN_SYSTEM.colors.primary[600],
        700: DESIGN_SYSTEM.colors.primary[700],
        800: DESIGN_SYSTEM.colors.primary[800],
        900: DESIGN_SYSTEM.colors.primary[900],
      },
      secondary: {
        main: DESIGN_SYSTEM.colors.secondary[500],
        light: DESIGN_SYSTEM.colors.secondary[300],
        dark: DESIGN_SYSTEM.colors.secondary[700],
        contrastText: '#ffffff',
      },
      success: {
        main: DESIGN_SYSTEM.colors.success[500],
        light: DESIGN_SYSTEM.colors.success[300],
        dark: DESIGN_SYSTEM.colors.success[700],
        contrastText: '#ffffff',
      },
      warning: {
        main: DESIGN_SYSTEM.colors.warning[500],
        light: DESIGN_SYSTEM.colors.warning[300],
        dark: DESIGN_SYSTEM.colors.warning[700],
        contrastText: '#ffffff',
      },
      error: {
        main: DESIGN_SYSTEM.colors.error[500],
        light: DESIGN_SYSTEM.colors.error[300],
        dark: DESIGN_SYSTEM.colors.error[700],
        contrastText: '#ffffff',
      },
      info: {
        main: DESIGN_SYSTEM.colors.primary[500],
        light: DESIGN_SYSTEM.colors.primary[300],
        dark: DESIGN_SYSTEM.colors.primary[700],
        contrastText: '#ffffff',
      },
      background: {
        default: theme.colors.background,
        paper: theme.colors.surface,
      },
      text: {
        primary: theme.colors.text,
        secondary: theme.colors.textSecondary,
      },
      divider: theme.colors.border,
      // Couleurs personnalisées pour les finances
      financial: {
        income: DESIGN_SYSTEM.colors.financial.income,
        expense: DESIGN_SYSTEM.colors.financial.expense,
        savings: DESIGN_SYSTEM.colors.financial.savings,
        investment: DESIGN_SYSTEM.colors.financial.investment,
        debt: DESIGN_SYSTEM.colors.financial.debt,
      },
    },
    typography: {
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
      fontSize: 16,
      fontWeightLight: DESIGN_SYSTEM.typography.fontWeight.light,
      fontWeightRegular: DESIGN_SYSTEM.typography.fontWeight.normal,
      fontWeightMedium: DESIGN_SYSTEM.typography.fontWeight.medium,
      fontWeightBold: DESIGN_SYSTEM.typography.fontWeight.bold,
      h1: {
        fontSize: DESIGN_SYSTEM.typography.fontSize['4xl'],
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
        lineHeight: DESIGN_SYSTEM.typography.lineHeight.tight,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontSize: DESIGN_SYSTEM.typography.fontSize['3xl'],
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
        lineHeight: DESIGN_SYSTEM.typography.lineHeight.tight,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontSize: DESIGN_SYSTEM.typography.fontSize['2xl'],
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
        lineHeight: DESIGN_SYSTEM.typography.lineHeight.tight,
      },
      h4: {
        fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
        lineHeight: DESIGN_SYSTEM.typography.lineHeight.tight,
      },
      h5: {
        fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
        lineHeight: DESIGN_SYSTEM.typography.lineHeight.tight,
      },
      h6: {
        fontSize: DESIGN_SYSTEM.typography.fontSize.base,
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
        lineHeight: DESIGN_SYSTEM.typography.lineHeight.tight,
      },
      body1: {
        fontSize: DESIGN_SYSTEM.typography.fontSize.base,
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
        lineHeight: DESIGN_SYSTEM.typography.lineHeight.normal,
      },
      body2: {
        fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
        lineHeight: DESIGN_SYSTEM.typography.lineHeight.normal,
      },
      button: {
        fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
        textTransform: 'none',
        letterSpacing: '0.025em',
      },
      caption: {
        fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
        lineHeight: DESIGN_SYSTEM.typography.lineHeight.normal,
      },
      overline: {
        fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      },
    },
    shape: {
      borderRadius: parseInt(DESIGN_SYSTEM.borderRadius.lg) * 4, // Convertir rem en px
    },
    spacing: (factor) => `${DESIGN_SYSTEM.spacing[factor] || factor * 8}px`,
    shadows: [
      'none',
      DESIGN_SYSTEM.shadows.sm,
      DESIGN_SYSTEM.shadows.base,
      DESIGN_SYSTEM.shadows.md,
      DESIGN_SYSTEM.shadows.lg,
      DESIGN_SYSTEM.shadows.xl,
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
      DESIGN_SYSTEM.shadows['2xl'],
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            transition: `background-color ${DESIGN_SYSTEM.transitions.duration.normal} ${DESIGN_SYSTEM.transitions.easing.ease}`,
          },
          '*': {
            boxSizing: 'border-box',
          },
          'html, body': {
            margin: 0,
            padding: 0,
            height: '100%',
          },
          '#root': {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: DESIGN_SYSTEM.borderRadius.xl,
            textTransform: 'none',
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
            padding: '12px 24px',
            transition: `all ${DESIGN_SYSTEM.transitions.duration.normal} ${DESIGN_SYSTEM.transitions.easing.ease}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: DESIGN_SYSTEM.shadows.lg,
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          contained: {
            background: DESIGN_SYSTEM.gradients.primary,
            boxShadow: DESIGN_SYSTEM.shadows.md,
            '&:hover': {
              background: DESIGN_SYSTEM.gradients.primary,
              boxShadow: DESIGN_SYSTEM.shadows.lg,
            },
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: 'rgba(14, 165, 233, 0.08)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: DESIGN_SYSTEM.borderRadius['2xl'],
            boxShadow: DESIGN_SYSTEM.shadows.md,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.surface,
            transition: `all ${DESIGN_SYSTEM.transitions.duration.normal} ${DESIGN_SYSTEM.transitions.easing.ease}`,
            '&:hover': {
              boxShadow: DESIGN_SYSTEM.shadows.lg,
              transform: 'translateY(-4px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: DESIGN_SYSTEM.borderRadius.xl,
            background: theme.colors.surface,
          },
          elevation1: {
            boxShadow: DESIGN_SYSTEM.shadows.sm,
          },
          elevation2: {
            boxShadow: DESIGN_SYSTEM.shadows.base,
          },
          elevation3: {
            boxShadow: DESIGN_SYSTEM.shadows.md,
          },
          elevation4: {
            boxShadow: DESIGN_SYSTEM.shadows.lg,
          },
          elevation5: {
            boxShadow: DESIGN_SYSTEM.shadows.xl,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: DESIGN_SYSTEM.borderRadius.xl,
              transition: `all ${DESIGN_SYSTEM.transitions.duration.normal} ${DESIGN_SYSTEM.transitions.easing.ease}`,
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: DESIGN_SYSTEM.colors.primary[400],
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: DESIGN_SYSTEM.colors.primary[500],
                  borderWidth: '2px',
                },
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: DESIGN_SYSTEM.borderRadius.full,
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
            '&.MuiChip-colorPrimary': {
              background: DESIGN_SYSTEM.gradients.primary,
              color: '#ffffff',
            },
            '&.MuiChip-colorSecondary': {
              background: DESIGN_SYSTEM.gradients.secondary,
              color: '#ffffff',
            },
            '&.MuiChip-colorSuccess': {
              background: DESIGN_SYSTEM.gradients.success,
              color: '#ffffff',
            },
            '&.MuiChip-colorWarning': {
              background: DESIGN_SYSTEM.gradients.warning,
              color: '#ffffff',
            },
            '&.MuiChip-colorError': {
              background: DESIGN_SYSTEM.gradients.error,
              color: '#ffffff',
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            borderRadius: DESIGN_SYSTEM.borderRadius.full,
            boxShadow: DESIGN_SYSTEM.shadows.lg,
            transition: `all ${DESIGN_SYSTEM.transitions.duration.normal} ${DESIGN_SYSTEM.transitions.easing.ease}`,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: DESIGN_SYSTEM.shadows.xl,
            },
          },
          primary: {
            background: DESIGN_SYSTEM.gradients.primary,
            '&:hover': {
              background: DESIGN_SYSTEM.gradients.primary,
            },
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            background: theme.colors.surface,
            borderTop: `1px solid ${theme.colors.border}`,
            backdropFilter: 'blur(20px)',
            boxShadow: DESIGN_SYSTEM.shadows.lg,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            color: theme.colors.textSecondary,
            transition: `all ${DESIGN_SYSTEM.transitions.duration.normal} ${DESIGN_SYSTEM.transitions.easing.ease}`,
            '&.Mui-selected': {
              color: DESIGN_SYSTEM.colors.primary[500],
            },
            '&:hover': {
              color: DESIGN_SYSTEM.colors.primary[400],
            },
          },
          label: {
            fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
            '&.Mui-selected': {
              fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: DESIGN_SYSTEM.borderRadius.full,
            backgroundColor: theme.colors.border,
          },
          bar: {
            borderRadius: DESIGN_SYSTEM.borderRadius.full,
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: DESIGN_SYSTEM.colors.primary[500],
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: DESIGN_SYSTEM.borderRadius.lg,
            backgroundColor: theme.colors.border,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: DESIGN_SYSTEM.borderRadius['3xl'],
            boxShadow: DESIGN_SYSTEM.shadows['2xl'],
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiSnackbarContent-root': {
              borderRadius: DESIGN_SYSTEM.borderRadius.xl,
              boxShadow: DESIGN_SYSTEM.shadows.lg,
            },
          },
        },
      },
    },
  });
};

// Thème par défaut (clair)
export const modernTheme = createModernTheme('light');

// Thème sombre
export const modernDarkTheme = createModernTheme('dark');

export default modernTheme; 