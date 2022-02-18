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
import { Button, CircularProgress, Grid, Paper, Toolbar, Typography } from '@mui/material'
import React from 'react'
import styled from 'styled-components'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import RefreshIcon from '@mui/icons-material/Refresh'
import useStateWithLocalStorage from '../components/LocalStorage'
import ActionSnackbar from '../components/ActionSnackbar'
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
  const [data, setData] = React.useState(['app1.t', 'app1.u', 'app1.v', 'app1.w', 'app1.x', 'app1.y', 'app1.z', 'app2.a', 'app2.b', 'app2.b.b1', 'app2.b.b2', 'app2.c', 'app2.d', 'app2.e', 'app2.f.f0', 'app2.f.f1'])
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    snackbarErrorText: ''
  })
  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds)
  }

  const result = []
  const root = { path: 'Service Mesh', name: 'Providers', children: [] }
  const level = { result }
  const branches = []

  const browseServiceMesh = async () => {
    setLoading(true)
    let snackbarText
    let alertSeverity
    const deviceAPI = new DeviceAPI()

    await deviceAPI.browseServiceMesh()

    if (deviceAPI.lastAPICallSuccessfull) {
      setData(deviceAPI.state.serviceMeshData)
    } else {
      // error snackbar
      snackbarText = 'Failed to load data from the service mesh.'
      alertSeverity = 'error'
    }
    setSnackbarState({
      alertSeverity: alertSeverity,
      snackbarText: snackbarText,
      snackbarErrorText: deviceAPI?.lastAPIError
    })
    setSnackbarOpen(true)
    setLoading(false)
  }
  React.useEffect(() => {
    if (!loading) {
      browseServiceMesh()
    }
  }, [refresh])

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
        <Paper sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }} >
                <Typography sx={{ flex: '0.1 0.1 10%' }} variant="h6" id="service-mesh-title" component="div" >
                    Service Mesh
                </Typography>
                <Button sx={{ mr: 1 }} data-testid='expand-button' onClick={handleExpandAllClick} disabled={loading}>
                    {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
                </Button>
                <Button sx={{ mr: 1 }} data-testid='refresh-button' disabled={loading} onClick={() => setRefresh(true)}>
                    <RefreshIcon sx={{ mr: 1 }}/> Refresh
                </Button>
            </Toolbar>
            {loading && <Grid container direction="column" justifyContent="center" alignItems="center" sx={{ pb: { sm: 2 } }} >
                <Grid item>
                    <CircularProgress color="primary" />
                </Grid>
                <Grid item>
                    <Typography>Loading data from the service mesh...</Typography>
                </Grid>
            </Grid>}
            {!loading && <TreeView sx={{ pb: { sm: 2 } }}
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
        <ActionSnackbar
          data-testid="snackbar"
          text={snackbarState.snackbarText}
          errorText={snackbarState.snackbarErrorText}
          open={snackbarOpen}
          setOpen={setSnackbarOpen}
          alertSeverity={snackbarState.alertSeverity}
        />
    </>
  )
}
