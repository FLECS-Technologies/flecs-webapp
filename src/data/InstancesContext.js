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
import GetInstancesAPI from '../api/device/InstancesAPI'

const InstancesContext = createContext([])

function InstancesContextProvider (props) {
  const [instances, setInstances] = React.useState(undefined)

  React.useEffect(() => {
    if (instances?.length === 0) {
      fetchInstances()
    }
  }, [setInstances])

  const fetchInstances = async () => {
    const getInstances = new GetInstancesAPI()
    await getInstances.fetchInstances()
    setInstances(getInstances.state.responseData)
  }

  return (
    <InstancesContext.Provider value={{ instances, setInstances, fetchInstances }}>
      {props.children}
    </InstancesContext.Provider>
  )
}

function useInstancesContext () {
  return React.useContext(InstancesContext)
}

export { InstancesContext, InstancesContextProvider, useInstancesContext }

InstancesContextProvider.propTypes = {
  children: PropTypes.any
}
