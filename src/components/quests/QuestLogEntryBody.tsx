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
import { WarningAmber } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import { Quest, QuestState } from '@flecs/core-client-ts'
import { questStateFinishedOk } from '../../utils/quests/QuestState'
import { hasQuestFailedSubquest } from '../../utils/quests/Quest'
import { QuestIcon } from './QuestIcon'
import { QuestProgressIndicator } from './QuestProgressIndicator'
import { SubQuestProgressIndicator } from './SubQuestProgressIndicator'

interface QuestLogEntryBodyProps {
  quest: Quest
  level: number
}

export const QuestLogEntryBody: React.FC<QuestLogEntryBodyProps> = ({
  quest
}: QuestLogEntryBodyProps) => {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 0.5 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <QuestIcon state={quest.state} />
        {quest.state !== QuestState.Failed && hasQuestFailedSubquest(quest) && (
          <WarningAmber color='warning' />
        )}
        <Typography variant='body2' sx={{ flexGrow: 1 }}>
          {quest.description}
        </Typography>
      </Box>
      <Typography variant='caption'>{quest.detail}</Typography>
      {quest.progress && !questStateFinishedOk(quest.state) && (
        <QuestProgressIndicator progress={quest.progress} state={quest.state} />
      )}
      {quest.subquests && !questStateFinishedOk(quest.state) && (
        <SubQuestProgressIndicator
          subquests={quest.subquests}
          state={quest.state}
        />
      )}
    </Box>
  )
}
