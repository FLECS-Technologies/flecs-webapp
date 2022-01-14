/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { React } from 'react'
import { Route, Routes } from 'react-router-dom'

import { DarkModeState } from './components/ThemeHandler'
import Frame from './components/Frame'

import { ReferenceDataContextProvider } from './data/ReferenceDataContext'

import InstalledApps from './pages/InstalledApps'
import Marketplace from './pages/Marketplace'
import System from './pages/System'
import AppList from './data/AppList'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import { AuthProvider, RequireAuth } from './components/AuthProvider'

export default function App () {
  return (
    <DarkModeState>
      <AuthProvider>
        <Frame>
          <ReferenceDataContextProvider>
            <AppList>
              <Routes>
                <Route path="/" element={<InstalledApps />} />
                <Route path="/Marketplace" element={<RequireAuth />}>
                  <Route
                    path="/Marketplace"
                    element={<Marketplace />}
                  />
                </Route>
                <Route
                  path="/System"
                  element={<System/>}
                />
                <Route
                  path="/Login"
                  element={<Login/>}
                />
                <Route
                  path="*"
                  element={<NotFound/>}
                />
              </Routes>
            </AppList>
          </ReferenceDataContextProvider>
        </Frame>
      </AuthProvider>
    </DarkModeState>
  )
}
