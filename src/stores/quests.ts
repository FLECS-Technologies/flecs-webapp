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
import { create } from 'zustand';
import { Quest } from '@flecs/core-client-ts';

// Non-reactive quest map — preserves the original ref-based pattern
// to avoid re-rendering all subscribers on every 500ms poll update.
// Only mainQuestIds triggers re-renders (when the quest list changes).
const questsMap = new Map<number, Quest>();

export function addQuest(quest: Quest): void {
  quest.subquests?.forEach((sub) => addQuest(sub));
  questsMap.set(quest.id, quest);
}

export function getQuest(id: number): Quest | undefined {
  return questsMap.get(id);
}

export function getQuestsMap(): Map<number, Quest> {
  return questsMap;
}

interface QuestStoreState {
  mainQuestIds: number[];
  fetching: boolean;
  setFetching: (fetching: boolean) => void;
  setMainQuestIds: (ids: number[]) => void;
}

export const useQuestStore = create<QuestStoreState>()((set) => ({
  mainQuestIds: [],
  fetching: false,
  setFetching: (fetching) => set({ fetching }),
  setMainQuestIds: (mainQuestIds) => set({ mainQuestIds }),
}));
