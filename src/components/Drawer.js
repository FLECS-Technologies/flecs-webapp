import * as React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
// import Box from '@mui/material/Box'
import MuiDrawer from '@mui/material/Drawer'
import List from '@mui/material/List'
// import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import ListItemButton from '@mui/material/ListItemButton'
import WidgetIcon from '@mui/icons-material/Widgets'
import MarketplaceIcon from '@mui/icons-material/Store'
import SettingsIcon from '@mui/icons-material/Settings'
import { withRouter } from 'react-router-dom'
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
  const { history } = props
  const [open, setOpen] = React.useState(true)

  const handleDrawerMove = () => {
    setOpen(!open)
  }

  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index)
    switch (index) {
      case 0:
        history.push('/')
        break
      case 1:
        history.push('/Marketplace')
        break
      case 2:
        history.push('/System')
        break
      default:
        history.push('/')
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
            selected={selectedIndex === 0}
            onClick={(event) => handleListItemClick(event, 0)}
            aria-label="Apps"
          >
            <ListItemIcon>
              <WidgetIcon />
            </ListItemIcon>
            <ListItemText primary="Apps" />
          </ListItemButton>
          <ListItemButton
            selected={selectedIndex === 1}
            onClick={(event) => handleListItemClick(event, 1)}
            aria-label="Marketplace"
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
            selected={selectedIndex === 2}
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

export default withRouter(MiniDrawer)
