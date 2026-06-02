/**
 * Editor navigation — derives sidebar launcher entries from the enriched app list.
 * Pure function, no hooks: only editors of running instances are surfaced.
 */
import type { EnrichedApp } from '@features/apps/types';

export interface EditorNavItem {
  /** Stable key: `${instanceId}:${port}` */
  key: string;
  /** Editor name from the app manifest; falls back to the app title.
   *  Disambiguated by instance name / port when needed. */
  label: string;
  avatar?: string;
  url: string;
}

export function flattenEditors(appList: EnrichedApp[] | undefined): EditorNavItem[] {
  if (!appList?.length) return [];

  const entries = appList.flatMap((app) => {
    const title = app.title ?? app.appKey.name;
    return (app.instances ?? [])
      .filter((i) => i.status === 'running' && (i.editors?.length ?? 0) > 0)
      .map((instance) => ({ title, avatar: app.avatar, instance }));
  });

  // Count running instances per title so multi-instance apps get the instance name appended.
  const instancesPerTitle = new Map<string, number>();
  for (const { title } of entries) {
    instancesPerTitle.set(title, (instancesPerTitle.get(title) ?? 0) + 1);
  }

  return entries
    .flatMap(({ title, avatar, instance }) => {
      const editors = instance.editors ?? [];
      const multiInstance = (instancesPerTitle.get(title) ?? 0) > 1;
      const multiEditor = editors.length > 1;
      return editors.map((editor) => {
        // Manifest editor name wins; unnamed editors fall back to the app title.
        const parts = [editor.name?.trim() || title];
        if (multiInstance) parts.push(instance.instanceName);
        if (multiEditor && !editor.name?.trim()) parts.push(`:${editor.port}`);
        return {
          key: `${instance.instanceId}:${editor.port}`,
          label: parts.join(' · '),
          avatar,
          url: editor.url,
        };
      });
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}
