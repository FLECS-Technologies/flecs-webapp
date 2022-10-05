/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Apr 11 2022
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
import React, { createContext } from 'react'
import PropTypes from 'prop-types'

const SystemContext = createContext([])

const SystemContextProvider = ({ children }) => {
  // ping === TRUE: Deamon is available. ping === FALSE: Deamon is currently not available
  const [ping, setPing] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [systemInfo, setSystemInfo] = React.useState()
  return (
    <SystemContext.Provider value={{ ping, setPing, loading, setLoading, systemInfo, setSystemInfo }}>
      {children}
    </SystemContext.Provider>
  )
}

function useSystemContext () {
  return React.useContext(SystemContext)
}

export { SystemContext, SystemContextProvider, useSystemContext }

SystemContextProvider.propTypes = {
  children: PropTypes.any
}
