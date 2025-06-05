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
import { Container, Typography } from '@mui/material'
import { Quest } from 'core-client/api'
import { QuestLogEntry } from './QuestLogEntry'
import { api } from '../../api/flecs-core/api-client'

interface QuestLogProps {
  open: boolean
}

export const QuestLog: React.FC<QuestLogProps> = ({open}: QuestLogProps) => {
  const [quests, setQuests] = React.useState<Quest[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchQuests = async () => {
    setLoading(true)
    try {
      setQuests((await api.quests.questsGet()).data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false)
  };

  // Initial fetch and interval updater
  React.useEffect(() => {
    fetchQuests(); // Fetch once on mount
    const interval = setInterval(fetchQuests, 1000); // Every 1 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);


  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
      Quest Log
      </Typography>
      {quests.map((quest, index) => (
        <QuestLogEntry key={index} quest={quest} level={0} />
      ))}
    </Container>
  )
}
