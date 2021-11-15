import React from "react";
import { Route, Switch } from "react-router-dom";
import AppBar from "./components/AppBar";
import Drawer from "./components/Drawer";

import Layout from "./components/Layout";
import { DarkModeState } from "./components/ThemeHandler";

import InstalledApps from "./pages/InstalledApps";
import Marketplace from "./pages/Marketplace";
import System from "./pages/System";
//import { makeStyles } from "@mui/material/styles";
/*
const useStyles = makeStyles({
  container: {
    display: "flex"
  }
}); */

export default function App() {
  // const classes = useStyles();

  return (
    <DarkModeState>
      <Layout>
        <AppBar />
        <Drawer />
        <Switch>
          <Route exact from="/" render={(props) => <InstalledApps {...props} />} />
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
  );
}
