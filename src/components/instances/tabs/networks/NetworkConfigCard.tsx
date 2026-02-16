/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Apr 16 2025
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
import { Card, Tooltip, ListItemText, Button } from '@mui/material';
import { NetworkState } from '../NetworkConfigTab';
import { Cancel, CheckCircle, Wifi, WifiOff } from '@mui/icons-material';

interface NetworkConfigCardProps {
  network: NetworkState;
  onActivationChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    name: string,
  ) => void;
}

const NetworkConfigCard: React.FC<NetworkConfigCardProps> = ({ network, onActivationChange }) => {
  return (
    <Card sx={{ display: 'flex', width: '100%', p: 2, mb: 2 }} key={network.id}>
      <Tooltip
        title={`Adapter ${network.name} ${network.is_connected ? 'connected' : 'not connected'}`}
      >
        {network.is_connected ? (
          <Wifi
            sx={{ mr: 2, alignSelf: 'center' }}
            color={network.is_activated ? 'success' : 'error'}
          />
        ) : (
          <WifiOff
            sx={{ mr: 2, alignSelf: 'center' }}
            color={network.is_activated ? 'success' : 'error'}
          />
        )}
      </Tooltip>
      <ListItemText primary={network.name} secondary="Adapter" sx={{ flex: 1, mr: 2 }} />
      {network.ipAddress && (
        <ListItemText primary={network.ipAddress} secondary="IP Address" sx={{ flex: 1, mr: 2 }} />
      )}
      <Button
        sx={{ flexShrink: 0 }}
        color={network.is_activated ? 'error' : 'success'}
        startIcon={network.is_activated ? <Cancel /> : <CheckCircle />}
        onClick={() =>
          onActivationChange(
            {
              target: { checked: !network.is_activated },
            } as React.ChangeEvent<HTMLInputElement>,
            network.id,
            network.name,
          )
        }
      >
        {network.is_activated ? 'Disconnect' : 'Connect'}
      </Button>
    </Card>
  );
};

export default NetworkConfigCard;
