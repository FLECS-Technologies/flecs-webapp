/*
 * Copyright (c) 2025 FLECS Technologies GmbH
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
import { useCallback, useEffect } from 'react';
import { Quest, QuestState } from '@flecs/core-client-ts';
import { useProtectedApi } from '@shared/api/ApiProvider';
import { useQuestStore, addQuest, getQuest, getQuestsMap } from '@stores/quests';
import { QuestSchema, QuestsResponseSchema, safeParseResponse } from '@shared/types/schemas';

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

/**
 * Imperative quest actions — drop-in replacement for QuestContext methods.
 *
 * Returns stable callbacks for fetchQuest, waitForQuest, waitForQuests, clearQuests.
 * Uses the module-level quest map (non-reactive) for reads and the Zustand store
 * for reactive state (mainQuestIds).
 */
export function useQuestActions() {
  const api = useProtectedApi();

  const fetchQuest = useCallback(
    async (id: number) => {
      try {
        const { data } = await api.quests.questsIdGet(id);
        const validated = safeParseResponse(QuestSchema, data, `quest/${id}`);
        addQuest(validated as Quest);
      } catch (error) {
        console.error(error);
      }
    },
    [api],
  );

  const fetchQuests = useCallback(async () => {
    try {
      const { data } = await api.quests.questsGet();
      const validated = safeParseResponse(QuestsResponseSchema, data, 'quests');
      validated.forEach((q: Quest) => addQuest(q));
      useQuestStore.getState().setMainQuestIds(validated.map((q: Quest) => q.id));
    } catch (error) {
      console.error(error);
    }
  }, [api]);

  const waitForQuest = useCallback(
    async (questId: number): Promise<Quest> => {
      return new Promise((resolve, reject) => {
        const check = async () => {
          try {
            await fetchQuest(questId);
            const quest = getQuest(questId);
            if (quest && questFinished(quest)) {
              resolve(quest);
              return;
            }
            setTimeout(check, 500);
          } catch (error) {
            reject(new Error(`Failed to fetch quest ${questId}: ${error}`));
          }
        };
        check();
      });
    },
    [fetchQuest],
  );

  const waitForQuests = useCallback(
    async (questIds: number[]): Promise<Quest[]> => {
      if (questIds.length === 0) return [];
      return Promise.all(questIds.map((id) => waitForQuest(id)));
    },
    [waitForQuest],
  );

  const clearQuests = useCallback(async () => {
    const { mainQuestIds } = useQuestStore.getState();
    const finished = [...getQuestsMap().values()].filter(questFinished);
    try {
      await Promise.all(
        finished
          .filter((q) => mainQuestIds.includes(q.id))
          .map((q) => api.quests.questsIdDelete(q.id)),
      );
    } catch (error) {
      console.error(error);
    }
  }, [api]);

  return { fetchQuest, fetchQuests, waitForQuest, waitForQuests, clearQuests };
}

/**
 * Background quest polling — mount in components that need live quest updates.
 * Polls all quests every 500ms while `fetching` is true in the store.
 * Also performs an initial fetch if the quests map is empty.
 */
export function useQuestPolling() {
  const fetching = useQuestStore((s) => s.fetching);
  const { fetchQuests } = useQuestActions();

  useEffect(() => {
    if (!fetching) return;
    const timer = setInterval(fetchQuests, 500);
    return () => clearInterval(timer);
  }, [fetching, fetchQuests]);

  useEffect(() => {
    if (getQuestsMap().size === 0) {
      fetchQuests();
    }
  }, [fetchQuests]);
}
