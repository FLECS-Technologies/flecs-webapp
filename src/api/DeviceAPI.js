import React from 'react'
import PropTypes from 'prop-types'
import GetInstalledAppsListAPI from '../api/InstalledAppsListAPI'

export default class DeviceAPI extends React.Component {
  getInstalledApps () {
    let returnValue = false

    const getAppListAPI = new GetInstalledAppsListAPI()
    if (getAppListAPI.getAppList()) {
      this.appList = getAppListAPI.state.responseData.appList
      returnValue = true
    }

    return returnValue
  }
}

DeviceAPI.propTypes = {
  appList: PropTypes.array
}
