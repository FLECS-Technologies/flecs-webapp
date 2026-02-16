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
import { Card, TextField, IconButton, Tooltip } from '@mui/material';
import { Delete, Save } from '@mui/icons-material';

interface EnvironmentVariableCardProps {
  env: { name: string; value: string };
  index: number;
  onChange: (index: number, key: string, value: string) => void;
  onDelete: (index: number) => void;
  onSave: () => void;
}

const EnvironmentVariableCard: React.FC<EnvironmentVariableCardProps> = ({
  env,
  index,
  onChange,
  onDelete,
  onSave,
}) => {
  const [changes, setChanges] = React.useState(false);
  return (
    <Card sx={{ display: 'flex', width: '100%', p: 2, mb: 2 }}>
      <TextField
        label="Key"
        variant="outlined"
        size="small"
        value={env.name}
        onChange={(e) => {
          onChange(index, 'name', e.target.value);
          setChanges(true);
        }}
        sx={{ flex: 1, mr: 2 }}
      />
      <TextField
        label="Value"
        variant="outlined"
        size="small"
        value={env.value}
        onChange={(e) => {
          onChange(index, 'value', e.target.value);
          setChanges(true);
        }}
        sx={{ flex: 1, mr: 2 }}
      />
      <IconButton
        onClick={() => onDelete(index)}
        sx={{ flexShrink: 0 }}
        aria-label="Delete Environment Variable"
      >
        <Delete />
      </IconButton>
      <Tooltip title="Save Environment Variable">
        <span>
          <IconButton
            aria-label="Save Environment Variable"
            onClick={(e) => {
              onSave();
              setChanges(false);
            }}
            sx={{ flexShrink: 0 }}
            disabled={!changes}
          >
            <Save />
          </IconButton>
        </span>
      </Tooltip>
    </Card>
  );
};

export default EnvironmentVariableCard;
