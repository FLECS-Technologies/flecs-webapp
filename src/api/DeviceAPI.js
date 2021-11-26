import React from 'react'
import PropTypes from 'prop-types'
import GetInstalledAppsListAPI from '../api/InstalledAppsListAPI'

export default class DeviceAPI extends React.Component {
  async getInstalledApps () {
    let returnValue = false

    try {
      const getAppListAPI = new GetInstalledAppsListAPI()
      const response = await fetch(getAppListAPI.getAppList())
      if (response) {
        this.appList = await getAppListAPI.state.responseData.appList
        returnValue = true
      }
    } catch (error) {
      console.log('failed to perform DeviceAPI.getInstalledApps()')
    }

    return returnValue
  }
}

DeviceAPI.propTypes = {
  appList: PropTypes.array
}
