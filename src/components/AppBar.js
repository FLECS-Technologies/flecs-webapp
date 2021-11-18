import React, { useContext } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import AccountCircle from '@mui/icons-material/AccountCircle'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import CssBaseline from '@mui/material/CssBaseline'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import PropTypes from 'prop-types'
import { darkModeContext } from './ThemeHandler'
import { ReactComponent as Logo } from '../img/Flecs.svg'

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

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const DarkModeContext = useContext(darkModeContext)
  const { darkMode, setDarkMode } = DarkModeContext

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
          <Toolbar variant="dense">
            <IconButton disabled="true">
              <Logo width="24" height="24" />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              FLECS
            </Typography>
            <IconButton onClick={handleThemeChange}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
              <div>
                <IconButton
                  id="user-avatar"
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>Profile</MenuItem>
                  <MenuItem onClick={handleClose}>Sign out</MenuItem>
                </Menu>
              </div>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
    </React.Fragment>
  )
}
