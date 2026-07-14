import { describe, it, expect } from 'vitest';
import { AppStatus, QuestState } from '@generated/core/schemas';
import type { Quest } from '@generated/core/schemas';
import type { getQuestsResponse } from '@generated/core/quests/quests';
import type { EnrichedApp } from './types';
import {
  isAppInstalling,
  deriveInstallingApps,
  activeInstallQuestDescriptions,
} from './installing';

const questsResponse = (quests: Quest[]): getQuestsResponse => ({
  status: 200,
  data: quests,
  headers: new Headers(),
});

const app = (
  name: string,
  version: string,
  desired: AppStatus,
  status: AppStatus,
): EnrichedApp => ({
  appKey: { name, version },
  desired,
  status,
});

// isAppInstalling is the single source driving the Marketplace card's Installing/Installed
// state. Both come from the same /apps snapshot, so they can never disagree mid-install —
// the regression this guards against is the button flashing back to "Install Now".
describe('isAppInstalling', () => {
  it('is false for an app the daemon is not trying to install', () => {
    expect(isAppInstalling(undefined)).toBe(false);
    expect(
      isAppInstalling({ desired: AppStatus.not_installed, status: AppStatus.not_installed }),
    ).toBe(false);
  });

  it('is true throughout an install — every transient status before installed', () => {
    for (const status of [
      AppStatus.not_installed,
      AppStatus.manifest_downloaded,
      AppStatus.token_acquired,
      AppStatus.image_downloaded,
    ]) {
      expect(isAppInstalling({ desired: AppStatus.installed, status })).toBe(true);
    }
  });

  it('is false once installed, so the card flips straight to "Installed" with no gap', () => {
    expect(isAppInstalling({ desired: AppStatus.installed, status: AppStatus.installed })).toBe(
      false,
    );
  });

  it('is false while uninstalling (desired not installed)', () => {
    expect(isAppInstalling({ desired: AppStatus.not_installed, status: AppStatus.installed })).toBe(
      false,
    );
  });
});

// deriveInstallingApps is the only place that reads quests (for the progress %). It must not be
// fooled by leftover/duplicate quests — the exact failure mode of the earlier quest-matching bridge.
describe('deriveInstallingApps is robust to duplicate/leftover quests', () => {
  it('takes progress from the active quest, ignoring a finished duplicate (Install → Uninstall → Install)', () => {
    // A reinstall leaves an old succeeded "Install com.x-1.0" beside the new ongoing one.
    const apps = [app('com.x', '1.0', AppStatus.installed, AppStatus.image_downloaded)];
    const quests = questsResponse([
      { id: 1, description: 'Install com.x-1.0', state: QuestState.success },
      {
        id: 2,
        description: 'Install com.x-1.0',
        state: QuestState.ongoing,
        progress: { current: 3, total: 4 },
      },
    ]);
    const result = deriveInstallingApps(apps, quests);
    expect(result).toHaveLength(1);
    expect(result[0]._quest.state).toBe(QuestState.ongoing);
    expect(result[0]._quest.progress).toBe(75);
  });

  it('does not resurrect an uninstalled app from a leftover ongoing install quest', () => {
    // Uninstalled per /apps (desired != installed) — a stale ongoing quest must not resurrect it.
    const apps = [app('com.x', '1.0', AppStatus.not_installed, AppStatus.not_installed)];
    const quests = questsResponse([
      {
        id: 1,
        description: 'Install com.x-1.0',
        state: QuestState.ongoing,
        progress: { current: 1, total: 4 },
      },
    ]);
    expect(deriveInstallingApps(apps, quests)).toHaveLength(0);
  });
});

// The daemon briefly drops an app from /apps mid-(re)install. During that window the card has no
// /apps entry to read, so it bridges with an *active* install quest — but must ignore the succeeded
// duplicates that pile up across repeated install/uninstall cycles.
describe('activeInstallQuestDescriptions', () => {
  it('returns only ongoing/pending install quests, ignoring succeeded/failed duplicates', () => {
    const quests = questsResponse([
      {
        id: 1,
        description: 'Install org.eclipse-basys.aas-server-1.4.0',
        state: QuestState.failed,
      },
      {
        id: 2,
        description: 'Install io.anyviz.cloudadapter-flecs-2.1.3.1',
        state: QuestState.success,
      },
      {
        id: 3,
        description: 'Install io.anyviz.cloudadapter-flecs-2.1.3.1',
        state: QuestState.success,
      },
      {
        id: 4,
        description: 'Install io.anyviz.cloudadapter-flecs-2.1.3.1',
        state: QuestState.ongoing,
      },
      {
        id: 5,
        description: 'Uninstall io.anyviz.cloudadapter-flecs-2.1.3.1',
        state: QuestState.ongoing,
      },
    ]);
    expect(activeInstallQuestDescriptions(quests)).toEqual([
      'Install io.anyviz.cloudadapter-flecs-2.1.3.1',
    ]);
  });

  it('matches a card by name prefix (any version) without matching a sibling name', () => {
    const quests = questsResponse([
      { id: 1, description: 'Install io.anyviz.cloudadapter2-9.0.0', state: QuestState.ongoing },
    ]);
    const descriptions = activeInstallQuestDescriptions(quests);
    // The "-" delimiter after the name prevents "io.anyviz.cloudadapter" matching a longer sibling.
    expect(descriptions.some((d) => d.startsWith('Install io.anyviz.cloudadapter-'))).toBe(false);
    expect(descriptions.some((d) => d.startsWith('Install io.anyviz.cloudadapter2-'))).toBe(true);
  });
});
