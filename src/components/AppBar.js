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
import Badge from '@mui/material/Badge'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
import Popover from '@mui/material/Popover'
import Button from '@mui/material/Button'
import PropTypes from 'prop-types'
import { darkModeContext } from './ThemeHandler'
import Logo from '../whitelabeling/Logo'
import { Stack } from '@mui/material'
import { useAuth } from './AuthProvider'
import AuthService from '../api/marketplace/AuthService'
import LoginIcon from '@mui/icons-material/Login'
import PersonIcon from '@mui/icons-material/Person'
import { useNavigate } from 'react-router-dom'
import { JobsContext } from '../data/JobsContext'
import BasicTable from './AppBarTable'

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
  const [anchorElMenu, setAnchorElMenu] = React.useState(null)
  const [anchorElPopover, setAnchorElPopover] = React.useState(null)
  const user = useAuth()
  const navigate = useNavigate()
  const { jobs, deleteJobs /*, setFetchingJobs */ } = React.useContext(JobsContext)
  const finishedJobs = jobs?.filter(j => (j.status === 'successful' || j.status === 'failed' || j.status === 'cancelled'))
  const clearAllButtonisDisabled = finishedJobs?.length === 0
  const open = Boolean(anchorElPopover)
  const id = open ? 'simple-popover' : undefined

  const handleClickPopover = (event) => {
    setAnchorElPopover(event.currentTarget)
    // setFetchingJobs(true)
  }

  const handleClosePopover = () => {
    setAnchorElPopover(null)
    // setFetchingJobs(false)
  }

  const handleMenu = (event) => {
    setAnchorElMenu(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorElMenu(null)
  }

  const handleSignout = () => {
    AuthService.logout()
    user?.setUser(null)

    setAnchorElMenu(null)
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

  const clearAllFinishedJobs = () => {
    finishedJobs.map(j => deleteJobs(j.id))
    // setFetchingJobs(false)
  }

  React.useEffect(() => {
  }, [user])

  return (
    <React.Fragment>
      <CssBaseline />
      <ElevationScroll {...props}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar >
            <Logo></Logo>

            <Button sx={{ display: jobs?.length > 0 ? 'block' : 'none', minWidth: '24px' }} aria-describedby={id} variant="text" onClick={handleClickPopover}>
              <Badge badgeContent={finishedJobs?.length < jobs?.length ? jobs?.length - finishedJobs?.length : null } sx={{ '& .MuiBadge-badge': { color: 'white', backgroundColor: '#868686' } }} >
                  {jobs?.filter(j => j.status !== 'successful').length > 0
                    ? (jobs?.filter(j => (j.status === 'failed' || j.status === 'cancelled')).length > 0
                        ? <AssignmentLateIcon color='action' /> // at least one job failed or cancelled
                        : <AssignmentIcon color='action' />) // still running some jobs
                    : <AssignmentTurnedInIcon color='action' />}
                </Badge>
            </Button>

            <Popover
              id={id}
              open={Boolean(open && jobs?.length)} // if there are no more jobs to show, then close it
              anchorEl={anchorElPopover}
              onClose={handleClosePopover}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
            >
              <Typography component={'div'} sx={{ p: 2 }}>
                {BasicTable(jobs, deleteJobs, clearAllFinishedJobs, clearAllButtonisDisabled)}
              </Typography>
            </Popover>

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
                  anchorEl={anchorElMenu}
                  keepMounted
                  open={Boolean(anchorElMenu)}
                  onClose={handleCloseMenu}
                >
                  <MenuItem divider={true} style={{ pointerEvents: 'none' }}>
                    <Stack>
                      <Typography variant="caption">Signed in as</Typography>
                      <Typography variant="caption" style={{ fontWeight: 600 }}>
                        {user?.user?.user?.data?.display_name}
                      </Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem onClick={handleCloseMenu}>Profile</MenuItem>
                  <MenuItem onClick={handleSignout}>Sign out</MenuItem>
                </Menu>
              </div>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
    </React.Fragment>
  )
}
