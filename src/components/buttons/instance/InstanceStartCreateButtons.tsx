/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jun 03 2025
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
import React from 'react';
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Tooltip,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { Loading } from '../../../components/Loading';

interface App {
  multiInstance: boolean;
  instances: any[];
}

interface InstanceStartCreateButtonsProps {
  app: App;
  startNewInstanceCallback: () => void;
  createNewInstanceCallback: () => void;
  loading: boolean;
  uninstalling: boolean;
}

enum Action {
  Create = 0,
  StartAndCreate = 1,
}

const action_names = ['Create', 'Create & start'];

export const InstanceStartCreateButtons: React.FC<InstanceStartCreateButtonsProps> = ({
  app,
  startNewInstanceCallback,
  createNewInstanceCallback,
  loading,
  uninstalling,
}: InstanceStartCreateButtonsProps) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedAction, setSelectedAction] = React.useState(Action.StartAndCreate);

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    action: Action,
  ) => {
    setSelectedAction(action);
    setOpen(false);
  };

  const executeAction = (action: Action) => {
    if (action === Action.StartAndCreate) {
      startNewInstanceCallback();
    } else if (action === Action.Create) {
      createNewInstanceCallback();
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  const disabled = (app.instances.length > 0 && !app.multiInstance) || uninstalling || loading;
  let action_tooltip = `${action_names[selectedAction] || ''} a new instance`;
  if (disabled) {
    if (uninstalling || loading) {
      action_tooltip = `Please wait until the current action is complete`;
    } else if (app.instances.length > 0 && !app.multiInstance) {
      action_tooltip = `App can only have one instance, please delete the existing instance if you want to create a new one`;
    }
  }

  return (
    <React.Fragment>
      <ButtonGroup variant="contained" ref={anchorRef} aria-label={`new-instance-button`}>
        <Loading loading={loading}>
          <Tooltip title={action_tooltip} disableInteractive>
            <span>
              <Button
                onClick={() => executeAction(selectedAction)}
                startIcon={<AddTaskIcon />}
                aria-label="execute-action"
                disabled={disabled}
              >
                {`${action_names[selectedAction]} new instance` || 'error'}
              </Button>
            </span>
          </Tooltip>
        </Loading>
        <Tooltip title={`Select action`} disableInteractive>
          <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select-action"
            aria-haspopup="menu"
            onClick={handleToggle}
            sx={{
              ...(disabled && {
                backgroundColor: (theme) => theme.palette.action.disabledBackground,
                color: (theme) => theme.palette.action.disabled,
                pointerEvents: 'auto', // allow clicks
              }),
            }}
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
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem aria-label="select-action-menu">
                  {[Action.StartAndCreate, Action.Create].map((action) => (
                    <MenuItem
                      key={action}
                      selected={selectedAction === action}
                      onClick={(event) => handleMenuItemClick(event, action)}
                    >
                      {action_names[action] || 'Error'}
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
};
