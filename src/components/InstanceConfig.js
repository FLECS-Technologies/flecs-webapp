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
import { getInstanceConfig, putInstanceConfig } from '../api/InstanceConfigService'
import NICConfig from './NICConfig'
import { Box, Button, LinearProgress, Tab, Toolbar, Typography } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import SaveIcon from '@mui/icons-material/Save'
import ClearIcon from '@mui/icons-material/Clear'
import InstanceDevicesConfig from './InstanceDevicesConfig'

export default function InstanceConfig (props) {
  const { instance } = props
  const executedRef = React.useRef(false)
  const [tab, setTab] = React.useState('1')
  const [loadingConfig, setLoadingConfig] = React.useState(false)
  const [savingConfig, setSavingConfig] = React.useState(false)
  const [reloadConfig, setReloadConfig] = React.useState(false)
  const [triggerSaveConfig, setSaveConfig] = React.useState(false)
  const [configChanged, setConfigChanged] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [errorText, setErrorText] = React.useState()
  const [instanceConfig, setInstanceConfig] = React.useState()

  React.useEffect(() => {
    if (!savingConfig && triggerSaveConfig) {
      saveConfig()
    }
  }, [triggerSaveConfig])

  React.useEffect(() => {
    if (executedRef.current) { return }
    if (!loadingConfig) {
      fetchConfig()
    }
    if (reloadConfig) {
      setReloadConfig(false)
      setConfigChanged(false)
    }
    executedRef.current = true
  }, [reloadConfig])

  const fetchConfig = async (props) => {
    setLoadingConfig(true)

    getInstanceConfig(instance?.instanceId)
      .then((response) => {
        if (response) {
          setInstanceConfig(response)
        }
        setError(false)
        setConfigChanged(false)
      })
      .catch((error) => {
        setErrorText(error.message)
        setError(true)
      })
      .finally(() => {
        setLoadingConfig(false)
      })
  }

  const saveConfig = async (props) => {
    setSavingConfig(true)
    putInstanceConfig(instance.instanceId, instanceConfig.networkAdapters)
      .then((response) => {
        if (response) {
          // read back the saved configuration
          setInstanceConfig(response)
        }
        setError(false)
        if (triggerSaveConfig) {
          setSaveConfig(false)
        } else {
          setConfigChanged(false)
        }
      })
      .catch((error) => {
        setErrorText(error.message)
        setError(true)
      })
      .finally(() => {
        setSavingConfig(false)
      })
  }

  const handleChange = (event, newValue) => {
    setTab(newValue)
  }

  const handleReloadConfigClick = (event) => {
    setReloadConfig(true)
    executedRef.current = false
  }

  return (
  <Box>
    <Toolbar>
        <Button variant='contained' sx={{ mr: 1 }} data-testid='save-button' disabled={loadingConfig || savingConfig || !configChanged} onClick={() => saveConfig()}>
            <SaveIcon sx={{ mr: 1 }}/> Save
        </Button>
        <Button variant='outlined' sx={{ mr: 1 }} data-testid='discard-button' disabled={loadingConfig || savingConfig || !configChanged} onClick={() => handleReloadConfigClick()}>
            <ClearIcon sx={{ mr: 1 }}/> Discard changes
        </Button>
    </Toolbar>
    <Box alignContent='center'>
        {(error && !(loadingConfig || savingConfig)) && <Typography align='center'>Oops... {errorText}</Typography>}
        {(loadingConfig || savingConfig) && <LinearProgress color="primary"/>}
        {(loadingConfig) && <Typography align='center'>Loading configuration...</Typography>}
        {(savingConfig) && <Typography align='center'>Saving configuration...</Typography>}
    </Box>
    {(!error) &&
    <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Network" value="1" />
            <Tab label="Devices" value="2" />
          </TabList>
        </Box>

        <TabPanel value="1">
          <NICConfig testID='nic-config' nicConfig={instanceConfig} setNicConfig={setInstanceConfig} setConfigChanged={setConfigChanged} saveConfig={setSaveConfig}></NICConfig>
        </TabPanel>
        <TabPanel value="2">
          <InstanceDevicesConfig testID='devices-config' instanceConfig={instanceConfig} setDevicesConfig={setInstanceConfig} setConfigChanged={setConfigChanged} saveConfig={setSaveConfig} ></InstanceDevicesConfig>
        </TabPanel>
      </TabContext>}
  </Box>)
}

InstanceConfig.propTypes = {
  instance: PropTypes.object,
  saveConfig: PropTypes.bool
}
