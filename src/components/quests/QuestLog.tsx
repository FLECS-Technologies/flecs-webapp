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
import { Container, Typography } from '@mui/material';
import { QuestContext, useQuestContext } from '@contexts/quests/QuestContext';
import { QuestLogEntry } from './QuestLogEntry';

export const QuestLog: React.FC = () => {
  const context = useQuestContext(QuestContext);

  // Initial fetch and interval updater
  React.useEffect(() => {
    context.setFetching(true);

    return () => context.setFetching(false); // Cleanup on unmount
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      {[...context.mainQuestIds].map((id, index) => (
        <QuestLogEntry key={index} id={id} level={0} />
      ))}
      {context.quests.current.size === 0 && <Typography gutterBottom>No quests present</Typography>}
    </Container>
  );
};
