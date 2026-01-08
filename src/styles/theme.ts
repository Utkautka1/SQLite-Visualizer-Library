export const theme = {
  colors: {
    primary: '#6366f1', // Indigo 500
    primaryHover: '#4f46e5', // Indigo 600
    primaryLight: '#e0e7ff', // Indigo 100
    secondary: '#64748b', // Slate 500
    secondaryHover: '#475569', // Slate 600
    success: '#10b981', // Emerald 500
    danger: '#ef4444', // Red 500
    warning: '#f59e0b', // Amber 500
    info: '#3b82f6', // Blue 500
    light: '#f8fafc', // Slate 50
    dark: '#1e293b', // Slate 800
    white: '#ffffff',
    black: '#000000',
    border: '#e2e8f0', // Slate 200
    background: '#f1f5f9', // Slate 100
    backgroundDark: '#0f172a', // Slate 900
    surface: '#ffffff',
    text: '#334155', // Slate 700
    textLight: '#94a3b8', // Slate 400
    textDark: '#1e293b', // Slate 800
    gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo to Purple
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    round: '50%',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', Menlo, Monaco, Consolas, 'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
      xxxl: '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },
  transitions: {
    default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
};

export type Theme = typeof theme;
