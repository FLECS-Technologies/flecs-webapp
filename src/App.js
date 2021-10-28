import { ThemeProvider } from "@mui/material/styles";
import { Route, Switch } from "react-router-dom";
import "./styles.css";
import AppBar from "./AppBar";
import Drawer from "./Drawer";
import theme from "./Theme";
import Apps from "./DeviceApps";
import Marketplace from "./Marketplace";
import System from "./System";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  container: {
    display: "flex"
  }
});

export default function App() {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <ThemeProvider theme={theme}>
        <AppBar />
        <Drawer />
        <Switch>
          <Route exact from="/" render={(props) => <Apps {...props} />} />
          <Route
            exact
            path="/Marketplace"
            render={(props) => <Marketplace {...props} />}
          />
          <Route
            exact
            path="/System"
            render={(props) => <System {...props} />}
          />
        </Switch>
      </ThemeProvider>
    </div>
  );
}
