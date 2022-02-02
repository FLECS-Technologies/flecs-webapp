/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Thu Dec 23 2021
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
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { IconButton } from '@mui/material'
import { MoreHoriz, MoreVert } from '@mui/icons-material'

export default function AppLinksMenu (props) {
  const { appLinks, vertIcon } = props
  const [anchorEl, setAnchorEl] = React.useState(null)

  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
      <div>
        <IconButton
            aria-label="more-button"
            id="long-button"
            aria-controls="long-menu"
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
        >
            {vertIcon ? <MoreVert data-testid='more-vert-icon'/> : <MoreHoriz data-testid='more-horiz-icon'/>}
        </IconButton>
        <Menu
            data_testid="app-links-menu"
            id="menu"
            MenuListProps={{ 'aria-labelledby': 'long-button' }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
        >
            {appLinks && appLinks.map((link) => (
                <MenuItem data_testid={link.url} key={link} component='a' href={(link.url) ? link.url : '#'} target='_blank'>
                    {(link.title) ? link.title : 'further information'}
                </MenuItem>
            ))}
        </Menu>
      </div>
  )
}
AppLinksMenu.propTypes = {
  appLinks: PropTypes.array,
  vertIcon: PropTypes.bool
}
