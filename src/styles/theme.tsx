/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createTheme, ThemeOptions } from '@mui/material/styles'
import '../styles/fonts.css'
import { colors } from './tokens'

const baseTheme: ThemeOptions = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif"
  },

  palette: {
    primary: {
      main: colors.primary
    },
    secondary: {
      main: colors.secondary
    },
    success: {
      main: colors.secondary
    },
    info: {
      main: colors.accent
    }
  },

  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: colors.primary,
            '& .MuiListItemIcon-root': {
              color: colors.secondary
            }
          },
          '&$selected:hover': {
            color: colors.primary,
            '& .MuiListItemIcon-root': {
              color: colors.secondary
            }
          },
          '&:hover': {
            color: colors.secondary,
            '& .MuiListItemIcon-root': {
              color: colors.secondary
            }
          }
        },
        selected: {}
      }
    }
  }
})

const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'dark',

    text: {
      primary: '#F5F5F5',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },

    action: {
      active: '#F5F5F5',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)'
    },

    background: {
      default: '#0A0A0A',
      paper: '#313131'
    },

    divider: 'rgba(255, 255, 255, 0.12)'
  },
  components: {
    ...baseTheme.components,
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: colors.primary
        }
      }
    }
  }
})

const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'light',

    background: {
      default: '#F5F5F5',
      paper: '#fff'
    },

    text: {
      primary: '#0A0A0A'
    }
  }
})

export { darkTheme, lightTheme }
