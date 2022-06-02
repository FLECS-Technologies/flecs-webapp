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
import { Box, LinearProgress, Typography } from '@mui/material'
import VersionsTable from './VersionsTable'
import { getVersion } from '../api/VersionService'

export default function Version () {
  const executedRef = React.useRef(false)
  const [loadingVersion, setLoadingVersion] = React.useState(false)
  const [version, setVersion] = React.useState()
  const [error, setError] = React.useState(false)
  const [errorText, setErrorText] = React.useState()

  React.useEffect(() => {
    if (executedRef.current) { return }
    if (!loadingVersion) {
      fetchVersion()
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

  return (
    <Box>
        <Box alignContent='center'>
            {(error && !loadingVersion) && <Typography align='center'>Oops... {errorText}</Typography>}
            {loadingVersion && <LinearProgress color="primary"/>}
            {loadingVersion && <Typography align='center'>Loading configuration...</Typography>}
        </Box>
        <VersionsTable coreVersion={version} webappVersion={process.env.REACT_APP_VERSION}></VersionsTable>
    </Box>
  )
}
