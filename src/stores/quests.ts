import { create } from 'zustand';
import { Quest } from '@generated/core/schemas';

// Non-reactive quest map — avoids re-renders on every poll cycle.
// Only mainQuestIds triggers re-renders (when the list changes).
const questsMap = new Map<number, Quest>();

export function addQuest(quest: Quest): void {
  quest.subquests?.forEach((sub) => addQuest(sub));
  questsMap.set(quest.id, quest);
}

/** Store a quest and make its live status immediately visible in the Jobs Rail. */
export function showQuest(quest: Quest): void {
  addQuest(quest);
  const store = useQuestStore.getState();
  if (!store.mainQuestIds.includes(quest.id)) {
    store.setMainQuestIds([...store.mainQuestIds, quest.id]);
  }
}

export function getQuest(id: number): Quest | undefined {
  return questsMap.get(id);
}

interface QuestStoreState {
  mainQuestIds: number[];
  setMainQuestIds: (ids: number[]) => void;
}

export const useQuestStore = create<QuestStoreState>()((set) => ({
  mainQuestIds: [],
  setMainQuestIds: (mainQuestIds) => set({ mainQuestIds }),
}));
