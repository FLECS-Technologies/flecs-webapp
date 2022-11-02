/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Feb 14 2022
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
import { useRoutes } from 'react-router-dom'
import InstalledApps from './InstalledApps'
import Marketplace from './Marketplace'
import ServiceMesh from './ServiceMesh'
import System from './System'
import NotFound from './NotFound'
import Login from './Login'
import { RequireAuth } from '../components/AuthProvider'
import OpenSource from './OpenSource'

const UIRoutes = () => {
  return useRoutes([
    { path: '//', element: <InstalledApps /> },
    {
      path: '/marketplace',
      element: <RequireAuth />,
      children: [
        { path: '/marketplace', element: <Marketplace /> }
      ]
    },
    {
      path: 'service-mesh',
      element: <ServiceMesh />
    },
    {
      path: '/system',
      element: <System />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/open-source',
      element: <OpenSource />
    },
    {
      path: '*',
      element: <NotFound />
    }
  ])
}

export { UIRoutes }
