/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Apr 08 2022
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
import { getLog } from '@features/system/api/InstanceLogService';
import { Box, Button } from '@mui/material';
import { RefreshCw } from 'lucide-react';
import { useProtectedApi } from '@shared/api/ApiProvider';

export default function InstanceLog(props) {
  const { instance } = props;
  const executedRef = React.useRef(false);
  const api = useProtectedApi();
  const [loadingLog, setLoadingLog] = React.useState(false);
  const [logText, setLogText] = React.useState('No log available...');

  React.useEffect(() => {
    if (executedRef.current) return;
    fetchLog();
    executedRef.current = true;
  }, []);

  const fetchLog = async () => {
    setLoadingLog(true);
    api.instances
      .instancesInstanceIdLogsGet(instance.instanceId)
      .then((response) => {
        setLogText(getLog(response.data) || 'No log available...');
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoadingLog(false);
      });
  };

  const handleReloadLogClick = () => {
    executedRef.current = false;
    fetchLog();
  };

  return (
    <Box data-testid="log-editor">
      <Button
        variant="outlined"
        sx={{ mr: 1, mb: 1 }}
        data-testid="refresh-button"
        disabled={loadingLog}
        onClick={handleReloadLogClick}
      >
        <RefreshCw size={16} style={{ marginRight: 8 }} /> Refresh
      </Button>
      <Box
        component="pre"
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          maxHeight: 400,
          overflow: 'auto',
        }}
      >
        {logText}
      </Box>
    </Box>
  );
}
