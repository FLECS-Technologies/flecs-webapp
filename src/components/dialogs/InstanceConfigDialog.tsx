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
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Button,
  Box,
} from '@mui/material';
import EnvironmentConfigTab from './tabs/EnvironmentConfigTab';
import UsbConfigTab from './tabs/UsbConfigTab';
import NetworkConfigTab from './tabs/NetworkConfigTab';
import PortsConfigTab from './tabs/PortsConfigTab';
import { api } from '../../api/flecs-core/api-client';
import EditorConfigTab from './tabs/EditorConfigTab';

interface InstanceConfigDialogProps {
  open: boolean;
  onClose: () => void;
  instanceId: string;
  instanceName: string;
  activeTab: number;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}

const InstanceConfigDialog: React.FC<InstanceConfigDialogProps> = ({
  open,
  onClose,
  instanceId,
  instanceName,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSaveChanges = async () => {
    if (hasChanges) {
      try {
        await api.instances.instancesInstanceIdStopPost(instanceId);
        await api.instances.instancesInstanceIdStartPost(instanceId);
        setHasChanges(false);
      } catch (error) {
        console.error('Error while restarting the app instance:', error);
      }
    }
  };

  const handleClose = async () => {
    if (hasChanges) {
      setRestarting(true);
      await handleSaveChanges();
    }
    setRestarting(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        style: {
          alignSelf: 'flex-start',
        },
      }}
    >
      <DialogTitle>Configure {instanceName}</DialogTitle>
      <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
        <Tab label="USB Devices"></Tab>
        <Tab label="Network Interfaces" />
        <Tab label="Ports" />
        <Tab label="Environment Variables" />
        <Tab label="Editors" />
      </Tabs>
      <DialogContent>
        <Box mt={2}>
          {activeTab === 0 && <UsbConfigTab instanceId={instanceId} onChange={setHasChanges} />}
          {activeTab === 1 && <NetworkConfigTab instanceId={instanceId} onChange={setHasChanges} />}
          {activeTab === 2 && <PortsConfigTab instanceId={instanceId} onChange={setHasChanges} />}
          {activeTab === 3 && (
            <EnvironmentConfigTab instanceId={instanceId} onChange={setHasChanges} />
          )}
          {activeTab === 4 && <EditorConfigTab instanceId={instanceId} onChange={setHasChanges} />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={restarting}>
          {restarting ? 'Applying Changes' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstanceConfigDialog;
