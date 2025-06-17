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
import { Button, Container, Typography } from '@mui/material'
import { Quest, QuestState } from 'core-client/api'
import { api } from '../../api/flecs-core/api-client'
import { QuestLogEntry } from './QuestLogEntry';

const questsEqual = (a: Quest[], b: Quest[]): boolean => {
  return a.length === b.length
}

const questEqual = (a: Quest, b: Quest): boolean => {
  return a.id === b.id && a.description === b.description && a.progress === b.progress && a.state === b.state
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

export const QuestLog: React.FC = () => {
  const [quests, setQuests] = React.useState<Quest[]>([]);

  const fetchQuests = async () => {
    try {
      const data = (await api.quests.questsGet()).data;
      if (!questsEqual(data, quests)) {
        setQuests(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const clearQuests = async () => {
    quests.filter(questFinished).forEach(async function(quest) {
      try {
        await api.quests.questsIdDelete({id: quest.id});
      } catch (error) {
        console.error(error);
      }
    })
  };

  // Initial fetch and interval updater
  React.useEffect(() => {
    fetchQuests(); // Fetch once on mount
    const interval = setInterval(fetchQuests, 10000); // Every 1 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      {quests.map((quest, index) => (
        <QuestLogEntry key={index} quest={quest} level={0} />
      ))}
      {quests.length > 0 &&<Typography variant="h4" gutterBottom>
        <Button onClick={clearQuests}>REMOVE FINISHED QUESTS</Button>
      </Typography>}
      {quests.length === 0 && <Typography gutterBottom>
        No quests present
      </Typography>}
    </Container>
  )
}
