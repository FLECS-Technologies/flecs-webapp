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
  components: {
    ...flecsDarkTheme.components,
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#00E47C',
            '& .MuiListItemIcon-root': {
              color: '#00e47c'
            }
          },
          '&$selected:hover': {
            color: '00E47C',
            '& .MuiListItemIcon-root': {
              color: '#00e47c'
            }
          },
          '&:hover': {
            color: '#00e47c',
            '& .MuiListItemIcon-root': {
              color: '#00e47c'
            }
          }
        },
        selected: {}
      }
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#051D19'
        }
      }
    }
  },
  palette: {
    ...flecsDarkTheme.palette,
    primary: {
      main: '#051D19'
    },
    secondary: {
      main: '#00904F'
    },
    background: {
      default: '#212121',
      paper: '#313131'
    },
  }
} as ThemeOptions)

const lightTheme = createTheme({
  ...flecsLightTheme,
  components: {
    ...flecsLightTheme.components,
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#00E47C',
            '& .MuiListItemIcon-root': {
              color: '#00e47c'
            }
          },
          '&$selected:hover': {
            color: '00E47C',
            '& .MuiListItemIcon-root': {
              color: '#00e47c'
            }
          },
          '&:hover': {
            color: '#00e47c',
            '& .MuiListItemIcon-root': {
              color: '#00e47c'
            }
          }
        },
        selected: {}
      }
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#08312A'
        }
      }
    }
  },
  palette:{
    ...flecsLightTheme.palette,
    primary: {
      main: '#08312A'
    },
    secondary: {
      main: '#00E47C'
    },
  }

} as ThemeOptions)

export { darkTheme, lightTheme }
