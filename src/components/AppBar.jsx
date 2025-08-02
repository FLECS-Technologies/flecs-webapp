/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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

import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Badge from '@mui/material/Badge';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import { useDarkMode } from '../styles/ThemeHandler';
import Logo from './app_bar/Logo';
import { useSearchParams } from 'react-router-dom';
import { JobsContext } from '../data/JobsContext';
import HelpButton from './buttons/help/HelpButton';
import { helpdomain } from './help/helplinks';
import { appBarIconColors } from '../whitelabeling/custom-tokens';
import QuestLogDialog from './dialogs/QuestLogDialog';
import Avatar from './menus/avatar/Avatar';

function ElevationScroll(props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

ElevationScroll.propTypes = {
  children: PropTypes.element.isRequired,
};

export default function ElevateAppBar(props) {
  const [visible, setIsVisible] = React.useState(true);
  const [anchorElPopover, setAnchorElPopover] = React.useState(null);
  const [questLogOpen, setQuestLogOpen] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDarkMode, setDarkMode } = useDarkMode();
  const { jobs, fetchExports } = React.useContext(JobsContext);
  const finishedJobs = jobs?.filter(
    (j) => j.status === 'successful' || j.status === 'failed' || j.status === 'cancelled',
  );
  const open = Boolean(anchorElPopover);
  const id = open ? 'simple-popover' : undefined;

  const handleThemeChange = () => {
    setDarkMode(!isDarkMode);
  };

  React.useEffect(() => {
    fetchExports();
    isVisible();
  }, []);

  const isVisible = () => {
    const hideAppBar = searchParams.get('hideappbar');
    if (hideAppBar === 'true') {
      setIsVisible(false); // Hide when hideAppBar is explicitly 'true'
    } else {
      setIsVisible(true); // Show otherwise (including when hideAppBar is null or undefined)
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      {visible && (
        <ElevationScroll {...props}>
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Logo></Logo>
              <HelpButton url={helpdomain} sx={{ color: appBarIconColors.primary }} />
              <Button
                sx={{
                  display: jobs?.length > 0 ? 'block' : 'none',
                  minWidth: '24px',
                  color: appBarIconColors.primary,
                }}
                aria-describedby={id}
                variant="text"
                onClick={() => setQuestLogOpen(true)}
              >
                <Badge
                  color="info"
                  badgeContent={
                    finishedJobs?.length < jobs?.length ? jobs?.length - finishedJobs?.length : null
                  }
                >
                  {jobs?.filter((j) => j.status !== 'successful').length > 0 ? (
                    jobs?.filter((j) => j.status === 'failed' || j.status === 'cancelled').length >
                    0 ? (
                      <AssignmentLateIcon /> // at least one job failed or cancelled
                    ) : (
                      <AssignmentIcon />
                    ) // still running some jobs
                  ) : (
                    <AssignmentTurnedInIcon />
                  )}
                </Badge>
              </Button>

              <IconButton
                aria-label="change-theme-button"
                sx={{ ml: 1, mr: 1, color: appBarIconColors.primary }}
                onClick={handleThemeChange}
              >
                {isDarkMode ? (
                  <LightModeIcon aria-label="LightModeIcon" />
                ) : (
                  <DarkModeIcon aria-label="DarkModeIcon" />
                )}
              </IconButton>
              <Avatar />
            </Toolbar>
          </AppBar>
        </ElevationScroll>
      )}
      {ReactDOM.createPortal(
        <QuestLogDialog open={questLogOpen} onClose={() => setQuestLogOpen(false)} />,
        document.body,
      )}
    </React.Fragment>
  );
}
