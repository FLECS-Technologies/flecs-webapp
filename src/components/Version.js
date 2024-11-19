/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jun 01 2022
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
import {
  Alert,
  AlertTitle,
  Box,
  LinearProgress,
  Typography
} from '@mui/material'
import VersionsTable from '../components/device/version/VersionsTable'
import {
  getLatestVersion,
  getVersion,
  isLaterThan
} from '../api/VersionService'
import { VersionSelector } from './VersionSelector'
import { useSystemContext } from '../data/SystemProvider'

export default function Version() {
  const executedRef = React.useRef(false)
  const { systemInfo } = useSystemContext()
  const [loadingVersion, setLoadingVersion] = React.useState(false)
  const [version, setVersion] = React.useState()
  const [loadingLatestVersion, setLoadingLatestVersion] = React.useState(false)
  const [latestVersion, setLatestVersion] = React.useState()
  const [error, setError] = React.useState(false)
  const [errorText, setErrorText] = React.useState()

  React.useEffect(() => {
    if (executedRef.current) {
      return
    }
    if (!loadingVersion) {
      fetchVersion()
    }
    if (!loadingLatestVersion) {
      fetchLatestVersion()
    }
    executedRef.current = true
  }, [])

  const fetchVersion = async (props) => {
    setLoadingVersion(true)

    getVersion()
      .then((response) => {
        if (response) {
          setVersion(response)
        }
        setError(false)
      })
      .catch((error) => {
        setErrorText(error.message)
        setError(true)
      })
      .finally(() => {
        setLoadingVersion(false)
      })
  }

  const fetchLatestVersion = async (props) => {
    setLoadingLatestVersion(true)

    getLatestVersion()
      .then((response) => {
        if (response) {
          setLatestVersion(response)
        }
        setError(false)
      })
      .catch((error) => {
        setErrorText(error.message)
        setError(true)
      })
      .finally(() => {
        setLoadingLatestVersion(false)
      })
  }

  return (
    <Box>
      <Box alignContent='center'>
        {error && (loadingVersion || loadingLatestVersion) && (
          <Typography align='center'>Oops... {errorText}</Typography>
        )}
        {(loadingVersion || loadingLatestVersion) && (
          <LinearProgress color='primary' />
        )}
        {(loadingVersion || loadingLatestVersion) && (
          <Typography align='center'>Loading configuration...</Typography>
        )}
      </Box>
      <Box>
        {isLaterThan(latestVersion?.version, version?.core) && (
          <Alert sx={{ mb: 2 }} severity='info'>
            <AlertTitle>Info</AlertTitle>
            <Typography variant='body2'>
              There is a newer version for FLECS available:
            </Typography>
            <VersionSelector
              availableVersions={[latestVersion]}
              selectedVersion={latestVersion}
            ></VersionSelector>
            <Typography variant='body2'>
              Install this update by running{' '}
              <i>curl -fsSL install.flecs.tech | bash</i> in the terminal of
              this device ({window.location.hostname}).
            </Typography>
          </Alert>
        )}
      </Box>
      <VersionsTable
        coreVersion={version}
        webappVersion={process.env.REACT_APP_VERSION}
        distro={systemInfo?.distro}
        kernel={systemInfo?.kernel}
      ></VersionsTable>
    </Box>
  )
}
