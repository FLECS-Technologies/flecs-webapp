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
import { Box, LinearProgress, Typography } from '@mui/material'
import { QuestState, Quest } from '@flecs/core-client-ts'
import { questFinished } from '../../utils/quests/Quest'
import {
  getQuestStateProgressColor,
  questStateRunning
} from '../../utils/quests/QuestState'

interface SubQuestProgressIndicatorProps {
  state: QuestState
  subquests: Quest[]
}

export const SubQuestProgressIndicator: React.FC<
  SubQuestProgressIndicatorProps
> = ({ state, subquests }: SubQuestProgressIndicatorProps) => {
  const totalSubquests = subquests.length
  if (totalSubquests <= 0) return null
  const progressColor = getQuestStateProgressColor(state)

  const finishedSubquests = subquests.filter(questFinished).length
  const runningSubquests = subquests.filter((quest) =>
    questStateRunning(quest.state)
  ).length

  const finishedPercent = (finishedSubquests / totalSubquests) * 100
  const runningPercent = (runningSubquests / totalSubquests) * 100

  return (
    <Box sx={{ width: '100%', mt: 0.5 }}>
      <Box sx={{ mt: 1 }}>
        <LinearProgress
          variant='buffer'
          value={finishedPercent}
          valueBuffer={finishedPercent + runningPercent}
          color={progressColor}
          sx={{
            height: 8,
            borderRadius: 4,
            opacity: 0.9
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant='caption'>{`${finishedSubquests} finished`}</Typography>
          <Typography variant='caption'>{`${runningSubquests} running`}</Typography>
          <Typography variant='caption'>{`${
            totalSubquests - runningSubquests - finishedSubquests
          } pending`}</Typography>
          <Typography variant='caption'>{`${totalSubquests} total`}</Typography>
          <Typography variant='caption'>{`${Math.round(
            finishedPercent
          )}%`}</Typography>
        </Box>
      </Box>
    </Box>
  )
}
