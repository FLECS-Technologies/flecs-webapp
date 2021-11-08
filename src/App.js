import React from "react";
import { Route, Switch } from "react-router-dom";
import AppBar from "./components/AppBar";
import Drawer from "./components/Drawer";

import Layout from "./components/Layout";
import { DarkModeState } from "./components/ThemeHandler";

import Apps from "./pages/DeviceApps";
import Marketplace from "./pages/Marketplace";
import System from "./pages/System";
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
      <DarkModeState>
        <Layout>
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
        </Layout>
      </DarkModeState>
    </div>
  );
}
