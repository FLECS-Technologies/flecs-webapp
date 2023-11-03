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
    fontFamily: "'Quicksand'"
    // fontFamilySecondary: "'Roboto Condensed', sans-serif"
  },

  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#DEE0E0',
            '& .MuiListItemIcon-root': {
              color: '#171F24'
            }
          },
          '&$selected:hover': {
            color: '#171F24',
            '& .MuiListItemIcon-root': {
              color: '#324048'
            }
          },
          '&:hover': {
            color: '#171F24',
            '& .MuiListItemIcon-root': {
              color: '#324048'
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
      main: '#34383c'
    },

    // cyan
    secondary: {
      main: '#5c5f63'
    },

    text: {
      primary: '#34383c',
      secondary: 'rgba(255, 255, 255, 0.7)',
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
      default: '#212121',
      paper: '#cccfd0'
    },

    divider: 'rgba(255, 255, 255, 0.12)'
  }
})

const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    type: 'light',

    primary: {
      // dark grey
      main: '#171F24'
    },
    // pink
    secondary: {
      main: '#DEE0E0'
    },

    background: {
      default: '#DEE0E0',
      paper: '#324048'
    },

    text: {
      primary: '#DEE0E0',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },

    action: {
      active: '#DEE0E0',
      hover: 'rgba(255, 255, 255, 1)',
      selected: 'rgba(255, 255, 255, 1)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)'
    }
  }
})

export { darkTheme, lightTheme }
