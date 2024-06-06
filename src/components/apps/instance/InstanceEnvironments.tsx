/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Apr 25 2024
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
import React, { useEffect, useState } from 'react'
import {
  Box,
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
import {
  fetchEnvironments,
  putEnvironments
} from '../../../api/device/instances/environment/environment'
import { Delete } from '@mui/icons-material'
import HelpButton from '../../help/HelpButton'
import { instanceenvconfig } from '../../help/helplinks'

function InstanceEnvironments(
  props: InferProps<typeof InstanceEnvironments.propTypes>
) {
  const { instanceId } = props
  const [environments, setEnvironments] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [envsChanged, setEnvsChanged] = React.useState(false)

  useEffect(() => {
    if (!loading) fetchEnvs()
  }, [])

  const fetchEnvs = async () => {
    setLoading(true)
    await fetchEnvironments(instanceId)
      .then((data) => {
        setEnvironments(data)
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }

  const handleChange = (index: Number, newValue: string) => {
    const updatedEnvironments = environments.map((value, idx) => {
      if (idx === index) {
        return newValue
      }
      return value
    })
    setEnvironments(updatedEnvironments)
    setEnvsChanged(true)
  }

  const addEnvironment = () => {
    setEnvironments([...environments, ''])
    setEnvsChanged(true)
  }

  const deleteEnvironment = (index: number) => {
    const updatedEnvironments = environments.filter((_, idx) => idx !== index)
    setEnvironments(updatedEnvironments)
    setEnvsChanged(true)
  }

  const saveEnvironments = async () => {
    setSaving(true)
    await putEnvironments(instanceId, environments)
      .then(() => {
        setError(false)
        setSaving(false)
        setEnvsChanged(false)
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
              <Typography variant='h6'>
                Environment Variables
                <HelpButton
                  url={instanceenvconfig}
                  label='Help for settings of app environments'
                ></HelpButton>
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={6}>
              <Alert sx={{ mb: 2 }} severity='info'>
                <AlertTitle>Info</AlertTitle>
                <Typography variant='body2'>
                  Here you can add environment variables to the instance of this
                  app.
                </Typography>
                <Typography variant='body2'>
                  After changing the environment variables you have to restart
                  the instance in order to apply them.
                </Typography>
              </Alert>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={6}>
              <Button
                onClick={addEnvironment}
                variant='contained'
                startIcon={<AddIcon></AddIcon>}
                sx={{ margin: 1 }}
                disabled={loading || saving}
              >
                Add Environment Variable
              </Button>
              <Button
                onClick={saveEnvironments}
                variant='outlined'
                disabled={loading || saving || !envsChanged}
              >
                Save Environments
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {environments.map((env, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  type='text'
                  label='Use key=value (e.g. myEnv=123). Do not use quotation marks.'
                  fullWidth
                  required
                  value={env ?? ''}
                  onChange={(e) => handleChange(index, e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  aria-label='delete-env-button'
                  onClick={() => deleteEnvironment(index)}
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
InstanceEnvironments.propTypes = {
  instanceId: PropTypes.string.isRequired
}

export default InstanceEnvironments
