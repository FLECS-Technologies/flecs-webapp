/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Wed Jun 18 2025
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
import React, { createContext, ReactNode } from 'react';
import { Quest, QuestState } from '@flecs/core-client-ts';
import { useProtectedApi } from '@contexts/api/ApiProvider';

export interface QuestContextType {
  quests: React.RefObject<Map<number, Quest>>;
  mainQuestIds: number[];
  fetchQuest: (id: number) => Promise<void>;
  fetchQuests: () => Promise<void>;
  setFetching: React.Dispatch<React.SetStateAction<boolean>>;
  fetching: boolean;
  clearQuests: () => Promise<void>;
  waitForQuest: (questId: number, timeoutMs?: number) => Promise<Quest>;
  waitForQuests: (questIds: number[]) => Promise<Quest[]>;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const useQuestContext = (
  QuestContext: React.Context<QuestContextType | undefined>,
): QuestContextType => {
  const context = React.useContext(QuestContext);
  if (!context) {
    throw new Error('useQuestContext must be used within a QuestProvider');
  }
  return context;
};

const questFinished = (quest: Quest): boolean => {
  switch (quest.state) {
    case QuestState.Failing:
    case QuestState.Ongoing:
    case QuestState.Pending:
      return false;
    default:
      return true;
  }
};

const QuestContextProvider = ({ children }: { children: ReactNode }) => {
  const quests = React.useRef<Map<number, Quest>>(new Map<number, Quest>());
  const [fetching, setFetching] = React.useState(false);
  const [mainQuestIds, setMainQuestIds] = React.useState<number[]>([]);
  const api = useProtectedApi();

  React.useEffect(() => {
    if (quests.current.size === 0) {
      fetchQuests();
    }
  }, []);

  React.useEffect(() => {
    if (fetching) {
      const timer = setInterval(() => fetchQuests(), 500);
      return () => {
        clearInterval(timer);
      };
    }
  }, [fetching]);

  const addQuest = (quest: Quest) => {
    quest.subquests?.forEach((subQuest) => addQuest(subQuest));
    quests.current.set(quest.id, quest);
  };

  const fetchQuests = async () => {
    try {
      const data = (await api.quests.questsGet()).data;
      data.forEach((subQuest) => addQuest(subQuest));
      setMainQuestIds(data.map((quest) => quest.id));
    } catch (error) {
      console.error(error);
    }
  };

  const clearQuests = async () => {
    const finishedQuests = [...quests.current.values()].filter(questFinished);
    try {
      await Promise.all(
        finishedQuests
          .filter((quest) => mainQuestIds.includes(quest.id))
          .map((quest) => api.quests.questsIdDelete(quest.id)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchQuest = async (id: number) => {
    try {
      const data = (await api.quests.questsIdGet(id)).data;
      addQuest(data);
    } catch (error) {
      console.error(error);
    }
  };

  const waitForQuest = async (questId: number): Promise<Quest> => {
    return new Promise((resolve, reject) => {
      const checkQuest = async () => {
        try {
          // Fetch the latest quest state from the API
          await fetchQuest(questId);
          const quest = quests.current.get(questId);

          if (quest && questFinished(quest)) {
            resolve(quest);
            return;
          }

          // Continue checking
          setTimeout(checkQuest, 500);
        } catch (error) {
          reject(new Error(`Failed to fetch quest ${questId}: ${error}`));
        }
      };

      // Start checking immediately
      checkQuest();
    });
  };

  const waitForQuests = async (questIds: number[]): Promise<Quest[]> => {
    if (questIds.length === 0) {
      return [];
    }

    // Wait for all quests to finish concurrently
    const questPromises = questIds.map((questId) => waitForQuest(questId));

    try {
      const finishedQuests = await Promise.all(questPromises);
      return finishedQuests;
    } catch (error) {
      throw new Error(`Failed to wait for quests: ${error}`);
    }
  };

  return (
    <QuestContext.Provider
      value={{
        quests,
        fetchQuest,
        fetchQuests,
        setFetching,
        fetching,
        clearQuests,
        mainQuestIds,
        waitForQuest,
        waitForQuests,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
};

export { QuestContext, QuestContextProvider };
