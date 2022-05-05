/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue May 03 2022
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
import { Box } from '@mui/system'
import { getInstanceConfig, putInstanceConfig } from '../api/InstanceConfigService'
import NICConfig from './NICConfig'
import { Button, LinearProgress, Toolbar, Typography } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import ClearIcon from '@mui/icons-material/Clear'

export default function InstanceConfig (props) {
  const { instance } = props
  const [loadingConfig, setLoadingConfig] = React.useState(false)
  const [savingConfig, setSavingConfig] = React.useState(false)
  const [reloadConfig, setReloadConfig] = React.useState(false)
  const [configChanged, setConfigChanged] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [errorText, setErrorText] = React.useState()
  const [nicConfig, setNicConfig] = React.useState({

    nics: [{
      nic: 'eth0',
      ip: '192.168.100.1',
      subnet: '255.255.255.0',
      enabled: false
    },
    {
      nic: 'eth1',
      ip: '192.168.100.2',
      subnet: '255.255.255.0',
      enabled: true
    }]
  })

  React.useEffect(() => {
    if (!loadingConfig) {
      fetchConfig()
    }
    if (reloadConfig) {
      setReloadConfig(false)
    }
  }, [reloadConfig])

  const fetchConfig = async (props) => {
    setLoadingConfig(true)

    getInstanceConfig(instance?.instanceId)
      .then((response) => {
        if (response) {
          setNicConfig(response?.nics)
        }
        setError(false)
        setConfigChanged(false)
      })
      .catch((error) => {
        setErrorText(error.message)
        // setError(true)
      })
      .finally(() => {
        setLoadingConfig(false)
      })
  }

  const saveConfig = async (props) => {
    setSavingConfig(true)
    putInstanceConfig(instance.instanceId, nicConfig)
      .then(() => {
        setError(false)
        setConfigChanged(false)
      })
      .catch((error) => {
        setErrorText(error.message)
        setError(true)
      })
      .finally(() => {
        setSavingConfig(false)
      })
  }

  return (
  <Box>
    <Toolbar>
        <Button variant='contained' sx={{ mr: 1 }} data-testid='save-button' disabled={loadingConfig || savingConfig || !configChanged} onClick={() => saveConfig()}>
            <SaveIcon sx={{ mr: 1 }}/> Save
        </Button>
        <Button variant='outlined' sx={{ mr: 1 }} data-testid='discard-button' disabled={loadingConfig || savingConfig || !configChanged} onClick={() => setReloadConfig(true)}>
            <ClearIcon sx={{ mr: 1 }}/> Discard changes
        </Button>
    </Toolbar>
    <Box alignContent='center'>
        {(error && !(loadingConfig || savingConfig)) && <Typography align='center'>Oops... {errorText}</Typography>}
        {(loadingConfig || savingConfig) && <LinearProgress color="primary"/>}
        {(loadingConfig) && <Typography align='center'>Loading configuration...</Typography>}
        {(savingConfig) && <Typography align='center'>Saving configuration...</Typography>}
    </Box>
    {(nicConfig && !error) && <NICConfig nicConfig={nicConfig} setNicConfig={setNicConfig} setConfigChanged={setConfigChanged}></NICConfig>}
  </Box>)
}

InstanceConfig.propTypes = {
  instance: PropTypes.object,
  saveConfig: PropTypes.bool
}
