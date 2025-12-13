/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 30 2024
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
import PropTypes, { InferProps } from 'prop-types';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import DeviceActivationButton from '../../components/buttons/license/DeviceActivationButton';
import MarketplaceLogin from '../auth/marketplace/MarketplaceLogin';
import { useMarketplaceUser } from '../providers/MarketplaceUserProvider';
import { DeviceActivationContext } from '../providers/DeviceActivationContext';

function DeviceActivation(props: InferProps<typeof DeviceActivation.propTypes>) {
  const { variant } = props;
  const { user, userChanged } = useMarketplaceUser();
  const { activate, activated, activating, error, statusText } =
    React.useContext(DeviceActivationContext);

  // Auto-activate device when marketplace user is available and device is not yet activated
  // Allow activation if:
  // - No error, OR
  // - There is an error but the user has changed (fresh login might resolve the error)
  React.useEffect(() => {
    if (user && !activated && !activating && (!error || userChanged)) {
      activate();
    }
  }, [user, activated, error, userChanged, activate]);

  // Show info box and marketplace login if:
  // - no user is available AND device is not activated, OR
  // - there is an error in the DeviceActivationProvider
  if ((!user && !activated) || error) {
    return (
      <Box>
        <Alert severity={error ? 'error' : 'info'} sx={{ mb: 2 }}>
          <AlertTitle>Device Activation Required</AlertTitle>
          <Typography variant="body2">
            To activate this device, you need to login with your marketplace account and use one of
            your device licenses. Please login below to continue with the activation process.
          </Typography>
          {statusText && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              Status: {statusText}
            </Typography>
          )}
        </Alert>
        <MarketplaceLogin />
      </Box>
    );
  }

  // Show device activation UI if user is logged in AND device is already activated AND no error
  return <DeviceActivationButton variant={variant}></DeviceActivationButton>;
}

DeviceActivation.propTypes = {
  variant: PropTypes.string,
};

export default DeviceActivation;
