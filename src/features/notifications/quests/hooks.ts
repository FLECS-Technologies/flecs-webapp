/**
 * Quest hooks — minimal manual code on top of generated hooks.
 * Polling: useGetQuests with refetchInterval (generated).
 * This file only has: waitForQuest (imperative polling for install flows) + quest invalidation.
 */
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { Quest } from '@generated/core/schemas';
import { QuestState } from '@generated/core/schemas';
import {
  useGetQuests,
  useDeleteQuestsId,
  getQuestsId,
  getGetQuestsIdQueryOptions,
  type getQuestsIdResponse,
  type GetQuestsIdQueryError,
} from '@generated/core/quests/quests';
import { getGetAppsQueryKey } from '@generated/core/apps/apps';
import { getGetInstancesQueryKey } from '@generated/core/instances/instances';
import { QueryObserver, useQueryClient } from '@tanstack/react-query';
import { useQuestStore, addQuest, getQuest, showQuest } from '@stores/quests';
import { unwrapSuccess } from '@app/api/unwrap';

const isFinished = (q: Quest) =>
  q.state !== QuestState.failing &&
  q.state !== QuestState.ongoing &&
  q.state !== QuestState.pending;

/** Live quest polling with auto-toast on completion */
export function useQuestPolling() {
  const qc = useQueryClient();
  const hasActive = useQuestStore((s) => s.mainQuestIds.length > 0);
  const { data } = useGetQuests({ query: { refetchInterval: hasActive ? 2000 : 10_000 } });
  const prevStates = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    if (!data?.data) return;
    const quests = data.data as Quest[];
    // A job appearing or finishing means the app/instance lists it touched have changed. Refetch
    // them at the quest cadence (~2s) instead of waiting for their own slower poll — this is what
    // makes a finished install flip a marketplace card to "Installed" promptly (≤~2s) rather than
    // up to 10s later, and it works regardless of which view/tab started the install.
    let appStateSettled = false;
    quests.forEach((q) => {
      const prev = prevStates.current.get(q.id);
      addQuest(q);
      const justFinished = !!prev && !isFinished({ state: prev } as Quest) && isFinished(q);
      if (prev === undefined || justFinished) appStateSettled = true;
      // Auto-toast when quest transitions to finished
      if (justFinished) {
        if (q.state === QuestState.success || q.state === QuestState.skipped) {
          toast.success(q.description || 'Job completed');
        } else if (q.state === QuestState.failed) {
          toast.error(q.description || 'Job failed', { description: q.detail });
        }
      }
      prevStates.current.set(q.id, q.state);
    });
    useQuestStore.getState().setMainQuestIds(quests.map((q) => q.id));
    if (appStateSettled) {
      qc.invalidateQueries({ queryKey: getGetAppsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetInstancesQueryKey() });
    }
  }, [data, qc]);
}

/** Imperative quest actions for install/update flows */
export function useQuestActions() {
  const qc = useQueryClient();
  const { mutateAsync: deleteQuest } = useDeleteQuestsId();

  /**
   * Await a quest to finish. Uses a TanStack QueryObserver on the orval-generated
   * query options, so polling stops when refetchInterval returns false — no
   * manual setTimeout recursion, no hardcoded timeout. The optional AbortSignal
   * lets the caller cancel (e.g., on install-dialog unmount) without leaking
   * the observer.
   */
  const waitForQuest = useCallback(
    (questId: number, signal?: AbortSignal): Promise<Quest> => {
      return new Promise<Quest>((resolve, reject) => {
        if (signal?.aborted) {
          reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
          return;
        }

        const observer = new QueryObserver<
          getQuestsIdResponse,
          GetQuestsIdQueryError,
          getQuestsIdResponse
        >(
          qc,
          getGetQuestsIdQueryOptions(questId, {
            query: {
              refetchInterval: (q) => {
                const quest = unwrapSuccess(q.state.data) as Quest | undefined;
                return quest && isFinished(quest) ? false : 500;
              },
              staleTime: 0,
            },
          }),
        );

        const cleanup = () => {
          unsub();
          observer.destroy();
          signal?.removeEventListener('abort', onAbort);
        };
        const onAbort = () => {
          cleanup();
          reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
        };

        const unsub = observer.subscribe((result) => {
          const quest = unwrapSuccess(result.data) as Quest | undefined;
          if (quest) showQuest(quest);
          if (quest && isFinished(quest)) {
            cleanup();
            resolve(quest);
            return;
          }
          if (result.isError) {
            cleanup();
            reject(result.error);
          }
        });

        signal?.addEventListener('abort', onAbort);
      });
    },
    [qc],
  );

  const clearQuests = useCallback(async () => {
    const ids = useQuestStore.getState().mainQuestIds;
    const finished = ids.map(getQuest).filter((q): q is Quest => !!q && isFinished(q));
    await Promise.all(finished.map((q) => deleteQuest({ id: q.id })));
    qc.invalidateQueries({ queryKey: ['/quests'] });
  }, [deleteQuest, qc]);

  return {
    waitForQuest,
    clearQuests,
    fetchQuest: async (id: number) => {
      const r = await getQuestsId(id);
      showQuest(r.data as Quest);
    },
  };
}
