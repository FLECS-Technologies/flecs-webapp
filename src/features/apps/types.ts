import type { AppStatus, InstalledApp, AppInstance, Quest, QuestState } from '@generated/core/schemas';

/** State callback shape emitted by AppInstaller / InstallationStepper */
export interface InstallerState {
  installing: boolean;
  updating?: boolean;
  currentQuest?: Quest | null;
}

export type AppVersion = { version: string; installed: boolean };

/** Enriched app = device-installed app + marketplace metadata + instances */
export interface EnrichedApp extends Omit<InstalledApp, 'status'> {
  /** Widened to include synthetic 'installing' status for phantom entries */
  status: AppStatus | 'installing';
  avatar?: string;
  title?: string;
  author?: string;
  relatedLinks?: string[];
  price?: string;
  permalink?: string;
  purchasable?: boolean;
  documentationUrl?: string;
  instances: AppInstance[];
  installedVersions: string[];
  versions: AppVersion[];
  /** Transient quest metadata attached by the InstalledApps page for "installing" phantom entries */
  _quest?: { description: string; progress?: number; state: QuestState };
}
