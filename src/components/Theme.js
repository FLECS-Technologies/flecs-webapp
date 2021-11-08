import { createTheme } from "@material-ui/core/styles";
//import "./Theme.css";

const baseTheme = createTheme({
  typography: {
    fontFamily: "'Quicksand'"
    //fontFamilySecondary: "'Roboto Condensed', sans-serif"
  },

  container: {
    display: "flex"
  }
});

const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    type: "dark",
    primary: {
      // pink
      main: "#FF2E63"
    },
    // cyan
    secondary: {
      main: "#08D9D6"
    }
  }
});

const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    type: "light",
    primary: {
      // cyan
      main: "#08D9D6"
    },
    // pink
    secondary: {
      main: "#FF2E63"
    }
  }
});

export { darkTheme, lightTheme };
