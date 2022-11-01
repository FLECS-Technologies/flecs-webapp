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

import { createTheme } from '@mui/material/styles'
import './Theme.css'

const baseTheme = createTheme({
  typography: {
    fontFamily: ["'Neue Haas Unica Pro'", "'Helvetica', sans-serif"].join(',')
  },

  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#0AADFF',
            '& .MuiListItemIcon-root': {
              color: '#0AADFF'
            }
          },
          '&$selected:hover': {
            color: '0AADFF',
            '& .MuiListItemIcon-root': {
              color: '#0AADFF'
            }
          },
          '&:hover': {
            color: '#0AADFF',
            '& .MuiListItemIcon-root': {
              color: '#0AADFF'
            }
          }
        },
        selected: {}
      }
    }
  },

  container: {
    display: 'flex'
  }
})

const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    type: 'dark',

    primary: {
      // dark grey
      main: '#868E96'
    },

    // blue
    secondary: {
      main: '#0AADFF'
    },

    text: {
      primary: '#fff',
      secondary: '#6c757d',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },

    action: {
      active: '#fff',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)'
    },

    background: {
      default: '#343a40',
      paper: '#383E44'
    },

    divider: 'rgba(255, 255, 255, 0.12)'
  }
})

const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    type: 'light',

    primary: {
      // cyan
      main: '#383E44'
    },
    // pink
    secondary: {
      main: '#0AADFF'
    },

    background: {
      default: '#FAFAFA',
      paper: '#fff'
    }
  }
})

export { darkTheme, lightTheme }
