import type { AppStatus, InstalledApp, AppInstance, Quest, QuestState } from '@generated/core/schemas';

/** State callback shape emitted by AppInstaller / InstallationStepper */
export interface InstallerState {
  installing: boolean;
  updating?: boolean;
  currentQuest?: Quest | null;
}

export type AppVersion = { version: string; installed: boolean };

/** Enriched app = device-installed app + optional marketplace metadata + optional instance state.
 *  Every enriched field is optional — callers already guard with `?? []` or `?.` — so a marketplace
 *  card (with only appKey/title/versions known) structurally satisfies EnrichedApp without casts. */
export interface EnrichedApp extends Omit<Partial<InstalledApp>, 'status' | 'appKey'> {
  appKey: InstalledApp['appKey'];
  status?: AppStatus | 'installing';
  avatar?: string;
  title?: string;
  author?: string;
  relatedLinks?: string[];
  price?: string;
  permalink?: string;
  purchasable?: boolean;
  documentationUrl?: string;
  instances?: AppInstance[];
  installedVersions?: string[];
  versions?: AppVersion[];
  /** Transient quest metadata attached by the InstalledApps page for "installing" phantom entries */
  _quest?: { description: string; progress?: number; state: QuestState };
}
