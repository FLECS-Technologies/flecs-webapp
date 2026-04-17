/**
 * App Installer — ONE component for install, update, and sideload.
 * Uses generated orval mutations + quest polling. Zero wrapper hooks.
 *
 * Flow: check activation → mutation → waitForQuest → create instance → start
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { usePostAppsInstall, useDeleteAppsApp, usePostAppsSideload } from '@generated/core/apps/apps';
import { usePostInstancesCreate, usePostInstancesInstanceIdStart, usePatchInstancesInstanceId } from '@generated/core/instances/instances';
import { useGetDeviceLicenseActivationStatus } from '@generated/core/device/device';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import DeviceActivation from '@features/auth/components/DeviceActivation';
import { unwrapSuccess } from '@app/api/unwrap';
import type { EnrichedApp, InstallerState } from '@features/apps/types';

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

export default function AppInstaller({ mode, app, manifest, version, fromVersion, onStateChange }: AppInstallerProps) {
  const [phase, setPhase] = useState<Phase>('activation');
  const [message, setMessage] = useState('');
  const ran = useRef(false);
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

  // Auto-advance past activation when device is activated
  useEffect(() => {
    if (activated && phase === 'activation') runInstall();
  }, [activated, phase]);

  const questStep = async (jobId: number) => {
    onStateChange?.({ installing: true });
    const result = await waitForQuest(jobId);
    if (!questStateFinishedOk(result.state)) throw new Error(result.description || 'Quest failed');
    return result;
  };

  /** Extract jobId from an orval mutation response via unwrapSuccess */
  const getJobId = (response: unknown): number => {
    const data = unwrapSuccess(response as { status: number; data: unknown });
    const jobId = (data as { jobId?: number } | undefined)?.jobId;
    if (!jobId) throw new Error('No jobId in response');
    return jobId;
  };

  const runInstall = useCallback(async () => {
    if (ran.current) return;
    ran.current = true;
    setPhase('running');
    setMessage('Installing...');

    try {
      if (mode === 'install') {
        setMessage('Installing app...');
        const r = await installApp({ data: { appKey: { name: app?.appKey?.name || app?.appKey?.name || '', version: version! } } });
        await questStep(getJobId(r));

        setMessage('Creating instance...');
        const cr = await createInstance({ data: { appKey: { name: app?.appKey?.name || '', version: version! } } });
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
        setMessage('Installing new version...');
        const r = await installApp({ data: { appKey: { name: app!.appKey.name, version: version! } } });
        await questStep(getJobId(r));

        setMessage('Migrating instances...');
        const instances = app?.instances || [];
        for (const inst of instances) {
          const pr = await patchInstance({ instanceId: inst.instanceId, data: { to: version! } });
          await questStep(getJobId(pr));
        }

        setMessage('Removing old version...');
        const dr = await deleteApp({ app: app!.appKey.name, params: { version: fromVersion! } });
        await questStep(getJobId(dr));
      }

      setPhase('success');
      setMessage(mode === 'install' ? 'App installed!' : mode === 'update' ? 'App updated!' : 'App sideloaded!');
      qc.invalidateQueries();
    } catch (err: unknown) {
      setPhase('error');
      setMessage(err instanceof Error ? err.message : 'Installation failed');
    }
  }, [mode, app, manifest, version, fromVersion]);

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
        <p className="text-xs text-muted">You can close this window. Installation continues in the background.</p>
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
      <button onClick={() => { ran.current = false; setPhase('activation'); }} className="flex items-center gap-2 px-4 py-2 border border-brand text-brand rounded-lg hover:bg-brand/10 transition">
        <RotateCcw size={16} /> Retry
      </button>
    </div>
  );
}
