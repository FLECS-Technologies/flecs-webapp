/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Feb 18 2022
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
import { Alert, AlertTitle, CircularProgress, Grid, Paper, Toolbar, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import React from 'react'
import styled from 'styled-components'
import ReportIcon from '@mui/icons-material/Report'
import DeviceAPI from '../api/device/DeviceAPI'
import DataTable from '../components/DataTable'

const Header = styled.div`
  display: 'flex';
  alignItems: 'center';
  justifyContent: 'flex-end';
  padding: 32px 32px;
`
export default function ServiceMesh () {
  const executedRef = React.useRef(false)
  const [loading, setLoading] = React.useState(false)
  const [refresh, setRefresh] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [errorText, setErrorText] = React.useState()
  const [data, setData] = React.useState([])

  const browseServiceMesh = async () => {
    setLoading(true)
    setError(false)
    const deviceAPI = new DeviceAPI()

    await deviceAPI.browseServiceMesh()

    if (deviceAPI.lastAPICallSuccessfull) {
      setData(deviceAPI?.serviceMeshData)
    } else {
      setErrorText('Something went wrong while loading the data! ' + deviceAPI?.lastAPIError)
      setError(true)
    }
    setLoading(false)
  }
  React.useEffect(() => {
    if (executedRef.current) { return }
    if (!loading) {
      browseServiceMesh()
    }
    if (refresh) {
      setRefresh(false)
    }
    executedRef.current = true
  }, [refresh])

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setRefresh(true)
      executedRef.current = false
    }, 5000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <>
        <Header aria-label='Header-Placeholder'/>
        <Paper data-testid='service-mesh' sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }} >
                <Typography data-testid='service-mesh-title' sx={{ flex: '0.1 0.1 10%' }} variant="h6" id="service-mesh-title" component="div" >
                    Service Mesh
                </Typography>
                {loading && <CircularProgress color="primary" />}
            </Toolbar>
            <Grid container direction="column" justifyContent="center" alignItems="center" sx={{ pb: { sm: 2 } }} >
                <Grid item>
                  {error && <ReportIcon fontSize='large' color='error'/> }
                </Grid>
                <Grid item>
                  {loading && <Typography>Loading data from the service mesh...</Typography>}
                  {error &&
                    <Typography>Oops... {errorText}</Typography>}
                  {(!error && data?.length === 0) &&
                    <Alert severity='info'>
                      <AlertTitle>Info</AlertTitle>
                      <Typography>There is no provider that supplies data...</Typography>
                      <Typography>In order to see data here, you need to install a provider.</Typography>
                      <Typography>Currently you can use the Mosquitto MQTT Broker and the FLECS MQTT Bridge from our <Link to="/Marketplace">marketplace</Link>.</Typography>
                      <Typography>Just publish MQTT from your app to this broker and you will see the topics here.</Typography>
                      <Typography>Other apps can then easily access and use this data.</Typography>
                      <Typography>If you want to learn how to do this, just watch this short video on <a href="https://youtu.be/lu0EES_aenA" target='_blank' rel="noopener noreferrer" aria-label='YouTube' >
                        YouTube
                        </a>.</Typography>
                    </Alert> }
                </Grid>
            </Grid>
            {(data?.length > 0) &&
              <DataTable data={data}>
              </DataTable>}
        </Paper>
    </>
  )
}
