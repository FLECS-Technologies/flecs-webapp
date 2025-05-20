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
import './custom-fonts.css'
import {
  darkTheme as flecsDarkTheme,
  lightTheme as flecsLightTheme
} from '../styles/theme'

const darkTheme = createTheme({
  ...flecsDarkTheme,
  palette: {
    ...flecsDarkTheme.palette,
    primary: {
      // light grey
      main: '#d6d6d6'
    },
    secondary: {
      // red
      main: '#e2000f'
    },
    background: {
      default: '#212121',
      paper: '#313131'
    },
  },
  components: {
    ...flecsDarkTheme.components,
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#e2000f',
            '& .MuiListItemIcon-root': {
              color: '#e2000f'
            }
          },
          '&$selected:hover': {
            color: 'e2000f',
            '& .MuiListItemIcon-root': {
              color: '#e2000f'
            }
          },
          '&:hover': {
            color: '#e2000f',
            '& .MuiListItemIcon-root': {
              color: '#e2000f'
            }
          }
        },
        selected: {}
      }
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#3f3f3f'
        }
      }
    }
  },
} as ThemeOptions)

const lightTheme = createTheme({
  ...flecsLightTheme,
  palette: {
    ...flecsLightTheme.palette,
    primary: {
      // light grey
      main: '#3f3f3f'
    },
    secondary: {
      // red
      main: '#e2000f'
    },
  },
  components: {
    ...flecsLightTheme.components,
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#e2000f',
            '& .MuiListItemIcon-root': {
              color: '#e2000f'
            }
          },
          '&$selected:hover': {
            color: 'e2000f',
            '& .MuiListItemIcon-root': {
              color: '#e2000f'
            }
          },
          '&:hover': {
            color: '#e2000f',
            '& .MuiListItemIcon-root': {
              color: '#e2000f'
            }
          }
        },
        selected: {}
      }
    }
  },
})

export { darkTheme, lightTheme }
