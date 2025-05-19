/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed May 15 2025
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
import { AppInstance } from '../../../api/device/instances/instance'
import { EditorButton, createUrl } from './EditorButton'
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, Tooltip } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LaunchIcon from '@mui/icons-material/Launch'

interface OpenButtonsProps {
  instance: AppInstance,
}


const EditorDropdown: React.FC<OpenButtonsProps> = ({ instance }: OpenButtonsProps) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <React.Fragment>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label={`open-editor-button-multi`}
        disabled={instance.status !== 'running'}
      >
        <Tooltip title={`Open ${instance.editors[selectedIndex].name || 'editor'} in a new tab`} disableInteractive>
          <Button 
            onClick={() => window.open(createUrl(instance.editors[selectedIndex].url))} 
            startIcon={<LaunchIcon />} 
            aria-label="open-editor"
          >
              {instance.editors[selectedIndex].name || instance.editors[selectedIndex].port}
          </Button>
        </Tooltip>
        <Tooltip title={`Select editor`} disableInteractive>
          <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select-editor"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1, width: anchorRef.current?.clientWidth }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {instance.editors.map((editor, index) => (
                    <MenuItem
                      key={index}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {editor.name || 'Editor at port ' + editor.port}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}

export const EditorButtons: React.FC<OpenButtonsProps> = ({
  instance
}: OpenButtonsProps) => {
  return (
    <React.Fragment>
      {instance?.editors && instance.editors.length === 1 && (
        <React.Fragment>
          <EditorButton
            key={0}
            editor={instance.editors[0]}
            index={0}
          />
        </React.Fragment>
      )}
      {instance?.editors && instance.editors.length > 1 && (
        <EditorDropdown instance={instance}/>
      )}
    </React.Fragment>
  )
}
