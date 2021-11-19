import React from 'react'
// import clsx from 'clsx'
import PropTypes from 'prop-types'
// import { styled } from '@mui/styles'
import Box from '@mui/material/Box'
import Layout from './Layout'
import AppBar from './AppBar'
import Drawer from './Drawer'

// const drawerWidth = 240

/* const Main = styled(Box, {

})
*/

const Frame = ({ children }) => {
  return (
    <Layout>
      <Box sx={{ display: 'flex' }}>
        <AppBar/>
        <Drawer/>
        <Box component="main" sx={{ flexGrow: 1, p: 1 }}>
            {children}
        </Box>
      </Box>
    </Layout>
  )
}

Frame.propTypes = {
  children: PropTypes.any
}

export default Frame
