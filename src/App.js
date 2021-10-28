import { ThemeProvider } from "@mui/material/styles";
import { Route, Switch } from "react-router-dom";
import "./styles.css";
import AppBar from "./AppBar";
import Drawer from "./Drawer";
import theme from "./Theme";
import Apps from "./Apps";
import Marketplace from "./Marketplace";

export default function App() {
  return (
    <div className="App">
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
        </Switch>
      </ThemeProvider>
    </div>
  );
}
