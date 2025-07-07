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
import React, { useEffect, useState } from 'react';
import { Box, List, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { api } from '../../../api/flecs-core/api-client';
import { InstanceEnvironmentVariable } from '@flecs/core-client-ts';
import ActionSnackbar from '../../ActionSnackbar';
import EnvironmentVariableCard from './environments/EnvironmentVariableCard';
import HelpButton from '../../buttons/help/HelpButton';
import { instancedeviceconfig } from '../../../components/help/helplinks';

interface EnvironmentConfigTabProps {
  instanceId: string;
  onChange: (hasChanges: boolean) => void;
}

const EnvironmentConfigTab: React.FC<EnvironmentConfigTabProps> = ({ instanceId, onChange }) => {
  const executedRef = React.useRef(false);
  const [envVars, setEnvVars] = useState<InstanceEnvironmentVariable[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    clipBoardContent: '',
  });

  const fetchEnvironment = async () => {
    setLoading(true);
    try {
      const environmentData = (
        await api.instances.instancesInstanceIdConfigEnvironmentGet(instanceId)
      ).data as InstanceEnvironmentVariable[];

      if (Array.isArray(environmentData)) {
        setEnvVars(environmentData);
      } else {
        console.error('Unexpected environment data format:', environmentData);
      }
    } catch (error) {
      console.error('Failed to fetch environment variables:', error);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (executedRef.current) {
      return;
    }
    if (!loading) fetchEnvironment();

    executedRef.current = true;
  }, []);

  const handleAdd = () => {
    setEnvVars((prev) => [...prev, { name: '', value: '' }]);
  };

  const handleDelete = async (index: number) => {
    if (envVars[index].name) {
      api.instances
        .instancesInstanceIdConfigEnvironmentVariableNameDelete(instanceId, envVars[index].name)
        .then(() => {
          onChange(true);
          setEnvVars((prev) => prev.filter((_, i) => i !== index));
          setSnackbarState({
            alertSeverity: 'success',
            snackbarText: 'Environment variable deleted successfully!',
            clipBoardContent: '',
          });
        })
        .catch(() => {
          setSnackbarState({
            alertSeverity: 'error',
            snackbarText: 'Failed to delete environment variable!',
            clipBoardContent: '',
          });
        })
        .finally(() => {
          setSnackbarOpen(true);
        });
    }
  };

  const handleSave = async () => {
    try {
      const variables = envVars
        .filter(({ name }) => name)
        .map(({ name, value }) => ({ name, value }));

      await api.instances.instancesInstanceIdConfigEnvironmentPut(instanceId, variables);
      onChange(true);
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: 'Environments saved successfully!',
        clipBoardContent: '',
      });
    } catch (error) {
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: 'Failed to save environments!',
        clipBoardContent: '',
      });
    } finally {
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  function handleChange(index: number, key: string, value: string): void {
    setEnvVars((prev) => prev.map((env, i) => (i === index ? { ...env, [key]: value } : env)));
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Environment Variables</Typography>
        <HelpButton url={instancedeviceconfig}></HelpButton>
      </Stack>
      <Stack spacing={2} direction="row" sx={{ mb: 2 }}>
        <Button onClick={handleAdd} variant="text" color="secondary" startIcon={<Add />}>
          Add Environment Variable
        </Button>
      </Stack>
      <List>
        {envVars.length === 0 && <Typography>No environment variables configured.</Typography>}
        {envVars.map((env, index) => (
          <EnvironmentVariableCard
            key={index}
            env={{ ...env, value: env.value || '' }}
            index={index}
            onChange={handleChange}
            onDelete={handleDelete}
            onSave={handleSave}
          />
        ))}
      </List>
      <ActionSnackbar
        text={snackbarState.snackbarText}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.alertSeverity}
      />
    </Box>
  );
};

export default EnvironmentConfigTab;
