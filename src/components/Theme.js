import { createTheme } from "@mui/material/styles";
import "./Theme.css";

const baseTheme = createTheme({
  typography: {
    fontFamily: "'Quicksand'"
    //fontFamilySecondary: "'Roboto Condensed', sans-serif"
  },

  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: "#ff2e63",
            "& .MuiListItemIcon-root": {
              color: "#08D9D6"
            }
          },
          "&$selected:hover": {
            color: "ff2e63",
            "& .MuiListItemIcon-root": {
              color: "#08D9D6"
            }
          },
          "&:hover": {
            color: "#08D9D6",
            "& .MuiListItemIcon-root": {
              color: "#08D9D6"
            }
          }
        },
        selected: {}
      }
    }
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
    },

    text: {
      primary: "#fff",
      secondary: "rgba(255, 255, 255, 0.7)",
      disabled: "rgba(255, 255, 255, 0.5)"
    },

    action: {
      active: "#fff",
      hover: "rgba(255, 255, 255, 0.08)",
      selected: "rgba(255, 255, 255, 0.16)",
      disabled: "rgba(255, 255, 255, 0.3)",
      disabledBackground: "rgba(255, 255, 255, 0.12)"
    },

    background: {
      default: "#212121",
      paper: "#121212"
    },

    divider: "rgba(255, 255, 255, 0.12)"
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
