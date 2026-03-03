import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import AppBar from './AppBar';
import Drawer from './Drawer';
import CommandPalette from './CommandPalette';
import { JobsRail } from '@features/notifications';
import { useSearchParams } from 'react-router-dom';

interface FrameProps {
  children: React.ReactNode;
}

const Frame = ({ children }: FrameProps) => {
  const [searchParams] = useSearchParams();
  const hideChrome = searchParams.get('hideappbar')?.toLowerCase() === 'true';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (hideChrome) {
    return <Box sx={{ p: 4 }}>{children}</Box>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar />
      <Drawer />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 2 : 4,
          pt: isMobile ? 9 : 4,
          minWidth: 0,
        }}
      >
        {children}
      </Box>
      <JobsRail />
      <CommandPalette />
    </Box>
  );
};

export default Frame;
