/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Jun 07 2024
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
import React, { useEffect } from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  Button,
  Alert,
  AlertTitle,
  TextField,
  IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PropTypes, { InferProps } from 'prop-types'
import { Delete } from '@mui/icons-material'
import { putPorts, fetchPorts } from '../../../api/device/instances/ports/ports'

function InstancePorts(props: InferProps<typeof InstancePorts.propTypes>) {
  const { instanceId } = props
  const [ports, setPorts] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [portsChanged, setPortsChanged] = React.useState(false)

  useEffect(() => {
    if (!loading) fetchInstancePorts()
  }, [])

  const fetchInstancePorts = async () => {
    setLoading(true)
    await fetchPorts(instanceId)
      .then((data) => {
        setPorts(data)
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }

  const handleChange = (index: Number, newValue: string) => {
    const updatedPorts = ports.map((value, idx) => {
      if (idx === index) {
        return newValue
      }
      return value
    })
    setPorts(updatedPorts)
    setPortsChanged(true)
  }

  const addPort = () => {
    setPorts([...ports, ''])
    setPortsChanged(true)
  }

  const deletePort = (index: number) => {
    const updatedPorts = ports.filter((_, idx) => idx !== index)
    setPorts(updatedPorts)
    setPortsChanged(true)
  }

  const savePorts = async () => {
    setSaving(true)
    await putPorts(instanceId, ports)
      .then(() => {
        setError(false)
        setSaving(false)
        setPortsChanged(false)
      })
      .catch(() => {
        setError(true)
        setSaving(false)
      })
  }

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={6}>
              <Typography variant='h6'>Port mappings</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={6}>
              <Alert sx={{ mb: 2 }} severity='info'>
                <AlertTitle>Info</AlertTitle>
                <Typography variant='body2'>
                  Here you can add port mappings to the instance of this app.
                </Typography>
                <Typography variant='body2'>
                  After changing the port mapping you have to restart the
                  instance in order to apply it.
                </Typography>
              </Alert>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={6}>
              <Button
                onClick={addPort}
                variant='contained'
                startIcon={<AddIcon></AddIcon>}
                sx={{ margin: 1 }}
                disabled={loading || saving}
              >
                Add Port Mapping
              </Button>
              <Button
                onClick={savePorts}
                variant='outlined'
                disabled={loading || saving || !portsChanged}
              >
                Save Port Mappings
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ports.map((port, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  type='text'
                  label='Use host:container (e.g. 8081:80 to map the container port 80 to the port 8081 on the host). Do not use quotation marks.'
                  fullWidth
                  required
                  value={port ?? ''}
                  onChange={(e) => handleChange(index, e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  aria-label='delete-port-button'
                  onClick={() => deletePort(index)}
                  disabled={loading || saving}
                >
                  <Delete></Delete>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
InstancePorts.propTypes = {
  instanceId: PropTypes.string.isRequired
}

export default InstancePorts
