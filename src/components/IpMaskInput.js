/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu May 05 2022
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
import { Input } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'

const IpMaskInput = ({ ip, changeIP, name, ...other }) => {
  const [valid, setValid] = React.useState(true)
  const handleIPChange = (event) => {
    const subips = event.target.value.split('.')
    const invalidSubips = subips.filter(ip => {
      ip = parseInt(ip)
      return ip < 0 || ip > 255
    })
    if (invalidSubips.length === 0 && subips.length === 4) {
      changeIP(name, event.target.value)
      setValid(true)
    }
  }

  return (
    <Input
        {...other}
        aria-label='IpInputMask'
        onChange={handleIPChange}
        color={valid ? 'primary' : 'error'}
        value={ip}
    />)
}

IpMaskInput.propTypes = {
  ip: PropTypes.string,
  changeIP: PropTypes.func,
  name: PropTypes.string
}

export default IpMaskInput
