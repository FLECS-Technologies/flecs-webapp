/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Trash2, Save, ExternalLink } from 'lucide-react';
import { InstanceEditor } from '@flecs/core-client-ts';
import { EditorConfigSnackbar } from '../EditorConfigTab';
import { createUrl } from '@shared/components/app-actions/editors/EditorButton';
import { host, useProtectedApi } from '@shared/api/ApiProvider';

interface EditorConfigCardProps {
  editor: InstanceEditor;
  instanceId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarState: React.Dispatch<React.SetStateAction<EditorConfigSnackbar>>;
}

const createCustomUrl = (editorUrl: string) => {
  const base = host();
  if (!base) return editorUrl;
  return new URL(editorUrl, base).toString();
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
        snackbarText: 'Editor prefix saved',
        clipBoardContent: '',
      });
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: 'Failed to save editor prefix',
        clipBoardContent: '' + error,
      });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteEditorPrefix = async (port: number) => {
    try {
      await api.instances.instancesInstanceIdConfigEditorsPortPathPrefixDelete(instanceId, port);
      setCurrentEditorPathPrefix(undefined);
      setEditorPathPrefix('');
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: 'Editor prefix deleted',
        clipBoardContent: '',
      });
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: 'Failed to delete editor prefix',
        clipBoardContent: '' + error,
      });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fixedUrl = createUrl(editor.url);
  const customUrl = editor_path_prefix ? createCustomUrl('/' + editor_path_prefix) : '';

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header: name + port */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {editor.name || 'Editor'}
        </Typography>
        <Typography
          variant="caption"
          fontFamily="monospace"
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            color: 'text.secondary',
          }}
        >
          <Box component="span" sx={{ opacity: 0.5 }}>:</Box>{editor.port}
        </Typography>
      </Stack>

      {/* Fixed URL */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
          Fixed URL
        </Typography>
        <Typography
          variant="body2"
          fontFamily="monospace"
          sx={{
            fontSize: '0.75rem',
            color: 'text.secondary',
            wordBreak: 'break-all',
          }}
        >
          {fixedUrl}
        </Typography>
      </Box>

      {/* Path prefix */}
      <Box sx={{ mb: customUrl ? 2 : 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            value={editor_path_prefix}
            label="Path Prefix"
            placeholder="e.g. apps/my-app"
            size="small"
            fullWidth
            onChange={(e) => setEditorPathPrefix(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.85rem',
                fontFamily: 'monospace',
              },
            }}
          />
          <Tooltip title="Save">
            <span>
              <IconButton
                size="small"
                aria-label="put-editor-prefix-button"
                disabled={!editor_path_prefix || editor_path_prefix === current_editor_path_prefix}
                onClick={() => putEditorPrefix(editor.port, editor_path_prefix)}
                color="primary"
              >
                <Save size={16} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete prefix">
            <span>
              <IconButton
                size="small"
                aria-label="delete-editor-prefix-button"
                disabled={current_editor_path_prefix === undefined}
                onClick={() => deleteEditorPrefix(editor.port)}
              >
                <Trash2 size={16} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {/* Custom URL */}
      {customUrl && (
        <Box>
          <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
            Custom URL
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="body2"
              fontFamily="monospace"
              sx={{
                fontSize: '0.75rem',
                color: 'info.main',
                wordBreak: 'break-all',
                flex: 1,
              }}
            >
              {customUrl}
            </Typography>
            <Tooltip title="Open in new tab">
              <IconButton size="small" onClick={() => window.open(customUrl)}>
                <ExternalLink size={14} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default EditorConfigCard;
