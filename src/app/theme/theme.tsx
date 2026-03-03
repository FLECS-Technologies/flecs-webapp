import { createTheme, ThemeOptions } from '@mui/material/styles';
import './fonts.css';
import { brand, colors } from './tokens';

const baseTheme: ThemeOptions = {
  spacing: 4,
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontWeight: 700, fontSize: '48px' },
    h2: { fontWeight: 700, fontSize: '36px' },
    h3: { fontWeight: 700, fontSize: '32px' },
    h4: { fontWeight: 600, fontSize: '24px' },
    h5: { fontWeight: 600, fontSize: '20px' },
    h6: { fontWeight: 600, fontSize: '16px' },
    body1: { fontWeight: 400, fontSize: '16px' },
    body2: { fontWeight: 400, fontSize: '14px' },
    caption: { fontWeight: 400, fontSize: '12px' },
  },
  palette: {
    primary: { main: brand.primary },
    secondary: { main: brand.accent },
    success: { main: brand.success },
    warning: { main: brand.warning },
    error: { main: brand.error },
    info: { main: brand.accent },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: brand.primary,
            '& .MuiListItemIcon-root': { color: brand.primary },
          },
          '&:hover': {
            color: brand.primary,
            '& .MuiListItemIcon-root': { color: brand.primary },
          },
        },
      },
    },
  },
};

const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'dark',
    text: {
      primary: '#F5F5F5',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    action: {
      active: '#F5F5F5',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    background: {
      default: brand.dark,
      paper: brand.darkEnd,
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    ...baseTheme.components,
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: { backgroundColor: brand.dark },
      },
    },
  },
});

const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'light',
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: brand.dark,
    },
  },
});

export { darkTheme, lightTheme };
