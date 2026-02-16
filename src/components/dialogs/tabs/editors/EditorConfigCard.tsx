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
import React, { useState } from 'react';
import { Card, ListItemText, Box, TextField, Stack, IconButton } from '@mui/material';
import { Delete, Save } from '@mui/icons-material';
import { InstanceEditor } from '@flecs/core-client-ts';
import { EditorConfigSnackbar } from '../EditorConfigTab';
import { createUrl } from '../../../../components/buttons/editors/EditorButton';
import { host, useProtectedApi } from '@contexts/api/ApiProvider';
import normalizeUrl from 'normalize-url';

interface EditorConfigCardProps {
  editor: InstanceEditor;
  instanceId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarState: React.Dispatch<React.SetStateAction<EditorConfigSnackbar>>;
}

const createCustomUrl = (editorUrl: string) => {
  return normalizeUrl(host() + editorUrl);
};

const EditorConfigCard: React.FC<EditorConfigCardProps> = ({
  editor,
  instanceId,
  setLoading,
  setSnackbarOpen,
  setSnackbarState,
}) => {
  const [editor_path_prefix, setEditorPathPrefix] = useState<string>(editor.path_prefix || '');
  const [current_editor_path_prefix, setCurrentEditorPathPrefix] = useState<string | undefined>(
    editor.path_prefix,
  );
  const api = useProtectedApi();
  const putEditorPrefix = async (port: number, pathPrefix: string) => {
    try {
      await api.instances.instancesInstanceIdConfigEditorsPortPathPrefixPut(instanceId, port, {
        path_prefix: pathPrefix,
      });
      setCurrentEditorPathPrefix(pathPrefix);
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: 'Editor prefix was saved!',
        clipBoardContent: '',
      });
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to put editor prefix:', error);
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: 'Failed to save editor prefix!',
        clipBoardContent: '' + error,
      });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteEditorPrefix = async (port: number, pathPrefix: string) => {
    try {
      await api.instances.instancesInstanceIdConfigEditorsPortPathPrefixDelete(instanceId, port);
      setCurrentEditorPathPrefix(undefined);
      setEditorPathPrefix('');
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: 'Editor prefix was deleted!',
        clipBoardContent: '',
      });
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to delete editor prefix:', error);
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: 'Failed to delete editor prefix!',
        clipBoardContent: '' + error,
      });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card key={editor.name || 'Editor at port' + editor.port} sx={{ width: '100%', p: 2, mb: 2 }}>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
        {/* Left Section */}
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <ListItemText primary={editor.name} secondary="Name" />
            </Box>
            <Box flex={1}>
              <ListItemText primary={editor.port} secondary="Port" />
            </Box>
          </Box>
          <Box>
            <ListItemText primary={createUrl(editor.url)} secondary="Fixed URL" />
          </Box>
        </Stack>

        {/* Right Section */}
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Box display="flex" alignItems="center" gap={0}>
            <TextField
              value={editor_path_prefix}
              label="Path Prefix"
              fullWidth
              onChange={(e) => setEditorPathPrefix(e.target.value)}
            />
            <IconButton
              aria-label="put-editor-prefix-button"
              disabled={!editor_path_prefix || editor_path_prefix === current_editor_path_prefix}
              onClick={() => putEditorPrefix(editor.port, editor_path_prefix)}
              sx={{ flexShrink: 0 }}
            >
              <Save />
            </IconButton>
            <IconButton
              aria-label="delete-editor-prefix-button"
              disabled={current_editor_path_prefix === undefined}
              onClick={() => deleteEditorPrefix(editor.port, editor_path_prefix)}
              sx={{ flexShrink: 0 }}
            >
              <Delete />
            </IconButton>
          </Box>
          <Box>
            <ListItemText
              primary={editor_path_prefix ? createCustomUrl('/' + editor_path_prefix) : ''}
              secondary="Custom URL created from Path Prefix"
            />
          </Box>
        </Stack>
      </Box>
    </Card>
  );
};

export default EditorConfigCard;
