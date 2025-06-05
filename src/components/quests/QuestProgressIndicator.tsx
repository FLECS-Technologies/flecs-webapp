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
import { Box, LinearProgress, Typography } from "@mui/material";
import { QuestProgress, QuestState } from "core-client";
import { getQuestStateProgressColor } from "../../utils/quests/QuestState";

interface QuestProgressIndicatorProps {
  progress: QuestProgress,
  state: QuestState,
}

export const QuestProgressIndicator: React.FC<QuestProgressIndicatorProps> = ({
  progress: {current, total}, state
}: QuestProgressIndicatorProps) => {
  const percent = (100 * current) / (total || current);
  const progressColor = getQuestStateProgressColor(state);

  return (
    <Box sx={{ width: "100%", mt: 0.5 }}>
      <LinearProgress
        variant={total ? "determinate" : "indeterminate"}
        value={percent}
        color={progressColor}
        sx={{
          height: 8,
          borderRadius: 4,
          opacity: 0.90,
        }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
        <Typography variant="caption">{`${current} of ${total ?? 'unknown'}`}</Typography>
        <Typography variant="caption">{`${Math.round(percent)}%`}</Typography>
      </Box>
    </Box>
  );
}