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
import React from 'react'
import PropTypes from 'prop-types'
import { useSystemContext } from './SystemProvider'
import { SystemPing } from '../api/device/SystemPingService'
import { SystemInfo } from '../api/device/SystemInfoService'

function SystemData (props) {
  const { setPing, loading, setLoading, setSystemInfo } = useSystemContext()
  const [loadingSystemInfo, setLoadingSystemInfo] = React.useState(false)

  React.useEffect(() => {
    if (!loading) {
      fetchPing()
    }
  }, [])

  React.useEffect(() => {
    if (!loadingSystemInfo) {
      fetchSystemInfo()
    }
  }, [])

  const fetchPing = async (props) => {
    setLoading(true)
    SystemPing()
      .then(() => {
        setPing(true)
      })
      .catch(() => {
        setPing(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const fetchSystemInfo = async (props) => {
    setLoadingSystemInfo(true)
    SystemInfo()
      .then((response) => {
        setSystemInfo(response)
      })
      .catch(() => {
        setSystemInfo(undefined)
      })
      .finally(() => {
        setLoadingSystemInfo(false)
      })
  }

  return (<>{props.children}</>)
}
SystemData.propTypes = {
  children: PropTypes.any
}
export { SystemData }
