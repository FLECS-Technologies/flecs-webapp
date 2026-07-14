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
 * True when /apps reports an install in progress: the daemon wants the app installed
 * (desired='installed') but its status hasn't reached 'installed' yet.
 *
 * This is the single source of truth for the Marketplace card's Installing/Installed state.
 * Both derive from the same /apps snapshot, so they can never briefly disagree (which is what
 * made the button flash back to "Install Now" between "Installing" and "Installed"). It stays
 * true for the whole install and survives view switches because /apps is a durable cache.
 *
 * Caveat: an install that fails while the daemon still wants it installed keeps this true —
 * the daemon's own retry/reconcile state, surfaced as "Installing" until it settles.
 */
export function isAppInstalling(app: Pick<EnrichedApp, 'desired' | 'status'> | undefined): boolean {
  return app?.desired === AppStatus.installed && app?.status !== AppStatus.installed;
}

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
 * The Installed Apps table reads from this to render its "Installing… X%" rows. (Marketplace
 * cards derive their simpler Installing/Installed state straight from /apps desired vs status —
 * see Marketplace.tsx — so the two never disagree mid-install.)
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
    .filter((app) => isAppInstalling(app))
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
 * Descriptions of ongoing/pending "Install <name>-<version>" quests.
 *
 * The daemon briefly drops an app from /apps while (re)installing — it removes the entry and
 * re-adds it, so there are windows where the app is absent entirely. During those windows
 * isAppInstalling can't see the install (there's no /apps entry) and a card would flash
 * "Install Now". A matching active install quest bridges the gap. Only ongoing/pending quests
 * count, so the succeeded duplicates that accumulate across reinstalls never trigger it.
 *
 * Consulted only when the app is missing from /apps — when it's present, /apps stays
 * authoritative, so a stale/duplicate quest can't affect an app the daemon already tracks.
 */
export function activeInstallQuestDescriptions(
  questsData: getQuestsResponse | undefined,
): string[] {
  const quests = unwrapSuccess(questsData) ?? ([] as Quest[]);
  return quests
    .filter(
      (q) =>
        (q.state === QuestState.ongoing || q.state === QuestState.pending) &&
        q.description?.startsWith('Install '),
    )
    .map((q) => q.description);
}
