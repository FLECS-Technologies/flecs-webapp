/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Wed Jun 04 2025
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
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { QuestContext, useQuestContext } from '@contexts/quests/QuestContext';
import { getQuestStateColor } from '../../utils/quests/QuestState';
import { QuestLogEntryBody } from './QuestLogEntryBody';

const MAX_DEPTH: number = 100;

interface QuestLogEntryProps {
  id: number;
  level: number;
  showBorder?: boolean;
}

export const QuestLogEntry: React.FC<QuestLogEntryProps> = ({
  id,
  level,
  showBorder = true,
}: QuestLogEntryProps) => {
  const context = useQuestContext(QuestContext);
  const quest = context.quests.current.get(id);
  if (!quest) return null;

  const hasSubquests = quest.subquests && quest.subquests.length > 0;

  const backgroundColor = getQuestStateColor(quest.state);

  return (
    <Box sx={{ ml: 2 }}>
      {hasSubquests && level <= MAX_DEPTH ? (
        <Accordion
          disableGutters
          elevation={0}
          sx={{
            ...(showBorder && {
              borderLeft: `4px solid`,
              borderColor: backgroundColor,
            }),
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <QuestLogEntryBody quest={quest} key={quest.id} level={level} />
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '1px 8px' }}>
            {quest.subquests?.map((sub) => (
              <QuestLogEntry key={sub.id} id={sub.id} level={level + 1} showBorder={showBorder} />
            ))}
          </AccordionDetails>
        </Accordion>
      ) : (
        <Paper
          elevation={0}
          sx={{
            paddingLeft: 2,
            paddingTop: 1,
            paddingBottom: 1,
            minHeight: '32px !important',
            ...(showBorder && {
              borderLeft: `4px solid`,
              borderColor: backgroundColor,
            }),
          }}
        >
          <QuestLogEntryBody quest={quest} key={quest.id} level={level} />
        </Paper>
      )}
    </Box>
  );
};
