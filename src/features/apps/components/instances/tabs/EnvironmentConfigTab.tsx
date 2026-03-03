/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { Plus, Save } from 'lucide-react';
import { InstanceEnvironmentVariable } from '@flecs/core-client-ts';
import ActionSnackbar from '@shared/components/ActionSnackbar';
import EnvironmentVariableCard from './environments/EnvironmentVariableCard';
import { useProtectedApi } from '@shared/api/ApiProvider';

interface EnvironmentConfigTabProps {
  instanceId: string;
  onChange: (hasChanges: boolean) => void;
}

const EnvironmentConfigTab: React.FC<EnvironmentConfigTabProps> = ({ instanceId, onChange }) => {
  const executedRef = useRef(false);
  const api = useProtectedApi();
  const [envVars, setEnvVars] = useState<InstanceEnvironmentVariable[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState<InstanceEnvironmentVariable[]>([]);
  const [newIndices, setNewIndices] = useState<Set<number>>(new Set());
  const [modifiedIndices, setModifiedIndices] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    clipBoardContent: '',
  });

  const hasChanges = newIndices.size > 0 || modifiedIndices.size > 0;

  const fetchEnvironment = async () => {
    setLoading(true);
    try {
      const environmentData = (
        await api.instances.instancesInstanceIdConfigEnvironmentGet(instanceId)
      ).data as InstanceEnvironmentVariable[];

      if (Array.isArray(environmentData)) {
        setEnvVars(environmentData);
        setSavedSnapshot(environmentData.map((e) => ({ ...e })));
        setNewIndices(new Set());
        setModifiedIndices(new Set());
      }
    } catch (error) {
      console.error('Failed to fetch environment variables:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (executedRef.current) return;
    if (!loading) fetchEnvironment();
    executedRef.current = true;
  }, []);

  useEffect(() => {
    onChange(hasChanges);
  }, [hasChanges]);

  const handleAdd = () => {
    setEnvVars((prev) => {
      const next = [...prev, { name: '', value: '' }];
      setNewIndices((s) => new Set(s).add(next.length - 1));
      return next;
    });
  };

  const handleChange = useCallback((index: number, key: string, value: string) => {
    setEnvVars((prev) => prev.map((env, i) => (i === index ? { ...env, [key]: value } : env)));
    setModifiedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const handleDelete = async (index: number) => {
    const envVar = envVars[index];

    // New unsaved row — just remove locally
    if (newIndices.has(index)) {
      setEnvVars((prev) => prev.filter((_, i) => i !== index));
      // Reindex new and modified sets
      setNewIndices((prev) => {
        const next = new Set<number>();
        prev.forEach((i) => {
          if (i < index) next.add(i);
          else if (i > index) next.add(i - 1);
        });
        return next;
      });
      setModifiedIndices((prev) => {
        const next = new Set<number>();
        prev.forEach((i) => {
          if (i < index) next.add(i);
          else if (i > index) next.add(i - 1);
        });
        return next;
      });
      return;
    }

    // Saved row — delete via API
    if (envVar.name) {
      try {
        await api.instances.instancesInstanceIdConfigEnvironmentVariableNameDelete(
          instanceId,
          envVar.name,
        );
        onChange(true);
        setEnvVars((prev) => prev.filter((_, i) => i !== index));
        // Reindex
        setNewIndices((prev) => {
          const next = new Set<number>();
          prev.forEach((i) => {
            if (i < index) next.add(i);
            else if (i > index) next.add(i - 1);
          });
          return next;
        });
        setModifiedIndices((prev) => {
          const next = new Set<number>();
          prev.forEach((i) => {
            if (i < index) next.add(i);
            else if (i > index) next.add(i - 1);
          });
          return next;
        });
        setSavedSnapshot((prev) => prev.filter((_, i) => i !== index));
        setSnackbarState({
          alertSeverity: 'success',
          snackbarText: `Deleted "${envVar.name}"`,
          clipBoardContent: '',
        });
        setSnackbarOpen(true);
      } catch {
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: 'Failed to delete environment variable!',
          clipBoardContent: '',
        });
        setSnackbarOpen(true);
      }
    }
  };

  const handleSaveAll = async () => {
    try {
      const variables = envVars
        .filter(({ name }) => name)
        .map(({ name, value }) => ({ name, value }));

      await api.instances.instancesInstanceIdConfigEnvironmentPut(instanceId, variables);
      onChange(true);
      setSavedSnapshot(variables.map((e) => ({ ...e })));
      setNewIndices(new Set());
      setModifiedIndices(new Set());
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: `Saved ${variables.length} variable${variables.length !== 1 ? 's' : ''}`,
        clipBoardContent: '',
      });
    } catch {
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: 'Failed to save environment variables!',
        clipBoardContent: '',
      });
    } finally {
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      {envVars.length === 0 ? (
        <Box
          sx={{
            py: 4,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2.5,
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            No environment variables configured.
          </Typography>
          <Button
            onClick={handleAdd}
            variant="outlined"
            size="small"
            startIcon={<Plus size={16} />}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Add Environment Variable
          </Button>
        </Box>
      ) : (
        <>
          {/* Variable rows */}
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2.5,
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {envVars.map((env, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider />}
                <EnvironmentVariableCard
                  env={{ ...env, value: env.value || '' }}
                  index={index}
                  isNew={newIndices.has(index)}
                  isModified={modifiedIndices.has(index) && !newIndices.has(index)}
                  onChange={handleChange}
                  onDelete={handleDelete}
                />
              </React.Fragment>
            ))}
          </Box>

          {/* Actions row */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              onClick={handleAdd}
              variant="text"
              size="small"
              startIcon={<Plus size={16} />}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Add Environment Variable
            </Button>

            <Box sx={{ flex: 1 }} />

            {hasChanges && (
              <Typography variant="caption" color="warning.main" fontWeight={600}>
                {newIndices.size + modifiedIndices.size} unsaved change
                {newIndices.size + modifiedIndices.size !== 1 ? 's' : ''}
              </Typography>
            )}

            <Button
              variant="contained"
              size="small"
              disabled={!hasChanges}
              onClick={handleSaveAll}
              startIcon={<Save size={14} />}
              aria-label="Save Environment Variable"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
              }}
            >
              Save All
            </Button>
          </Stack>
        </>
      )}

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
