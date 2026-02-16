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
import React, { useEffect, useState } from 'react';
import { Box, Typography, List, CircularProgress, Stack } from '@mui/material';
import ActionSnackbar from '../../ui/ActionSnackbar';
import { InstanceEditor } from '@flecs/core-client-ts';
import HelpButton from '../../help/HelpButton';
import { instancedeviceconfig } from '../../help/helplinks';
import EditorConfigCard from './editors/EditorConfigCard';
import { useProtectedApi } from '@contexts/api/ApiProvider';

interface EditorConfigTabProps {
  instanceId: string;
  onChange: (hasChanges: boolean) => void;
}

export interface EditorConfigSnackbar {
  snackbarText: string;
  alertSeverity: string;
  clipBoardContent: string;
}

const EditorConfigTab: React.FC<EditorConfigTabProps> = ({ instanceId, onChange }) => {
  const executedRef = React.useRef(false);
  const api = useProtectedApi();
  const [editors, setEditors] = useState<InstanceEditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    clipBoardContent: '',
  });

  const fetchEditors = async () => {
    try {
      const editorsData = await api.instances.instancesInstanceIdConfigEditorsGet(instanceId);
      if (editorsData) {
        setEditors(editorsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch editors:', error);
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: 'Failed to load editor settings!',
        clipBoardContent: '' + error,
      });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (executedRef.current) {
      return;
    }

    fetchEditors();
    executedRef.current = true;
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">App Editors</Typography>
        <HelpButton url={instancedeviceconfig}></HelpButton>
      </Stack>
      <List>
        {editors.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            App has no editors.
          </Typography>
        )}
        {editors.map((editor, index) => (
          <EditorConfigCard
            key={index}
            setLoading={setLoading}
            instanceId={instanceId}
            editor={editor}
            setSnackbarOpen={setSnackbarOpen}
            setSnackbarState={setSnackbarState}
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

export default EditorConfigTab;
