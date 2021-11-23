import React, { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme, lightTheme } from './Theme'
import { darkModeContext } from './ThemeHandler'

const Layout = ({ children }) => {
  const DarkModeContext = useContext(darkModeContext)
  const { darkMode, setDarkMode } = DarkModeContext

  useEffect(() => {
    const theme = localStorage.getItem('preferred-theme')
    if (theme) {
      const themePreference = localStorage.getItem('preferred-theme')
      if (themePreference === 'dark') {
        setDarkMode(true)
      } else {
        setDarkMode(false)
      }
    } else {
      localStorage.setItem('preferred-theme', 'light')
      setDarkMode(true)
    }
    // eslint-disable-next-line
  }, []);

  return (

      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>

  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
}

export default Layout
