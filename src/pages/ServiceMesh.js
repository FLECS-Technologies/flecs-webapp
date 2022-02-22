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
import { TreeItem, TreeView } from '@mui/lab'
import { Alert, AlertTitle, Button, CircularProgress, Grid, Paper, Toolbar, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import React from 'react'
import styled from 'styled-components'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import RefreshIcon from '@mui/icons-material/Refresh'
import ReportIcon from '@mui/icons-material/Report'
import useStateWithLocalStorage from '../components/LocalStorage'
import DeviceAPI from '../api/DeviceAPI'

const Header = styled.div`
  display: 'flex';
  alignItems: 'center';
  justifyContent: 'flex-end';
  padding: 32px 32px;
`
export default function ServiceMesh () {
  const [expanded, setExpanded] = useStateWithLocalStorage('service-mesh-expanded', [])
  const [loading, setLoading] = React.useState(false)
  const [refresh, setRefresh] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [errorText, setErrorText] = React.useState()
  const [data, setData] = React.useState([]) // React.useState(['app1.t', 'app1.u', 'app1.v', 'app1.w', 'app1.x', 'app1.y', 'app1.z', 'app2.a', 'app2.b', 'app2.b.b1', 'app2.b.b2', 'app2.c', 'app2.d', 'app2.e', 'app2.f.f0', 'app2.f.f1'])
  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds)
  }

  const result = []
  const root = { path: 'Service Mesh', name: 'Providers', children: [] }
  const level = { result }
  const branches = []

  const browseServiceMesh = async () => {
    setLoading(true)
    setError(false)
    const deviceAPI = new DeviceAPI()

    await deviceAPI.browseServiceMesh()

    if (deviceAPI.lastAPICallSuccessfull) {
      setData(deviceAPI.state?.serviceMeshData)
    } else {
      setErrorText('Something went wrong while loading the data! ' + deviceAPI?.lastAPIError)
      setError(true)
    }
    setLoading(false)
  }
  React.useEffect(() => {
    if (!loading) {
      browseServiceMesh()
    }
  }, [refresh])

  if (data) {
    data.forEach(path => {
      path.split('.').reduce((r, name, i, a) => {
        if (!r[name]) {
          r[name] = { result: [] }
          r.result.push({ path, name, children: r[name].result })
        }
        if (r[name].result.length > 0) {
          branches.push(name)
        }

        return r[name]
      }, level)
    })
  }

  root.children = result
  branches.push(root.name)

  const handleExpandAllClick = () => {
    setExpanded((oldExpanded) =>
      oldExpanded.length === 0 ? branches : []
    )
  }

  const renderTree = (nodes) => (
    <TreeItem key={nodes.name} nodeId={nodes.name} label={nodes.name} disabled={loading}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  )
  return (
    <>
        <Header aria-label='Header-Placeholder'/>
        <Paper data-testid='service-mesh' sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }} >
                <Typography data-testid='service-mesh-title' sx={{ flex: '0.1 0.1 10%' }} variant="h6" id="service-mesh-title" component="div" >
                    Service Mesh
                </Typography>
                {root.children.length > 0 && <Button variant='outlined' sx={{ mr: 1 }} data-testid='expand-button' onClick={handleExpandAllClick} disabled={loading}>
                    {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
                </Button>}
                <Button variant='outlined' sx={{ mr: 1 }} data-testid='refresh-button' disabled={loading} onClick={() => setRefresh(true)}>
                    <RefreshIcon sx={{ mr: 1 }}/> Refresh
                </Button>
            </Toolbar>
            <Grid container direction="column" justifyContent="center" alignItems="center" sx={{ pb: { sm: 2 } }} >
                <Grid item>
                  {loading && <CircularProgress color="primary" />}
                  {error && <ReportIcon fontSize='large' color='error'/> }
                </Grid>
                <Grid item>
                  {loading && <Typography>Loading data from the service mesh...</Typography>}
                  {error &&
                    <Typography>Oops... {errorText}</Typography>}
                  {(!error && root.children.length === 0) &&
                    <Alert severity='info'>
                      <AlertTitle>Info</AlertTitle>
                      <Typography>There is no provider that supplies data...</Typography>
                      <Typography>In order to see data here, you need to install a provider.</Typography>
                      <Typography>Currently you can use the Mosquitto MQTT Broker from our <Link to="/Marketplace">marketplace</Link>.</Typography>
                      <Typography>Just publish MQTT from your app to this broker and you will see the topics here.</Typography>
                      <Typography>Other apps can then easily access and use this data.</Typography>
                    </Alert> }
                </Grid>
            </Grid>
            {(!loading && root.children.length > 0) && <TreeView sx={{ pb: { sm: 2 } }}
                data-testid="app-instances-data-tree"
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                expanded={expanded}
                onNodeToggle={handleToggle}
                disabledItemsFocusable={loading}
            >
                {renderTree(root)}
            </TreeView>}
        </Paper>
    </>
  )
}
