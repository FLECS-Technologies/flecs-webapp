import { AppStatus, QuestState } from '@generated/core/schemas';
import type { Quest } from '@generated/core/schemas';
import type { getQuestsResponse } from '@generated/core/quests/quests';
import { unwrapSuccess } from '@app/api/unwrap';
import type { EnrichedApp } from '@features/apps/types';

/** An EnrichedApp mid-install: desired='installed', not yet installed, with a matching active quest. */
export type InstallingApp = EnrichedApp & {
  status: 'installing';
  _quest: { description: string; progress?: number; state: QuestState };
};

/**
 * Derive the apps currently installing from the durable /apps + /quests caches.
 *
 * The daemon lists an in-progress install with desired='installed' and a transient
 * status ("not installed" → "manifest downloaded" → … → "installed"); combineAppList
 * has already enriched it with the correct appKey/title/avatar. We confirm the install
 * is actually active (not a stuck/failed leftover with a stale desired flag) by requiring
 * a matching "Install <name>-<version>" quest in the ongoing/pending state, and surface
 * its progress %. The quest is matched by exact string (composed from the known appKey)
 * rather than parsed — app and version names can both contain hyphens, so splitting the
 * description is ambiguous.
 *
 * Both the Installed Apps table and the Marketplace cards read from this so the
 * "Installing" state survives unmount/remount (route switch, pagination, filtering)
 * instead of relying on a component's transient local state.
 */
export function deriveInstallingApps(
  appList: EnrichedApp[] | undefined,
  questsData: getQuestsResponse | undefined,
): InstallingApp[] {
  const quests = unwrapSuccess(questsData) ?? ([] as Quest[]);
  const activeInstalls = quests.filter(
    (q) =>
      (q.state === QuestState.ongoing || q.state === QuestState.pending) &&
      q.description?.startsWith('Install '),
  );
  return (appList ?? [])
    .filter((app) => app.desired === AppStatus.installed && app.status !== AppStatus.installed)
    .map((app): InstallingApp | null => {
      const quest = activeInstalls.find(
        (q) => q.description === `Install ${app.appKey.name}-${app.appKey.version}`,
      );
      if (!quest) return null;
      const progress = quest.progress;
      const pct = progress?.total
        ? Math.round((progress.current / progress.total) * 100)
        : undefined;
      return {
        ...app,
        status: 'installing' as const,
        _quest: { description: quest.description, progress: pct, state: quest.state },
      };
    })
    .filter((a): a is InstallingApp => a !== null);
}

/**
 * App names whose "Install <name>-<version>" quest has finished successfully but whose /apps
 * `status` hasn't caught up to 'installed' yet.
 *
 * /quests polls every ~2s while /apps polls every 10s, so the fast cache drops the active
 * install quest (deriveInstallingApps stops reporting it) several seconds before the slow
 * cache reports 'installed'. In that window a card would otherwise fall back to "Install Now"
 * between "Installing" and "Installed". Treating a succeeded install quest as installed bridges
 * that gap; once /apps reports 'installed' the guard below drops the app and the durable status
 * takes over. A failed quest is deliberately excluded — it must fall back so the user can retry.
 */
export function deriveRecentlyInstalledNames(
  appList: EnrichedApp[] | undefined,
  questsData: getQuestsResponse | undefined,
): Set<string> {
  const quests = unwrapSuccess(questsData) ?? ([] as Quest[]);
  const succeededInstalls = quests.filter(
    (q) =>
      (q.state === QuestState.success || q.state === QuestState.skipped) &&
      q.description?.startsWith('Install '),
  );
  const names = new Set<string>();
  for (const app of appList ?? []) {
    if (app.desired !== AppStatus.installed || app.status === AppStatus.installed) continue;
    const done = succeededInstalls.some(
      (q) => q.description === `Install ${app.appKey.name}-${app.appKey.version}`,
    );
    if (done) names.add(app.appKey.name);
  }
  return names;
}
