/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
import React from 'react';
import { Box, Chip, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import { Trash2 } from 'lucide-react';

interface EnvironmentVariableCardProps {
  env: { name: string; value: string };
  index: number;
  isNew?: boolean;
  isModified?: boolean;
  onChange: (index: number, key: string, value: string) => void;
  onDelete: (index: number) => void;
}

const EnvironmentVariableCard: React.FC<EnvironmentVariableCardProps> = ({
  env,
  index,
  isNew,
  isModified,
  onChange,
  onDelete,
}) => {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        px: 2,
        py: 1.5,
        borderLeft: '3px solid',
        borderLeftColor: isNew
          ? 'success.main'
          : isModified
            ? 'warning.main'
            : 'transparent',
        transition: 'background-color 0.15s',
        '&:hover': {
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        },
      }}
    >
      <TextField
        label="Key"
        variant="outlined"
        size="small"
        value={env.name}
        placeholder="VARIABLE_NAME"
        onChange={(e) => onChange(index, 'name', e.target.value)}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: '0.85rem',
            fontFamily: 'monospace',
          },
        }}
      />
      <TextField
        label="Value"
        variant="outlined"
        size="small"
        value={env.value}
        placeholder="value"
        onChange={(e) => onChange(index, 'value', e.target.value)}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: '0.85rem',
            fontFamily: 'monospace',
          },
        }}
      />

      {/* State indicator */}
      {isNew && (
        <Chip
          label="New"
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600 }}
        />
      )}
      {isModified && !isNew && (
        <Chip
          label="Edited"
          size="small"
          color="warning"
          variant="outlined"
          sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600 }}
        />
      )}

      {/* Spacer when no chip */}
      {!isNew && !isModified && <Box sx={{ width: 56 }} />}

      <Tooltip title="Delete variable">
        <IconButton
          size="small"
          onClick={() => onDelete(index)}
          aria-label="Delete Environment Variable"
          sx={{
            color: 'text.disabled',
            '&:hover': { color: 'error.main' },
          }}
        >
          <Trash2 size={16} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default EnvironmentVariableCard;
