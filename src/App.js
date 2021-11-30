import { React } from 'react'
import { Route, Switch } from 'react-router-dom'

import { DarkModeState } from './components/ThemeHandler'
import Frame from './components/Frame'

import { ReferenceDataContextProvider } from './data/ReferenceDataContext'

import InstalledApps from './pages/InstalledApps'
import Marketplace from './pages/Marketplace'
import System from './pages/System'
import AppList from './data/AppList'

export default function App () {
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
