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

import React, { useContext } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import CssBaseline from '@mui/material/CssBaseline'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import PropTypes from 'prop-types'
import { darkModeContext } from './ThemeHandler'
import { ReactComponent as Logo } from '../img/Flecs.svg'
import { Stack } from '@mui/material'
import { useAuth } from './AuthProvider'
import AuthService from '../api/AuthService'
import LoginIcon from '@mui/icons-material/Login'
import PersonIcon from '@mui/icons-material/Person'
import { useNavigate } from 'react-router-dom'

function ElevationScroll (props) {
  const { children, window } = props
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined
  })

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0
  })
}

ElevationScroll.propTypes = {
  children: PropTypes.element.isRequired
}

export default function ElevateAppBar (props) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const user = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
  }, [user])

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSignout = () => {
    AuthService.logout()
    user?.setUser(null)

    setAnchorEl(null)
  }

  const handleSignIn = () => {
    navigate('/Login')
  }

  const DarkModeContext = useContext(darkModeContext)
  const { darkMode, setDarkMode } = DarkModeContext || {}

  const handleThemeChange = () => {
    if (darkMode) {
      localStorage.setItem('preferred-theme', 'light')
      setDarkMode(false)
    } else {
      localStorage.setItem('preferred-theme', 'dark')
      setDarkMode(true)
    }
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <ElevationScroll {...props}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar >
            <IconButton aria-label='FLECS-Logo' disabled={true}>
              <Logo width="24" height="24" />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              FLECS
            </Typography>
            <IconButton aria-label='change-theme-button' sx={{ ml: 1, mr: 1 }} onClick={handleThemeChange}>
              {darkMode ? <LightModeIcon aria-label='LightModeIcon' /> : <DarkModeIcon aria-label='DarkModeIcon'/>}
            </IconButton>
              <div>
                <IconButton
                  aria-label='avatar-button'
                  component="span"
                  onClick={user?.user ? (handleMenu) : (handleSignIn)}
                  size="small"
                >
                  {user?.user
                    ? (<PersonIcon aria-label="user-menu-button" />)
                    : (<LoginIcon aria-label="login-button" />)
                  }
                </IconButton>
                <Menu
                  id="user-menu"
                  aria-label="user-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem divider={true} style={{ pointerEvents: 'none' }}>
                    <Stack>
                      <Typography variant="caption">Signed in as</Typography>
                      <Typography variant="caption" style={{ fontWeight: 600 }}>
                        {user?.user?.user?.data?.display_name}
                      </Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem onClick={handleClose}>Profile</MenuItem>
                  <MenuItem onClick={handleSignout}>Sign out</MenuItem>
                </Menu>
              </div>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
    </React.Fragment>
  )
}
