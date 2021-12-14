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

import { React, Component } from 'react'
import PropTypes from 'prop-types'
import { ReferenceDataContext } from './ReferenceDataContext'
import { marketPlaceAppsList } from './MarketplaceAppsList'
import DeviceAPI from '../api/DeviceAPI'

class AppList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      updateNow: false
    }
  }

  componentDidMount () {
    this.loadAppList()
  }

  componentDidUpdate () {
    const { updateAppList, setUpdateAppList } = this.context
    if (updateAppList) {
      setUpdateAppList(false)
      this.loadAppList()
    }
  }

  handleUpdateAppList () {
    this.loadAppList()
  }

  loadAppList () {
    (async () => {
      const { setAppList } = this.context

      const marketplaceAppList = [...marketPlaceAppsList]
      let mergedList = []

      // todo: call api from the marketplace to get all apps
      //   useEffect(() => {
      //       setMarketPlaceList(marketplaceAppList => [...marketplaceAppList, ...marketPlaceAppsList]);
      //   }, []);

      // call api from the device to get all installed apps
      const deviceAPI = new DeviceAPI()
      await deviceAPI.getInstalledApps()
      if (deviceAPI.lastAPICallSuccessfull) {
        mergedList = Object.values([...marketplaceAppList, ...deviceAPI.appList]
          .reduce((r, o) => {
            r[o.app] = r[o.app]
              ? { ...r[o.app], instances: [...r[o.app].instances, ...o.instances], status: o.status }
              : o

            return r
          }, {}))
        setAppList(appList => [...mergedList])
      } else {
        setAppList(appList => [...marketplaceAppList])
        console.error('Something went wrong at deviceAPI.getInstalledApps(). This is the error message:' + deviceAPI.lastAPIError)
      }
    })()
      .catch(error => { console.log(error) })
  }

  render () {
    return (<>{this.props.children}</>)
  }
}
AppList.contextType = ReferenceDataContext
AppList.propTypes = {
  children: PropTypes.any
}
export default AppList
