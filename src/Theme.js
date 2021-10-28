import { createTheme } from "@mui/material/styles";
import "./Theme.css";

const theme = createTheme({
  palette: {
    primary: {
      // cyan
      main: "#08D9D6"
    },
    secondary: {
      // pink.
      main: "#FF2E63"
    }
  },

  typography: {
    fontFamily: "Quicksand"
  },

  overrides: {
    AppBar: {
      root: {
        color: "#FFFFFF",
        height: "36px"
      }
    }
  }
});

export default theme;
