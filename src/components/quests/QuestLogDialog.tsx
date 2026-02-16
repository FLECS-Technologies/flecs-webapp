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
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

import { Delete } from '@mui/icons-material';
import { QuestLog } from './QuestLog';
import { useQuestContext, QuestContext } from '@contexts/quests/QuestContext';

interface QuestLogProps {
  open: boolean;
  onClose: () => void;
}

const QuestLogDialog: React.FC<QuestLogProps> = ({ open, onClose }) => {
  const context = useQuestContext(QuestContext);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        style: {
          alignSelf: 'flex-start',
        },
      }}
    >
      <DialogTitle>Quest Log</DialogTitle>
      <DialogContent>
        <QuestLog />
      </DialogContent>
      <DialogActions>
        {context.quests.current.size > 0 && (
          <Button onClick={() => context.clearQuests()}>
            <Delete />
            REMOVE FINISHED QUESTS
          </Button>
        )}
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestLogDialog;
