/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 30 2024
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
import React, { useContext } from 'react'
import { DeviceActivationContext } from './DeviceActivationContext'
import { ValidateDeviceAPI } from '../../api/device/license/status'
import { ActivateDeviceAPI } from '../../api/device/license/activation'

const DeviceActivationProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [validated, setValidated] = React.useState(false)
  const [validating, setValidating] = React.useState(false)
  const [activated, setActivated] = React.useState(false)
  const [activating, setActivating] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [statusText, setStatusText] = React.useState('')

  const validate = async () => {
    setValidating(true)
    setStatusText('Checking the device activation status...')
    await ValidateDeviceAPI()
      .then((response) => {
        setValidated(response.isValid)
        setActivated(response.isValid)
        if (response.isValid) {
          setStatusText('Device is activated!')
        } else {
          setStatusText('Device is not activated!')
        }
        setError(false)
      })
      .catch(() => {
        setError(true)
        setStatusText(
          'Failed to check activation status! Please login with your account and try again.'
        )
        setActivated(false)
        setValidated(false)
      })
    setValidating(false)
  }

  const activate = async () => {
    setActivating(true)
    setStatusText('Activating the device...')
    await ActivateDeviceAPI()
      .then((response) => {
        setActivated(true)
        setValidated(true)
        setError(false)
        setStatusText('Device is activated!')
      })
      .catch(() => {
        setActivated(false)
        setValidated(false)
        setError(true)
        setStatusText(
          'Failed to activate the device! Please login with your account and try again.'
        )
      })
    setActivating(false)
  }

  const value = {
    validated,
    validate,
    validating,
    activated,
    activate,
    activating,
    error,
    statusText
  }

  React.useEffect(() => {
    validate()
  }, [])

  return (
    <DeviceActivationContext.Provider value={value}>
      {children}
    </DeviceActivationContext.Provider>
  )
}

export const useICaaSContext = () => useContext(DeviceActivationContext)

export default DeviceActivationProvider
