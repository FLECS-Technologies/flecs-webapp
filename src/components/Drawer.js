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

import * as React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
import MuiDrawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import ListItemButton from '@mui/material/ListItemButton'
import WidgetIcon from '@mui/icons-material/Widgets'
import MarketplaceIcon from '@mui/icons-material/Store'
import SettingsIcon from '@mui/icons-material/Settings'
import { useNavigate, useLocation } from 'react-router-dom'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const drawerWidth = 240

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden'
})

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(7)} + 1px)`
  }
})

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0',
  minHeight: '48', // if minHeight is not set to 48 (or any other value), a minHeight of 64px is used, which makes the menu move down.
  // padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  })
}))

const MiniDrawer = (props) => {
  // const { history } = props
  const [open, setOpen] = React.useState(true)

  const handleDrawerMove = () => {
    setOpen(!open)
  }

  const navigate = useNavigate()
  const location = useLocation()

  // const [selectedIndex, setSelectedIndex] = React.useState()

  const handleListItemClick = (event, index) => {
    // setSelectedIndex(index)
    switch (index) {
      case 0:
        navigate('/')
        break
      case 1:
        navigate('/marketplace')
        break
      case 2:
        navigate('/system')
        break
      default:
        navigate('/')
        break
    }
  }

  return (
      <Drawer aria-label="FLECS-Drawer" variant="permanent" open={open}>
        <DrawerHeader aria-label="FLECS-Drawer-Header"/>
        <List component="nav" aria-label="Drawer-List-FLECS" align="right">
          <IconButton onClick={handleDrawerMove} aria-label="Minimize-Drawer">
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
          <Divider />
          <ListItemButton
            selected={location.pathname === '/'}
            onClick={(event) => handleListItemClick(event, 0)}
            aria-label="Apps"
          >
            <ListItemIcon>
              <WidgetIcon />
            </ListItemIcon>
            <ListItemText primary="Apps" />
          </ListItemButton>
          <ListItemButton
            selected={location.pathname === '/marketplace'}
            onClick={(event) => handleListItemClick(event, 1)}
            aria-label="/marketplace"
          >
            <ListItemIcon>
              <MarketplaceIcon />
            </ListItemIcon>
            <ListItemText primary="Marketplace" />
          </ListItemButton>
        </List>
        <Divider />
        <List component="nav" aria-label="Drawer-List-System">
          <ListItemButton
            selected={location.pathname === '/system'}
            onClick={(event) => handleListItemClick(event, 2)}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="System" />
          </ListItemButton>
        </List>
      </Drawer>
  )
}

MiniDrawer.propTypes = {
  history: PropTypes.any
}

export default MiniDrawer
