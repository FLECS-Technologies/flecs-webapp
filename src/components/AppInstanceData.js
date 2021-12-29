/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Mon Dec 20 2021
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TreeView from '@mui/lab/TreeView'
import TreeItem from '@mui/lab/TreeItem'
import { Button, Box } from '@mui/material'

export default function AppInstanceData (props) {
  const { instanceName, instanceData } = props
  const [expanded, setExpanded] = React.useState([])
  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds)
  }

  let data = ['app1.t', 'app1.u', 'app1.v', 'app1.w', 'app1.x', 'app1.y', 'app1.z', 'app2.a', 'app2.b', 'app2.b.b1', 'app2.b.b2', 'app2.c', 'app2.d', 'app2.e', 'app2.f.f0', 'app2.f.f1']

  const result = []
  const root = { path: instanceName, name: instanceName, children: [] }
  const level = { result }
  const branches = []

  if (instanceData && instanceData.length > 0) {
    data = instanceData
  }
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
    <TreeItem key={nodes.name} nodeId={nodes.name} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  )
  return (
        <Box sx={{ flexGrow: 1, width: 400, maxWidth: 400, height: 400, maxHeight: 400, overflowY: 'auto' }}>
          <Button data-testid='expand-button' onClick={handleExpandAllClick}>
            {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
          </Button>
          <TreeView
              data-testid="app-instances-data-tree"
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              expanded={expanded}
              onNodeToggle={handleToggle}
          >
              {renderTree(root)}
          </TreeView>
        </Box>
  )
}

AppInstanceData.propTypes = {
  instanceName: PropTypes.string,
  instanceData: PropTypes.array
}
