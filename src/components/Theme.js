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
  }
});

export default theme;
