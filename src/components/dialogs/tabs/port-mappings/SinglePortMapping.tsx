/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Apr 16 2025
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
import { TextField, IconButton, Tooltip, Card, Icon } from '@mui/material'
import { Delete, RadioButtonChecked, Save } from '@mui/icons-material'
import TransportProtocolSelector from './TransportProtocolSelector'
import {
  InstancePortMappingRange,
  InstancePortMappingSingle,
  TransportProtocol
} from '@flecs/core-client-ts'

interface SinglePortMappingProps {
  port: InstancePortMappingSingle
  protocol: TransportProtocol
  index: number
  onChange: (
    index: number,
    field: keyof InstancePortMappingSingle | keyof InstancePortMappingRange,
    value: number | { start?: number; end?: number }
  ) => void
  sx?: object
  handleDeletePort: (index: number) => void
  handleSavePort: (protocol: string, index: number) => void
  handleProtocolChange: (index: number, protocol: TransportProtocol) => void
}

const SinglePortMapping: React.FC<SinglePortMappingProps> = ({
  port,
  protocol,
  index,
  onChange,
  handleDeletePort,
  handleSavePort,
  handleProtocolChange
}) => {
  const [changes, setChanges] = React.useState(false)

  const changeProtocol = (newProtocol: TransportProtocol) => {
    handleProtocolChange(index, newProtocol)
    setChanges(true)
  }

  return (
    <Card sx={{ display: 'flex', width: '100%', p: 2, mb: 2 }}>
      <Icon sx={{ mr: 2, alignSelf: 'center' }}>
        <RadioButtonChecked />
      </Icon>
      <TextField
        label='Host Port'
        variant='outlined'
        size='small'
        value={port.host_port}
        onChange={(e) => {
          setChanges(true)
          onChange(index, 'host_port', parseInt(e.target.value, 10) || 0)
        }}
        sx={{ flex: 1, mr: 2 }}
      />
      <TextField
        label='Container Port'
        variant='outlined'
        size='small'
        value={port.container_port}
        onChange={(e) => {
          setChanges(true)
          onChange(index, 'container_port', parseInt(e.target.value, 10) || 0)
        }}
        sx={{ flex: 1, mr: 2 }}
      />
      <TransportProtocolSelector value={protocol} onChange={changeProtocol} />
      <Tooltip title='Delete Port Mapping'>
        <IconButton
          onClick={() => handleDeletePort(index)}
          sx={{ flexShrink: 0 }}
        >
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title='Save Port Mapping'>
        <span>
          <IconButton
            aria-label='Save Port Mapping'
            onClick={() => {
              handleSavePort(protocol as TransportProtocol, index)
              setChanges(false)
            }}
            sx={{ flexShrink: 0 }}
            disabled={!changes}
          >
            <Save />
          </IconButton>
        </span>
      </Tooltip>
    </Card>
  )
}

export default SinglePortMapping
