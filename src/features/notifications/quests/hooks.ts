/**
 * Quest hooks — minimal manual code on top of generated hooks.
 * Polling: useGetQuests with refetchInterval (generated).
 * This file only has: waitForQuest (imperative polling for install flows) + quest invalidation.
 */
import { useCallback, useEffect } from 'react';
import type { Quest } from '@generated/core/schemas';
import { QuestState } from '@generated/core/schemas';
import { useGetQuests, useDeleteQuestsId, getQuestsId } from '@generated/core/quests/quests';
import { useQueryClient } from '@tanstack/react-query';
import { useQuestStore, addQuest, getQuest } from '@stores/quests';

const isFinished = (q: Quest) => q.state !== QuestState.failing && q.state !== QuestState.ongoing && q.state !== QuestState.pending;

/** Live quest polling — just the generated hook with smart interval */
export function useQuestPolling() {
  const hasActive = useQuestStore((s) => s.mainQuestIds.length > 0);
  const { data } = useGetQuests({ query: { refetchInterval: hasActive ? 2000 : 10_000 } });

  useEffect(() => {
    if (!data?.data) return;
    const quests = data.data as Quest[];
    quests.forEach((q) => addQuest(q));
    useQuestStore.getState().setMainQuestIds(quests.map((q) => q.id));
  }, [data]);
}

/** Imperative quest actions for install/update flows */
export function useQuestActions() {
  const qc = useQueryClient();
  const { mutateAsync: deleteQuest } = useDeleteQuestsId();

  const waitForQuest = useCallback(async (questId: number): Promise<Quest> => {
    return new Promise((resolve, reject) => {
      const check = async () => {
        try {
          const res = await getQuestsId(questId);
          const quest = res.data as Quest;
          addQuest(quest);
          if (isFinished(quest)) { resolve(quest); return; }
          setTimeout(check, 500);
        } catch (e) { reject(e); }
      };
      check();
    });
  }, []);

  const clearQuests = useCallback(async () => {
    const ids = useQuestStore.getState().mainQuestIds;
    const finished = ids.map(getQuest).filter((q): q is Quest => !!q && isFinished(q));
    await Promise.all(finished.map((q) => deleteQuest({ id: q.id })));
    qc.invalidateQueries({ queryKey: ['/quests'] });
  }, [deleteQuest, qc]);

  return { waitForQuest, clearQuests, fetchQuest: async (id: number) => { const r = await getQuestsId(id); addQuest(r.data as Quest); } };
}
