/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Mon Jun 23 2025
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
import { alpha, LinearProgressProps, useTheme } from '@mui/material';
import { QuestState } from 'core-client/api'

export const questStateFinished = (state: QuestState): boolean => {
  switch (state) {
    case QuestState.Failing:
    case QuestState.Ongoing:
    case QuestState.Pending:
      return false;
    default:
      return true;
  }
}

export const questStateFinishedOk = (state: QuestState): boolean => {
  switch (state) {
    case QuestState.Skipped:
    case QuestState.Success:
      return true;
    default:
      return false;
  }
}

export const getQuestStateColor = (state: QuestState) => {
  const theme = useTheme();
  switch (state) {
    case QuestState.Failed:
    case QuestState.Failing:
      return alpha(theme.palette.error.main, 0.75);
    case QuestState.Success:
      return alpha(theme.palette.success.main, 0.75);
    default:
      return "transparent";
  }
};

export const getQuestStateProgressColor = (state: QuestState): LinearProgressProps['color'] => {
  switch (state) {
    case QuestState.Failed:
    case QuestState.Failing:
      return 'error';
    case QuestState.Success:
      return 'success';
    case QuestState.Ongoing:
      return 'secondary';
    case QuestState.Pending:
      return 'info';
    default:
      return 'inherit';
  }
};

export const questStateRunning = (state: QuestState): boolean => {
  switch (state) {
    case QuestState.Failing:
    case QuestState.Ongoing:
      return true;
    default:
      return false;
  }
}