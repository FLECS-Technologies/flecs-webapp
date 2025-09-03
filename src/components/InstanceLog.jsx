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
import PropTypes from 'prop-types';
import { Editor, EditorState, ContentState, Modifier } from 'draft-js';
import { getInstanceLog, getLog } from '../api/device/InstanceLogService';
import { Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useProtectedApi } from './providers/ApiProvider';

export default function InstanceLog(props) {
  const { instance } = props;
  const executedRef = React.useRef(false);
  const api = useProtectedApi();
  const [loadingLog, setLoadingLog] = React.useState(false);
  const [reloadLog, setReloadLog] = React.useState(false);
  const content = ContentState.createFromText('No log available...');
  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createWithContent(content),
  );

  React.useEffect(() => {
    if (executedRef.current) {
      return;
    }
    if (!loadingLog) {
      fetchLog();
    }
    if (reloadLog) {
      setReloadLog(false);
    }
    executedRef.current = true;
  }, [reloadLog]);

  const fetchLog = async (props) => {
    setLoadingLog(true);
    api.instances
      .instancesInstanceIdLogsGet(instance.instanceId)
      .then((response) => {
        const currentContent = editorState.getCurrentContent();
        const newLog = Modifier.replaceText(
          currentContent,
          editorState.getSelection().merge({
            anchorKey: currentContent.getFirstBlock().getKey(),
            anchorOffset: 0,
            focusOffset: currentContent.getLastBlock().getText().length,
            focusKey: currentContent.getLastBlock().getKey(),
          }),
          getLog(response.data),
        );
        const newEditorState = EditorState.push(editorState, newLog, 'insert-characters');
        setEditorState(newEditorState);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoadingLog(false);
      });
  };

  const handleReloadLogClick = (event) => {
    setReloadLog(true);
    executedRef.current = false;
  };

  return (
    <Box data-testid="log-editor">
      <Button
        variant="outlined"
        sx={{ mr: 1, mb: 1 }}
        data-testid="refresh-button"
        disabled={loadingLog}
        onClick={() => handleReloadLogClick()}
      >
        <RefreshIcon sx={{ mr: 1 }} /> Refresh
      </Button>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        readOnly={true}
        placeholder="No log available..."
      />
    </Box>
  );
}

InstanceLog.propTypes = {
  instance: PropTypes.object,
};
