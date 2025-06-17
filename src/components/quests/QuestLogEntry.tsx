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
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Paper,
  Tooltip,
  Typography,
  useTheme,
  alpha
} from '@mui/material'
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  CheckCircle,
  ErrorOutline,
  HourglassEmpty,
  WarningAmber,
} from "@mui/icons-material";
import { Quest, QuestProgress, QuestState } from 'core-client/api'
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';

const hasFailedSubquest = (quest: Quest): boolean => {
  if (!quest.subquests) return false;
  return quest.subquests.some(
    (sub) => sub.state === QuestState.Failed || sub.state === QuestState.Failing || hasFailedSubquest(sub)
  );
};

const questRunning = (quest: Quest): boolean => {
  switch (quest.state) {
    case QuestState.Failing:
    case QuestState.Ongoing:
      return true;
    default:
      return false;
  }
}

const questFinished = (quest: Quest): boolean => {
  switch (quest.state) {
    case QuestState.Failing:
    case QuestState.Ongoing:
    case QuestState.Pending:
      return false;
    default:
      return true;
  }
}

const MAX_DEPTH: number = 100;

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

const getStatusColor = (state: QuestState) => {
  const theme = useTheme();
  switch (state) {
    case QuestState.Failed:
    case QuestState.Failing:
      return alpha(theme.palette.error.main, 0.75);
    case QuestState.Success:
      return alpha(theme.palette.success.main, 0.75);;
    default:
      return "transparent";
  }
};

interface QuestLogEntryProps {
  quest: Quest,
  level: number,
}

interface QuestProgressIndicatorProps {
  progress: QuestProgress,
  state: QuestState,
  subquests: Quest[],
}

const QuestProgressIndicator: React.FC<QuestProgressIndicatorProps> = ({
  progress: {current, total}, state, subquests
}: QuestProgressIndicatorProps) => {
  const percent = (100 * current) / (total || current);
  const color = getStatusColor(state);

  const totalSubquests = subquests.length;
  const finishedSubquests = subquests.filter(questFinished).length;
  const runningSubquests = subquests.filter(questRunning).length;

  const finishedPercent = (finishedSubquests / totalSubquests) * 100;
  const runningPercent = (runningSubquests / totalSubquests) * 100;

  return (
    <Box sx={{ width: "100%", mt: 0.5 }}>
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: `${color}33`,
          "& .MuiLinearProgress-bar": {
            backgroundColor: {color},
          },
        }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
        <Typography variant="caption">{`${current} of ${total}`}</Typography>
        <Typography variant="caption">{`${Math.round(percent)}%`}</Typography>
      </Box>
      {totalSubquests > 0 && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="buffer"
            value={finishedPercent}
            valueBuffer={finishedPercent + runningPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: `${color}33`,
              "& .MuiLinearProgress-bar": {
                backgroundColor: {color},
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
            <Typography variant="caption">
              {`${finishedPercent} finished / ${finishedPercent + runningPercent} started`}
            </Typography>
            <Typography variant="caption">{`${finishedPercent + runningPercent} started`}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

const QuestLogBody: React.FC<QuestLogEntryProps> = ({
  quest, level
}: QuestLogEntryProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 0.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title={quest.detail}>
          {getStatusIcon(quest.state)}
        </Tooltip>
        {quest.state !== QuestState.Failed && hasFailedSubquest(quest) && (
          <WarningAmber color="warning" />
        )}
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {quest.description}
        </Typography>
      </Box>
      {quest.progress && (
        <QuestProgressIndicator
          progress={quest.progress}
          state={quest.state}
          subquests={quest.subquests || []}
        />
      )}
    </Box>
  )
}

export const QuestLogEntry: React.FC<QuestLogEntryProps> = ({
  quest, level
}: QuestLogEntryProps) => {
  const hasSubquests = quest.subquests && quest.subquests.length > 0;

  const backgroundColor = getStatusColor(quest.state);

  return (
    <Box sx={{ ml: 2 }}>
      {hasSubquests && level <= MAX_DEPTH ?
        (<Accordion
          disableGutters elevation={0}
          sx={{
            borderLeft: `4px solid`,
            borderColor: backgroundColor,
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <QuestLogBody quest={quest} key={quest.id} level={level} />
          </AccordionSummary>
          <AccordionDetails sx={{ padding: "1px 8px" }}>
            {quest.subquests?.map((sub) => (
                <QuestLogEntry key={sub.id} quest={sub} level={level + 1} />
              ))
            }
          </AccordionDetails>
        </Accordion>)
        :
        (
          <Paper
            elevation={0}
            sx={{
              paddingLeft: 2,
              paddingTop: 1,
              paddingBottom: 1,
              borderLeft: `4px solid`,
              borderColor: backgroundColor,
              minHeight: "32px !important"
            }}>
            <QuestLogBody quest={quest} key={quest.id} level={level} />
          </Paper>
        )
      }
    </Box>
  )
}