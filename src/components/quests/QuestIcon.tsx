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
import {
  ErrorOutline,
  CheckCircle,
  HourglassEmpty,
  Block
} from '@mui/icons-material'
import { CircularProgress } from '@mui/material'
import { QuestState } from '@flecs/core-client-ts'
import React from 'react'

type QuestIconProps = {
  state: QuestState
}

export const QuestIcon = React.memo(function QuestIcon({
  state
}: QuestIconProps) {
  switch (state) {
    case QuestState.Failed:
    case QuestState.Failing:
      return <ErrorOutline color='error' />
    case QuestState.Success:
      return <CheckCircle color='success' />
    case QuestState.Pending:
      return <HourglassEmpty color='action' />
    case QuestState.Skipped:
      return <Block color='action' />
    default:
      return <CircularProgress size={24} sx={{ color: 'info' }} />
  }
})
