import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ExternalLink, MoreHorizontal, Play, Plus, Square, Settings, Info, Trash2, BookOpen, RefreshCw } from 'lucide-react';
type App = any;
type Version = string;
const getLatestVersion = (versions: string[]) => versions?.[0]; const createVersion = (v: string) => v; const createVersions = (v: string[]) => v;
import AppStatusDot from './AppStatusDot';
import UninstallButton from '@features/apps/components/actions/UninstallButton';
import UpdateButton from '@features/apps/components/actions/UpdateButton';
import ActionSnackbar from '@app/components/ActionSnackbar';
import ContentDialog from '@app/components/ContentDialog';
import InstanceInfo from './instances/InstanceInfo';
import InstanceConfigDialog from './instances/InstanceConfigDialog';
import { VersionSelector } from '@app/components/VersionSelector';
import { createUrl } from '@features/apps/components/actions/editors/EditorButton';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { useInvalidateAppData } from '@features/apps/hooks/app-queries';
import { isFinishedOk as questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import { postInstancesCreate, postInstancesInstanceIdStart, postInstancesInstanceIdStop } from '@generated/core/instances/instances';
import type { JobMeta } from '@generated/core/schemas';

interface InstalledAppRowProps { app: App; }

export default function InstalledAppRow({ app }: InstalledAppRowProps) {
  const invalidateAppData = useInvalidateAppData();
  const { waitForQuest } = useQuestActions();
  const instance = (app.instances ?? [])[0] as any | undefined;
  const isRunning = instance?.status === 'running';
  const isStopped = instance?.status === 'stopped';
  const hasEditors = instance?.editors?.length > 0;
  const primaryEditor = instance?.editors?.[0];
  const versionsArray = app.versions ? createVersions(app.versions, app.installedVersions || []) : [];
  const latestVersion = getLatestVersion(versionsArray);
  const updateAvailable = latestVersion && app.installedVersions && !app.installedVersions.includes(latestVersion.version);
  const [selectedVersion, setSelectedVersion] = useState<Version>(latestVersion ?? createVersion(app.appKey?.version ?? ''));
  const statusLabel = !instance ? 'No instance' : isRunning ? 'Running' : isStopped ? 'Stopped' : instance.status ?? 'Unknown';
  const [menuAnchor, setMenuAnchor] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ text: '', severity: 'success' as 'success' | 'error', errorText: '' });

  useEffect(() => { const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAnchor(false); }; document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler); }, []);

  const runInstanceAction = async (action: () => Promise<any>, successMsg: string, failMsg: string) => {
    setBusy(true); setMenuAnchor(false);
    try { const quest = await action(); const result = await waitForQuest((quest.data as JobMeta).jobId); if (questStateFinishedOk(result.state)) setSnackbar({ text: successMsg, severity: 'success', errorText: '' }); else throw new Error(result.description); }
    catch (err: any) { setSnackbar({ text: failMsg, severity: 'error', errorText: err?.message ?? '' }); }
    finally { setSnackbarOpen(true); invalidateAppData(); setBusy(false); }
  };

  const handleCreateAndStart = async () => {
    setBusy(true); setMenuAnchor(false);
    try { const createQuest = await postInstancesCreate({ appKey: { name: app.appKey.name, version: app.appKey.version } }); const createResult = await waitForQuest((createQuest.data as JobMeta).jobId); if (questStateFinishedOk(createResult.state) && createResult.result) { const startQuest = await postInstancesInstanceIdStart(createResult.result); await waitForQuest((startQuest.data as JobMeta).jobId); } setSnackbar({ text: `${app.title} started`, severity: 'success', errorText: '' }); }
    catch (err: any) { setSnackbar({ text: `Failed to create instance of ${app.title}`, severity: 'error', errorText: err?.message ?? '' }); }
    finally { setSnackbarOpen(true); invalidateAppData(); setBusy(false); }
  };

  const selectedVersionNotInstalled = !app.installedVersions?.includes(selectedVersion.version);

  return (
    <>
      <div className="flex items-center gap-4 px-5 py-3 hover:bg-white/3 transition">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-lg font-bold border border-white/10 overflow-hidden shrink-0">
          {app.avatar ? <img src={app.avatar} alt={app.title} className="w-full h-full object-cover" /> : app.title?.charAt(0).toUpperCase()}
        </div>
        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold truncate">{app.title}</span>
            {updateAvailable && <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[0.65rem] font-semibold cursor-pointer inline-flex items-center gap-1" onClick={() => setSettingsOpen(true)}><RefreshCw size={10} /> Update</span>}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            {app.author && <span className="truncate">{app.author}</span>}
            {app.author && <span>-</span>}
            <span className="font-mono truncate">v{app.appKey?.version}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <AppStatusDot status={instance?.status ?? 'stopped'} size={8} />
            <span className={`text-xs font-medium ${isRunning ? 'text-success' : 'text-muted'}`}>{statusLabel}</span>
          </div>
        </div>
        {/* Open button */}
        {hasEditors && (
          <button title={`Open ${primaryEditor.name || app.title} in a new tab`} disabled={!isRunning} onClick={() => primaryEditor && window.open(createUrl(primaryEditor.url))} className="px-4 py-1.5 border border-white/10 rounded-lg text-sm font-semibold hover:border-brand hover:bg-brand/5 transition whitespace-nowrap disabled:opacity-40">Open</button>
        )}
        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition text-muted" onClick={() => setMenuAnchor(!menuAnchor)} disabled={busy}><MoreHorizontal size={18} /></button>
          {menuAnchor && (
            <div className="absolute right-0 mt-1 w-48 rounded-xl bg-dark-end border border-white/10 shadow-xl z-50 py-1">
              {!instance && <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition" onClick={handleCreateAndStart}><Plus size={16} /> Create & Start</button>}
              {instance && isStopped && <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition" onClick={() => runInstanceAction(() => postInstancesInstanceIdStart(instance.instanceId), `${app.title} started`, `Failed to start ${app.title}`)}><Play size={16} /> Start</button>}
              {instance && isRunning && <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition" onClick={() => runInstanceAction(() => postInstancesInstanceIdStop(instance.instanceId), `${app.title} stopped`, `Failed to stop ${app.title}`)}><Square size={16} /> Stop</button>}
              {instance && <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition" onClick={() => { setMenuAnchor(false); setSettingsOpen(true); }}><Settings size={16} /> Settings</button>}
              {instance && <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition" onClick={() => { setMenuAnchor(false); setInfoOpen(true); }}><Info size={16} /> Info & Logs</button>}
              {app.documentationUrl && <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition" onClick={() => { setMenuAnchor(false); window.open(app.documentationUrl); }}><BookOpen size={16} /> Documentation</button>}
              <hr className="border-white/10 my-1" />
              <UninstallButton app={app} selectedVersion={{ version: app.appKey?.version }} variant="menuItem" onUninstallComplete={(success, message, error) => { setSnackbar({ text: message, severity: success ? 'success' : 'error', errorText: error ?? '' }); setSnackbarOpen(true); }} onMenuClose={() => setMenuAnchor(false)} />
            </div>
          )}
        </div>
      </div>
      {ReactDOM.createPortal(
        <>
          {instance && (
            <>
              <ContentDialog title={`Info: ${instance.instanceName}`} open={infoOpen} setOpen={setInfoOpen}><InstanceInfo instance={instance} /></ContentDialog>
              <InstanceConfigDialog instanceId={instance.instanceId} instanceName={instance.instanceName} open={settingsOpen} onClose={() => setSettingsOpen(false)} versionSection={versionsArray.length > 0 ? (
                <div>
                  <VersionSelector availableVersions={versionsArray} selectedVersion={selectedVersion} setSelectedVersion={setSelectedVersion} />
                  {selectedVersionNotInstalled && <div className="mt-4"><UpdateButton app={app} to={selectedVersion} showSelectedVersion fullWidth /></div>}
                  {!selectedVersionNotInstalled && <p className="text-sm text-muted mt-4 text-center">v{selectedVersion.version} is already installed.</p>}
                </div>
              ) : undefined} />
            </>
          )}
          <ActionSnackbar text={snackbar.text} errorText={snackbar.errorText} open={snackbarOpen} setOpen={setSnackbarOpen} alertSeverity={snackbar.severity} />
        </>, document.body
      )}
    </>
  );
}
