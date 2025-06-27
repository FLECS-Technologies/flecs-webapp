import React, { useState } from 'react';
import {
  Box,
  Divider,
  Paper,
  Tabs,
  Tab,
  Toolbar,
  Typography,
  BottomNavigation
} from '@mui/material';
import { Link } from 'react-router-dom';
import Version from '../components/Version';
import DeviceActivation from '../components/device/DeviceActivation';
import LicenseInfo from '../components/device/license/LicenseInfo';
import ExportList from '../components/lists/flecsports/ExportList';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const System = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box
      sx={{
        pb: '64px',
        boxSizing: 'border-box'
      }}
    >
      <Paper aria-label="system-page" className="box">
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 }
          }}
        >
          <Typography sx={{ flex: '0.1 0.1 10%' }} variant="h6">
            System
          </Typography>
        </Toolbar>
        <Divider />

        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="System Info" />
          <Tab label="Exports" />
        </Tabs>

        <Divider />

        {/* Tab Panels */}
        <TabPanel value={tabIndex} index={0}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You are currently running FLECS on {window.location.hostname}.
          </Typography>
          <Version />
          <Divider sx={{ my: 2 }} />
          <LicenseInfo />
          <DeviceActivation variant="line" />
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <ExportList />
        </TabPanel>
      </Paper>

      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar
        }}
        elevation={3}
      >
        <BottomNavigation>
          <Toolbar sx={{ p: { xs: 1, sm: 2 } }}>
            <Link aria-label='open-source' to='/open-source'>
              Open-Source
            </Link>
          </Toolbar>
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default System;
