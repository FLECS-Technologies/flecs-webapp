import { useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties } from 'react';
import { toast } from 'sonner';
import ReactDOM from 'react-dom';
import {
  LayersPlus,
  MoreHorizontal,
  Play,
  Plus,
  Square,
  Settings,
  Info,
  Trash2,
  BookOpen,
  RefreshCw,
  Package,
} from 'lucide-react';
import type { EnrichedApp, AppVersion } from '@features/apps/types';
import type { AppInstance } from '@generated/core/schemas';
import AppStatusDot from './AppStatusDot';
import UpdateButton from '@features/apps/components/actions/UpdateButton';
import ContentDialog from '@app/components/ContentDialog';
import ConfirmDialog from '@app/components/ConfirmDialog';
import { useDeleteAppsApp } from '@generated/core/apps/apps';
import { useGetManifestsAppNameVersion } from '@generated/core/manifests/manifests';
import InstanceInfo from './instances/InstanceInfo';
import InstanceConfigDialog, { type SectionKey } from './instances/InstanceConfigDialog';
import InstanceNameDialog from './InstanceNameDialog';
import { VersionSelector } from '@app/components/VersionSelector';
import { createUrl } from '@features/apps/components/actions/EditorButton';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { unwrapSuccess } from '@app/api/unwrap';
import { getErrorMessage } from '@app/api/fetch-error';

import { isFinishedOk as questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import {
  useDeleteInstancesInstanceId,
  postInstancesCreate,
  postInstancesInstanceIdStart,
  postInstancesInstanceIdStop,
} from '@generated/core/instances/instances';
import type { JobMeta } from '@generated/core/schemas';

interface InstalledAppRowProps {
  app: EnrichedApp;
  instance?: AppInstance;
}

export default function InstalledAppRow({ app, instance }: InstalledAppRowProps) {
  const qc = useQueryClient();
  const { waitForQuest } = useQuestActions();
  const { mutateAsync: deleteApp } = useDeleteAppsApp();
  const { mutateAsync: deleteInstance } = useDeleteInstancesInstanceId();
  const { data: manifestResponse, isPending: manifestPending } = useGetManifestsAppNameVersion(
    app.appKey.name,
    app.appKey.version,
    {
      query: { staleTime: 300_000 },
    },
  );
  const manifest = unwrapSuccess(manifestResponse);
  const isInstalling = app.status === 'installing';
  const canDuplicateApp = manifest?.multiInstance === true;
  const instanceCount = app.instances?.length ?? 0;
  const isInstanceScopedApp = Boolean(instance && (canDuplicateApp || instanceCount > 1));
  const isLastInstanceOfApp = isInstanceScopedApp && instanceCount <= 1;
  const canShowAppUninstall = !instance || (!manifestPending && !isInstanceScopedApp);
  const isRunning = instance?.status === 'running';
  const isStopped = instance?.status === 'stopped';
  const hasEditors = (instance?.editors?.length ?? 0) > 0;
  const primaryEditor = instance?.editors?.[0];
  const versionsArray = app.versions ?? [];
  const latestVersion = versionsArray[0];
  const updateAvailable =
    !isInstalling &&
    latestVersion &&
    app.installedVersions &&
    !app.installedVersions.includes(latestVersion.version);
  const [selectedVersion, setSelectedVersion] = useState<AppVersion>(
    latestVersion ?? { version: app.appKey?.version ?? '', installed: true },
  );
  const questProgress = app._quest?.progress;
  const statusLabel = isInstalling
    ? `Installing${questProgress != null ? `... ${questProgress}%` : ''}`
    : !instance
      ? 'No instance'
      : isRunning
        ? 'Running'
        : isStopped
          ? 'Stopped'
          : (instance.status ?? 'Unknown');
  const [menuAnchor, setMenuAnchor] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({ visibility: 'hidden' });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SectionKey | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [confirmUninstall, setConfirmUninstall] = useState(false);
  const [confirmDeleteInstance, setConfirmDeleteInstance] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return; // let button toggle handle it
      if (menuRef.current && !menuRef.current.contains(target)) setMenuAnchor(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Position the portal menu so it stays fully within the viewport: flip it
  // above the button when there isn't room below, and cap its height as a
  // safety net so a long menu near a screen edge never gets clipped.
  useLayoutEffect(() => {
    if (!menuAnchor) {
      setMenuStyle({ visibility: 'hidden' });
      return;
    }
    const btn = btnRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;
    const rect = btn.getBoundingClientRect();
    const margin = 8;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const openUp = menu.offsetHeight > spaceBelow && spaceAbove > spaceBelow;
    setMenuStyle({
      position: 'fixed',
      right: window.innerWidth - rect.right,
      maxHeight: Math.max(openUp ? spaceAbove : spaceBelow, 0),
      overflowY: 'auto',
      ...(openUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
  }, [menuAnchor]);

  /** Extract jobId from a 202 response (mutator throws on non-2xx, so data is always success variant) */
  const extractJobId = (resp: { data: unknown; status: number }): number => {
    const data = resp.data as JobMeta;
    return data.jobId;
  };

  const runInstanceAction = async (
    action: () => Promise<{ data: unknown; status: number }>,
    successMsg: string,
    failMsg: string,
  ) => {
    setBusy(true);
    setMenuAnchor(false);
    try {
      const resp = await action();
      const jobId = extractJobId(resp);
      const result = await waitForQuest(jobId);
      if (questStateFinishedOk(result.state)) toast.success(successMsg);
      else throw new Error(result.description);
    } catch (err: unknown) {
      toast.error(failMsg, { description: getErrorMessage(err) });
    } finally {
      qc.invalidateQueries();
      setBusy(false);
    }
  };

  const handleCreateAndStart = async (instanceName?: string) => {
    setBusy(true);
    setMenuAnchor(false);
    try {
      const trimmedInstanceName =
        typeof instanceName === 'string' ? instanceName.trim() : undefined;
      const createQuest = await postInstancesCreate({
        appKey: { name: app.appKey.name, version: app.appKey.version },
        ...(trimmedInstanceName ? { instanceName: trimmedInstanceName } : {}),
      });
      const createJobId = unwrapSuccess(createQuest)?.jobId;
      if (!createJobId) throw new Error('No jobId in create response');
      const createResult = await waitForQuest(createJobId);
      if (questStateFinishedOk(createResult.state) && createResult.result) {
        const startQuest = await postInstancesInstanceIdStart(createResult.result);
        const startJobId = unwrapSuccess(startQuest)?.jobId;
        if (startJobId) await waitForQuest(startJobId);
      }
      toast.success(`${app.title} started`);
    } catch (err: unknown) {
      toast.error(`Failed to create instance of ${app.title}`, {
        description: getErrorMessage(err),
      });
    } finally {
      qc.invalidateQueries();
      setBusy(false);
    }
  };

  const handleUninstallApp = async () => {
    setBusy(true);
    try {
      const r = await deleteApp({
        app: app.appKey.name,
        params: { version: app.appKey.version },
      });
      const jobId = unwrapSuccess(r)?.jobId;
      if (jobId) {
        const result = await waitForQuest(jobId);
        if (questStateFinishedOk(result.state)) toast.success(`${app.title} uninstalled`);
        else toast.error(`Failed to uninstall ${app.title}`);
      }
      qc.invalidateQueries();
    } catch (err: unknown) {
      toast.error(`Failed to uninstall ${app.title}`, { description: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteInstance = async () => {
    if (!instance) return;
    setBusy(true);
    try {
      const r = await deleteInstance({ instanceId: instance.instanceId });
      const jobId = unwrapSuccess(r)?.jobId;
      if (jobId) {
        const result = await waitForQuest(jobId);
        if (questStateFinishedOk(result.state)) {
          toast.success(`${instance.instanceName || app.title} deleted`);
        } else {
          toast.error(`Failed to delete ${instance.instanceName || app.title}`);
        }
      }
      qc.invalidateQueries();
    } catch (err: unknown) {
      toast.error(`Failed to delete ${instance.instanceName || app.title}`, {
        description: getErrorMessage(err),
      });
    } finally {
      setBusy(false);
    }
  };

  const selectedVersionNotInstalled = !app.installedVersions?.includes(selectedVersion.version);
  const instanceName = instance?.instanceName.trim();
  const instanceDisplayName =
    isInstanceScopedApp && instance ? instanceName || `Instance ${instance.instanceId}` : undefined;
  const instanceActionName = instanceDisplayName || instance?.instanceId;
  const rowActionLabel = instance
    ? `${app.title} ${instanceActionName} actions`
    : `${app.title} actions`;
  return (
    <>
      <div className="flex items-center gap-4 px-5 py-3 hover:bg-surface-hover transition">
        {/* Avatar - image from marketplace, generic package icon for sideloaded apps */}
        <div className="w-12 h-12 rounded-lg bg-surface-hover flex items-center justify-center text-muted border border-border overflow-hidden shrink-0">
          {app.avatar ? (
            <img src={app.avatar} alt={app.title} className="w-full h-full object-cover" />
          ) : (
            <Package size={22} />
          )}
        </div>
        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm truncate">
              <span className="font-bold">{app.title}</span>
              {instanceDisplayName && (
                <span className="font-normal text-text-primary"> ({instanceDisplayName})</span>
              )}
            </span>
            {updateAvailable && (
              <span
                className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[0.65rem] font-semibold cursor-pointer inline-flex items-center gap-1"
                onClick={() => {
                  setSettingsSection('version');
                  setSettingsOpen(true);
                }}
              >
                <RefreshCw size={10} /> Update
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            {app.author && <span className="truncate">{app.author}</span>}
            {app.author && <span>-</span>}
            <span className="font-mono truncate">{app.appKey?.version}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isInstalling ? (
              <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            ) : (
              <AppStatusDot status={instance?.status ?? 'stopped'} size={8} />
            )}
            <span
              className={`text-xs font-medium ${isInstalling ? 'text-brand' : isRunning ? 'text-success' : 'text-muted'}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>
        {/* Open button */}
        {hasEditors && (
          <button
            title={`Open ${primaryEditor?.name || app.title} in a new tab`}
            disabled={!isRunning}
            onClick={() => primaryEditor && window.open(createUrl(primaryEditor.url))}
            className="px-4 py-1.5 border border-border rounded-lg text-sm font-semibold hover:border-brand hover:bg-brand/5 transition whitespace-nowrap disabled:opacity-40"
          >
            Open
          </button>
        )}
        {/* Menu */}
        <div className="relative">
          <button
            ref={btnRef}
            aria-label={rowActionLabel}
            className="p-1.5 rounded-lg hover:bg-surface-hover transition text-muted cursor-pointer"
            onClick={() => setMenuAnchor(!menuAnchor)}
            disabled={busy}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuAnchor &&
            ReactDOM.createPortal(
              <div
                ref={menuRef}
                style={menuStyle}
                className="w-48 rounded-xl bg-surface-raised border border-border shadow-xl z-[9999] py-1"
              >
                {canDuplicateApp && (
                  <>
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium hover:bg-surface-hover transition"
                      onClick={() => {
                        setMenuAnchor(false);
                        setDuplicateOpen(true);
                      }}
                    >
                      <LayersPlus size={16} /> Duplicate app
                    </button>
                    <hr className="border-border my-1" />
                  </>
                )}
                {!instance && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-surface-hover transition"
                    onClick={() => handleCreateAndStart()}
                  >
                    <Plus size={16} /> Create & Start
                  </button>
                )}
                {instance && isStopped && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-surface-hover transition"
                    onClick={() =>
                      runInstanceAction(
                        () => postInstancesInstanceIdStart(instance.instanceId),
                        `${app.title} started`,
                        `Failed to start ${app.title}`,
                      )
                    }
                  >
                    <Play size={16} /> Start
                  </button>
                )}
                {instance && isRunning && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-surface-hover transition"
                    onClick={() =>
                      runInstanceAction(
                        () => postInstancesInstanceIdStop(instance.instanceId),
                        `${app.title} stopped`,
                        `Failed to stop ${app.title}`,
                      )
                    }
                  >
                    <Square size={16} /> Stop
                  </button>
                )}
                {instance && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-surface-hover transition"
                    onClick={() => {
                      setMenuAnchor(false);
                      setSettingsSection(undefined);
                      setSettingsOpen(true);
                    }}
                  >
                    <Settings size={16} /> Configure
                  </button>
                )}
                {instance && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-surface-hover transition"
                    onClick={() => {
                      setMenuAnchor(false);
                      setInfoOpen(true);
                    }}
                  >
                    <Info size={16} /> Info & Logs
                  </button>
                )}
                {app.documentationUrl && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-surface-hover transition"
                    onClick={() => {
                      setMenuAnchor(false);
                      window.open(app.documentationUrl);
                    }}
                  >
                    <BookOpen size={16} /> Documentation
                  </button>
                )}
                {(isInstanceScopedApp || canShowAppUninstall) && (
                  <hr className="border-border my-1" />
                )}
                {isInstanceScopedApp && instance && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-surface-hover transition cursor-pointer"
                    onClick={() => {
                      setMenuAnchor(false);
                      setConfirmDeleteInstance(true);
                    }}
                  >
                    <Trash2 size={16} />
                    {isLastInstanceOfApp ? 'Uninstall app' : 'Delete instance'}
                  </button>
                )}
                {canShowAppUninstall && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-surface-hover transition cursor-pointer"
                    onClick={() => {
                      setMenuAnchor(false);
                      setConfirmUninstall(true);
                    }}
                  >
                    <Trash2 size={16} /> Uninstall app
                  </button>
                )}
              </div>,
              document.body,
            )}
        </div>
      </div>
      {instance && (
        <>
          <ContentDialog
            title={`Info: ${instance.instanceName}`}
            open={infoOpen}
            setOpen={setInfoOpen}
          >
            <InstanceInfo instance={instance} />
          </ContentDialog>
          <InstanceConfigDialog
            instanceId={instance.instanceId}
            instanceName={instance.instanceName}
            open={settingsOpen}
            initialSection={settingsSection}
            onClose={() => setSettingsOpen(false)}
            versionSection={
              versionsArray.length > 0 ? (
                <div>
                  <VersionSelector
                    availableVersions={versionsArray}
                    selectedVersion={selectedVersion}
                    setSelectedVersion={setSelectedVersion}
                  />
                  {selectedVersionNotInstalled && (
                    <div className="mt-4">
                      <UpdateButton app={app} to={selectedVersion} showSelectedVersion fullWidth />
                    </div>
                  )}
                  {!selectedVersionNotInstalled && (
                    <p className="text-sm text-muted mt-4 text-center">
                      {selectedVersion?.version} is already installed.
                    </p>
                  )}
                </div>
              ) : undefined
            }
          />
        </>
      )}
      <InstanceNameDialog
        app={app}
        open={duplicateOpen}
        setOpen={setDuplicateOpen}
        busy={busy}
        onSubmit={handleCreateAndStart}
      />
      <ConfirmDialog
        title={`Uninstall ${app.title}?`}
        open={confirmUninstall}
        setOpen={setConfirmUninstall}
        confirmLabel="Uninstall app"
        confirmDestructive
        onConfirm={handleUninstallApp}
      >
        This will remove {app.title} and all its data from your device.
      </ConfirmDialog>
      {instance && (
        <ConfirmDialog
          title={
            isLastInstanceOfApp
              ? `Uninstall ${app.title}?`
              : `Delete ${instance.instanceName || app.title} instance?`
          }
          open={confirmDeleteInstance}
          setOpen={setConfirmDeleteInstance}
          confirmLabel={isLastInstanceOfApp ? 'Uninstall app' : 'Delete instance'}
          confirmDestructive
          onConfirm={isLastInstanceOfApp ? handleUninstallApp : handleDeleteInstance}
        >
          {isLastInstanceOfApp
            ? `This is the only ${app.title} instance. The app and its data will be removed from your device.`
            : `This will remove only this instance and its data. Other ${app.title} instances remain installed.`}
        </ConfirmDialog>
      )}
    </>
  );
}
