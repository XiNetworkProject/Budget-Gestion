// Système de design global unifié
export const DESIGN_SYSTEM = {
  // Palette de couleurs moderne
  colors: {
    // Couleurs principales
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    // Couleurs sémantiques
    financial: {
      income: '#10b981',
      expense: '#ef4444',
      savings: '#3b82f6',
      investment: '#8b5cf6',
      debt: '#f59e0b',
    },
    // Couleurs d'interface
    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      dark: '#0f172a',
      darkSecondary: '#1e293b',
      darkTertiary: '#334155',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
      muted: '#94a3b8',
    },
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#94a3b8',
    }
  },

  // Typographie moderne
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },

  // Espacement cohérent
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },

  // Bordures et rayons
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Ombres modernes
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    glow: {
      primary: '0 0 20px rgba(14, 165, 233, 0.3)',
      success: '0 0 20px rgba(34, 197, 94, 0.3)',
      warning: '0 0 20px rgba(245, 158, 11, 0.3)',
      error: '0 0 20px rgba(239, 68, 68, 0.3)',
    }
  },

  // Transitions et animations
  transitions: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }
  },

  // Breakpoints responsive
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '900px',
    lg: '1200px',
    xl: '1536px',
  },

  // Z-index système
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Effets glassmorphism
  glassmorphism: {
    light: {
      background: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
    },
    dark: {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    colored: {
      background: 'rgba(14, 165, 233, 0.1)',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(14, 165, 233, 0.2)',
    }
  },

  // Gradients modernes
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    error: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    dark: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  },

  // Composants prédéfinis
  components: {
    card: {
      padding: '1.5rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
    },
    button: {
      primary: {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        color: '#ffffff',
        borderRadius: '0.75rem',
        padding: '0.75rem 1.5rem',
        fontWeight: 600,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 25px rgba(14, 165, 233, 0.3)',
        }
      },
      secondary: {
        background: 'rgba(14, 165, 233, 0.1)',
        color: '#0ea5e9',
        borderRadius: '0.75rem',
        padding: '0.75rem 1.5rem',
        fontWeight: 600,
        border: '1px solid rgba(14, 165, 233, 0.2)',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'rgba(14, 165, 233, 0.15)',
          transform: 'translateY(-1px)',
        }
      }
    },
    input: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      '&:focus': {
        borderColor: '#0ea5e9',
        boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
        outline: 'none',
      }
    }
  }
};

// Thèmes clair et sombre
export const THEMES = {
  light: {
    mode: 'light',
    colors: {
      ...DESIGN_SYSTEM.colors,
      background: DESIGN_SYSTEM.colors.surface.primary,
      surface: DESIGN_SYSTEM.colors.surface.secondary,
      text: DESIGN_SYSTEM.colors.text.primary,
      textSecondary: DESIGN_SYSTEM.colors.text.secondary,
      border: DESIGN_SYSTEM.colors.border.light,
    }
  },
  dark: {
    mode: 'dark',
    colors: {
      ...DESIGN_SYSTEM.colors,
      background: DESIGN_SYSTEM.colors.surface.dark,
      surface: DESIGN_SYSTEM.colors.surface.darkSecondary,
      text: DESIGN_SYSTEM.colors.text.inverse,
      textSecondary: DESIGN_SYSTEM.colors.text.muted,
      border: DESIGN_SYSTEM.colors.surface.darkTertiary,
    }
  }
};

// Utilitaires
export const getThemeColor = (color, shade = 500) => {
  return DESIGN_SYSTEM.colors[color]?.[shade] || color;
};

export const getGradient = (gradient) => {
  return DESIGN_SYSTEM.gradients[gradient] || gradient;
};

export const getGlassmorphism = (variant = 'light') => {
  return DESIGN_SYSTEM.glassmorphism[variant];
};

export default DESIGN_SYSTEM; 