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

import React, { createContext, useState } from 'react'
import PropTypes from 'prop-types'

export const ReferenceDataContext = createContext([])

export const ReferenceDataContextProvider = ({ children }) => {
  const [appList, setAppList] = useState(undefined)
  const [updateAppList, setUpdateAppList] = useState(false)
  const [appListLoading, setAppListLoading] = useState(false)
  const [appListError, setAppListError] = useState(false)
  const [loadedProducts, setLoadedProducts] = useState(undefined)
  return (
    <ReferenceDataContext.Provider value={{ appList, setAppList, updateAppList, setUpdateAppList, appListLoading, setAppListLoading, appListError, setAppListError, loadedProducts, setLoadedProducts }}>
      {children}
    </ReferenceDataContext.Provider>
  )
}

export function useReferenceDataContext () {
  return React.useContext(ReferenceDataContext)
}

ReferenceDataContextProvider.propTypes = {
  children: PropTypes.any
}
