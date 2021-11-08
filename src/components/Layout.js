import React, { useContext, useEffect } from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import { darkTheme, lightTheme } from "./Theme";
import { darkModeContext } from "./ThemeHandler";

const Layout = ({ children }) => {
  const DarkModeContext = useContext(darkModeContext);
  const { darkMode, setDarkMode } = DarkModeContext;

  useEffect(() => {
    const theme = localStorage.getItem("preferred-theme");
    if (theme) {
      const themePreference = localStorage.getItem("preferred-theme");
      if (themePreference === "dark") {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    } else {
      localStorage.setItem("preferred-theme", "light");
      setDarkMode(true);
    }
    //eslint-disable-next-line
  }, []);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default Layout;
