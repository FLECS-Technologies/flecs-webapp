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
import React from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress, Container, Paper, Tooltip, Typography, useTheme } from '@mui/material'
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  CheckCircle,
  ErrorOutline,
  HourglassEmpty,
  WarningAmber,
} from "@mui/icons-material";
import { Quest, QuestProgress, QuestState } from 'core-client/api'

const hasFailedSubquest = (quest: Quest): boolean => {
  if (!quest.subquests) return false;
  return quest.subquests.some(
    (sub) => sub.state === QuestState.Failed || sub.state === QuestState.Failing || hasFailedSubquest(sub)
  );
};

// Determine background color based on quest status
const getStatusIcon = (state: QuestState) => {
  switch (state) {
    case QuestState.Failed:
    case QuestState.Failing:
      return <ErrorOutline color="error" />;
    case QuestState.Success:
      return <CheckCircle color="success" />;
    case QuestState.Pending:
      return <HourglassEmpty color="action" />;
    default:
      return <CircularProgress  size={24} sx={{color: 'info'}}/>;
  }
};

// Determine background color based on quest status
const getStatusColor = (state: QuestState) => {
  switch (state) {
    case QuestState.Failed:
    case QuestState.Failing:
      return 'rgba(255, 0, 0, 0.3)';
    case QuestState.Success:
      return 'rgba(0, 255, 0, 0.3)';
    default:
      return "transparent";
  }
};

interface QuestLogEntryProps {
  quest: Quest,
  level: number,
}

const QuestProgressIndicator: React.FC<QuestProgress> = ({
  current, total
}: QuestProgress) => {
  return (
      <Typography variant="body2" >
        {total ? `(${current}/${total})` : `Step ${current}`}
      </Typography>
  )
}

const QuestLogBody: React.FC<QuestLogEntryProps> = ({
  quest, level
}: QuestLogEntryProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Tooltip title={quest.detail}>
        {getStatusIcon(quest.state)}
      </Tooltip>
      {quest.state !== QuestState.Failed && hasFailedSubquest(quest) && <WarningAmber color="warning" />}
      <Typography variant="body2" >{quest.description}</Typography>
      {quest.progress && <QuestProgressIndicator current={quest.progress.current} total={quest.progress.total}/>}
    </Box>
  )
}

export const QuestLogEntry: React.FC<QuestLogEntryProps> = ({
  quest, level
}: QuestLogEntryProps) => {
  const hasSubquests = quest.subquests && quest.subquests.length > 0;
  const theme = useTheme();
  const backgroundColor = getStatusColor(quest.state);

  return (
    <Box sx={{ ml: level }}>
      {hasSubquests ?
        (<Accordion
          disableGutters elevation={0}
          sx={{
            borderLeft: `4px solid ${backgroundColor}`,
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <QuestLogBody quest={quest} key={quest.id} level={level} />
          </AccordionSummary>
          <AccordionDetails sx={{ padding: "4px 8px" }}>
            {quest.subquests?.map((sub) => (
                <QuestLogEntry key={sub.id} quest={sub} level={level + 1} />
              ))
            }
          </AccordionDetails>
        </Accordion>)
        :
        (
          <Paper elevation={0} sx={{ p: 2, borderLeft: `4px solid ${backgroundColor}`, minHeight: "32px !important"}}>
            <QuestLogBody quest={quest} key={quest.id} level={level} />
          </Paper>
        )
      }
    </Box>
  )
}