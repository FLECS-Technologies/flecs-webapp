/*
 * Copyright (c) 2024 FLECS Technologies GmbH
 *
 * Created on Tue Oct 08 2024
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
import FLECSLogo from './FLECSLogo';
import { Box, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

const PoweredByFLECS: React.FC = () => {
  const [visible, setIsVisible] = React.useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    isVisible();
  }, [searchParams]);

  const isVisible = () => {
    const hideAppBar = searchParams.get('hideappbar');
    if (hideAppBar?.toLowerCase() === 'true') {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  return (
    <div>
      {visible && (
        <Box
          component="a"
          aria-label="powered-by-link"
          role="link" // Explicitly add the role for testing purposes
          href="https://flecs.tech" // Link to FLECS
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'inline-flex', // Inline with content width
            alignItems: 'center', // Vertically align items
            textDecoration: 'none', // No underline on the link
            padding: '6px 12px', // Balanced padding
            borderRadius: '8px', // Softer corners for a modern look
            border: '1px solid', // Subtle border
            borderColor: 'primary.main', // Border color using theme primary color
            backgroundColor: 'background.paper', // Default background color
            transition: 'background-color 0.3s ease, color 0.3s ease', // Smooth transition
            '&:hover': {
              backgroundColor: 'background.default', // Subtle change to background (slightly darker or lighter)
              '.MuiTypography-root': {
                color: 'text.secondary', // Slightly change text to a secondary color
              },
            },
          }}
        >
          <FLECSLogo /> {/* Logo remains the primary color */}
          <Typography
            sx={{
              marginLeft: 1,
              fontSize: '0.875rem',
              color: 'text.primary', // Initial text color
              transition: 'color 0.3s ease', // Smooth transition for text color
            }}
          >
            powered by FLECS
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default PoweredByFLECS;
