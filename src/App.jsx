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
import { DarkModeState } from './components/ThemeHandler'
import Frame from './components/Frame'
import { ReferenceDataContextProvider } from './data/ReferenceDataContext'
import { AppList } from './data/AppList'
import { AuthProvider } from './components/AuthProvider'
import { UIRoutes } from './pages/ui-routes'
import { SystemContextProvider } from './data/SystemProvider'
import { SystemData } from './data/SystemData'
import { JobsContextProvider } from './data/JobsContext'
import { FilterContextProvider } from './data/FilterContext'
import { QuestContextProvider } from './components/quests/QuestContext'

export default function App() {
  return (
    <DarkModeState>
      <AuthProvider>
        <JobsContextProvider>
          <QuestContextProvider>
            <FilterContextProvider>
              <Frame>
                <SystemContextProvider>
                  <SystemData>
                    <ReferenceDataContextProvider>
                      <AppList>
                        <UIRoutes />
                      </AppList>
                    </ReferenceDataContextProvider>
                  </SystemData>
                </SystemContextProvider>
              </Frame>
            </FilterContextProvider>
          </QuestContextProvider>
        </JobsContextProvider>
      </AuthProvider>
    </DarkModeState>
  )
}
