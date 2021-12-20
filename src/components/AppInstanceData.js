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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Box } from '@mui/system'
import TreeView from '@mui/lab/TreeView'
import TreeItem from '@mui/lab/TreeItem'

export default function AppInstanceData (props) {
  const [expanded, setExpanded] = React.useState([])
  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds)
  }
  const data = []

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  )
  return (
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <TreeView
                aria-label="controlled"
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                expanded={expanded}
                onNodeToggle={handleToggle}
                multiSelect
            >
                {renderTree(data)}
            </TreeView>
        </Box>
  )
}
