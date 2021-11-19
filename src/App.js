import { /* useContext, */ React } from 'react'
import { Route, Switch } from 'react-router-dom'
// import AppBar from './components/AppBar'
// import Drawer from './components/Drawer'

// import Layout from './components/Layout'
import { DarkModeState } from './components/ThemeHandler'
import Frame from './components/Frame'

import { /* ReferenceDataContext , */ ReferenceDataContextProvider } from './data/ReferenceDataContext'

import InstalledApps from './pages/InstalledApps'
import Marketplace from './pages/Marketplace'
import System from './pages/System'
import AppList from './data/AppList'

// import { makeStyles } from "@mui/material/styles";
/*
const useStyles = makeStyles({
  container: {
    display: "flex"
  }
}); */

export default function App () {
  // const classes = useStyles();
  // const { appList } = useContext(ReferenceDataContext)

  return (
    <DarkModeState>
      <Frame>
        <ReferenceDataContextProvider>
          <AppList/>
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
        </ReferenceDataContextProvider>
      </Frame>
    </DarkModeState>
  )
}
