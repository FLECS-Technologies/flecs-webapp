/**
 * App Installer — ONE component for install, update, and sideload.
 * Uses generated orval mutations + quest polling. Zero wrapper hooks.
 *
 * Flow: check activation → mutation → waitForQuest → create instance → start
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  usePostAppsInstall,
  useDeleteAppsApp,
  usePostAppsSideload,
  getGetAppsQueryKey,
} from '@generated/core/apps/apps';
import {
  usePostInstancesCreate,
  usePostInstancesInstanceIdStart,
  usePatchInstancesInstanceId,
} from '@generated/core/instances/instances';
import { useGetDeviceLicenseActivationStatus } from '@generated/core/device/device';
import { getGetQuestsQueryKey } from '@generated/core/quests/quests';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import DeviceActivation from '@features/auth/components/DeviceActivation';
import { unwrapSuccess } from '@app/api/unwrap';
import { getErrorMessage } from '@app/api/fetch-error';
import type { JobMeta } from '@generated/core/schemas';
import type { EnrichedApp, InstallerState } from '@features/apps/types';

function isJobMeta(data: unknown): data is JobMeta {
  if (typeof data !== 'object' || data === null) return false;
  if (!('jobId' in data)) return false;
  return typeof data.jobId === 'number';
}

type Mode = 'install' | 'update' | 'sideload';
type Phase = 'activation' | 'running' | 'success' | 'error';

interface AppInstallerProps {
  mode: Mode;
  app?: EnrichedApp;
  manifest?: string;
  version?: string;
  fromVersion?: string;
  onStateChange?: (state: InstallerState) => void;
}

export default function AppInstaller({
  mode,
  app,
  manifest,
  version,
  fromVersion,
  onStateChange,
}: AppInstallerProps) {
  const [phase, setPhase] = useState<Phase>('activation');
  const [message, setMessage] = useState('');
  const ran = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const qc = useQueryClient();

  // Generated hooks — zero wrappers
  const { mutateAsync: installApp } = usePostAppsInstall();
  const { mutateAsync: sideloadApp } = usePostAppsSideload();
  const { mutateAsync: deleteApp } = useDeleteAppsApp();
  const { mutateAsync: patchInstance } = usePatchInstancesInstanceId();
  const { mutateAsync: createInstance } = usePostInstancesCreate();
  const { mutateAsync: startInstance } = usePostInstancesInstanceIdStart();
  const { waitForQuest } = useQuestActions();

  // Activation check — generated hook
  const { data: licData } = useGetDeviceLicenseActivationStatus({ query: { staleTime: 60_000 } });
  const activated = unwrapSuccess(licData)?.isValid ?? false;

  // NOTE: We intentionally do NOT abort the signal on unmount. The running
  // dialog tells the user "Installation continues in the background", and
  // StrictMode's dev-only double-cleanup would otherwise kill the install
  // as a false negative. The QueryObserver self-destroys when the quest
  // finishes (see waitForQuest cleanup path). abortRef stays wired so a
  // future explicit Cancel button can trigger it + DELETE /quests/{id}.

  const questStep = async (jobId: number) => {
    onStateChange?.({ installing: true });
    const result = await waitForQuest(jobId, abortRef.current?.signal);
    if (!questStateFinishedOk(result.state)) {
      throw new Error(result.result || result.detail || result.description || 'Quest failed');
    }
    return result;
  };

  /** Extract jobId from an orval mutation response. Backends return JobMeta on 202. */
  function getJobId<T extends { status: number; data: unknown }>(response: T): number {
    const data = unwrapSuccess(response);
    if (!isJobMeta(data)) throw new Error('No jobId in response');
    return data.jobId;
  }

  const runInstall = useCallback(async () => {
    if (ran.current) return;
    ran.current = true;
    abortRef.current = new AbortController();
    setPhase('running');
    setMessage('Installing...');

    try {
      if (mode === 'install') {
        if (!app?.appKey?.name || !version) throw new Error('Missing app name or version');
        const appKey = { name: app.appKey.name, version };

        setMessage('Installing app...');
        const r = await installApp({ data: { appKey } });
        // Surface the in-progress install immediately instead of waiting up to 10s for the next
        // poll: refetch /apps (so cards show "Installing" right away and survive a view switch)
        // and /quests (so the shared quest poll goes active and the progress % appears promptly).
        qc.invalidateQueries({ queryKey: getGetAppsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetQuestsQueryKey() });
        await questStep(getJobId(r));

        setMessage('Creating instance...');
        const cr = await createInstance({ data: { appKey } });
        const createResult = await questStep(getJobId(cr));

        if (createResult.result) {
          setMessage('Starting instance...');
          const sr = await startInstance({ instanceId: createResult.result });
          await questStep(getJobId(sr));
        }
      } else if (mode === 'sideload') {
        if (!manifest) throw new Error('No manifest provided');
        setMessage('Sideloading app...');
        const r = await sideloadApp({ data: { manifest } });
        await questStep(getJobId(r));
      } else if (mode === 'update') {
        if (!app?.appKey?.name || !version || !fromVersion) {
          throw new Error('Missing app, target version, or source version for update');
        }
        const appName = app.appKey.name;

        setMessage('Installing new version...');
        const r = await installApp({ data: { appKey: { name: appName, version } } });
        await questStep(getJobId(r));

        // Parallelize instance migrations. Cap enforces a defensive bound
        // against runaway manifests (WSTG-BUSL-07); 100 covers any realistic
        // single-device deployment and is renegotiable if the product changes.
        const instances = app.instances ?? [];
        if (instances.length > 100) {
          throw new Error(
            `Too many instances to migrate in one pass (${instances.length}). Reduce in batches.`,
          );
        }
        setMessage(`Migrating ${instances.length} instance${instances.length === 1 ? '' : 's'}...`);
        const results = await Promise.allSettled(
          instances.map(async (inst) => {
            const pr = await patchInstance({ instanceId: inst.instanceId, data: { to: version } });
            await questStep(getJobId(pr));
          }),
        );
        const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
        if (failures.length > 0) {
          const detail = failures.map((f) => getErrorMessage(f.reason)).join('; ');
          throw new Error(
            `${failures.length} of ${results.length} instance migrations failed: ${detail}`,
          );
        }

        setMessage('Removing old version...');
        const dr = await deleteApp({ app: appName, params: { version: fromVersion } });
        await questStep(getJobId(dr));
      }

      setPhase('success');
      setMessage(
        mode === 'install'
          ? 'App installed!'
          : mode === 'update'
            ? 'App updated!'
            : 'App sideloaded!',
      );
      qc.invalidateQueries();
    } catch (err: unknown) {
      setPhase('error');
      setMessage(getErrorMessage(err));
    }
  }, [
    mode,
    app,
    manifest,
    version,
    fromVersion,
    installApp,
    sideloadApp,
    deleteApp,
    patchInstance,
    createInstance,
    startInstance,
    qc,
  ]);

  // Auto-advance past activation when device is activated
  useEffect(() => {
    if (activated && phase === 'activation') runInstall();
  }, [activated, phase, runInstall]);

  // Phase: Activation check
  if (phase === 'activation' && !activated) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-sm text-muted">Device activation required</p>
        <DeviceActivation variant="line" />
      </div>
    );
  }

  // Phase: Running
  if (phase === 'running') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand border-t-transparent rounded-full" />
        <p className="text-sm">{message}</p>
        <p className="text-xs text-muted">
          You can close this window. Installation continues in the background.
        </p>
      </div>
    );
  }

  // Phase: Success
  if (phase === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <CheckCircle2 size={40} className="text-success" />
        <p className="text-sm font-semibold">{message}</p>
      </div>
    );
  }

  // Phase: Error
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <AlertCircle size={40} className="text-error" />
      <p className="text-sm text-error">{message}</p>
      <button
        onClick={() => {
          ran.current = false;
          setPhase('activation');
        }}
        className="flex items-center gap-2 px-4 py-2 border border-brand text-brand rounded-lg hover:bg-brand/10 transition"
      >
        <RotateCcw size={16} /> Retry
      </button>
    </div>
  );
}
