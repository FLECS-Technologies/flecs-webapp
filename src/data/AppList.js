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

import { useContext, useEffect, useState, React } from 'react'
import { ReferenceDataContext } from './ReferenceDataContext'
import { marketPlaceAppsList } from './MarketplaceAppsList'
import { installedAppsList } from './InstalledAppsList'
import DeviceAPI from '../api/DeviceAPI'

function AppList () {
  const { setAppList } = useContext(ReferenceDataContext)

  const [marketplaceAppList] = useState([...marketPlaceAppsList])
  const [installedAppList, setInstalledAppList] = useState([...installedAppsList])
  let mergedList = []

  // todo: call api from the marketplace to get all apps
  //   useEffect(() => {
  //       setMarketPlaceList(marketplaceAppList => [...marketplaceAppList, ...marketPlaceAppsList]);
  //   }, []);

  // call api from the device to get all installed apps
  useEffect(async () => {
    const deviceAPI = new DeviceAPI()
    await deviceAPI.getInstalledApps()
    if (deviceAPI.lastAPICallSuccessfull) {
      console.log('... now we put the appList into the browsers state. The appList has the values of: ' + deviceAPI.appList)
      console.log(deviceAPI.appList)
      setInstalledAppList([deviceAPI.appList])

      mergedList = Object.values([...marketplaceAppList, ...installedAppList]
        .reduce((r, o) => {
          r[o.app] = r[o.app]
            ? { ...r[o.app], instances: [...r[o.app].instances, ...o.instances], status: o.status }
            : o

          return r
        }, {}))
    } else {
      console.error('Something went wrong at deviceAPI.getInstalledApps(). This is the error message:' + deviceAPI.lastAPIError)
    }
  }, [])

  useEffect(() => {
    setAppList(appList => [...mergedList])
    console.log('Set the appList to the merged list')
    console.log(mergedList)
  }, [])
  return (<></>)
}

export default AppList
