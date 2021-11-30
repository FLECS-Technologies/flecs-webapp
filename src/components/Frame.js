import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Layout from './Layout'
import AppBar from './AppBar'
import Drawer from './Drawer'

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
