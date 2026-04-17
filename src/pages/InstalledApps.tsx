import { useMemo, useRef, useState } from 'react';
import { FileCode2, FolderUp, PackagePlus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAppList } from '@features/apps/app-queries';
import { useGetSystemPing } from '@generated/core/system/system';
import { useGetQuests } from '@generated/core/quests/quests';
import { QuestState } from '@generated/core/schemas';
import type { Quest } from '@generated/core/schemas';
import EmptyApps from '@features/apps/components/EmptyApps';
import InstalledAppsTable from '../features/apps/components/InstalledAppsTable';
import ContentDialog from '@app/components/ContentDialog';
import InstallationStepper from '@features/apps/components/installation/InstallationStepper';
import Import from '@features/system/components/data-transfer/Import';
import Export from '@features/system/components/data-transfer/Export';
import type { EnrichedApp, AppVersion } from '@features/apps/types';
import { unwrapSuccess } from '@app/api/unwrap';
const getLatestVersion = (versions: AppVersion[]) => versions?.[0]; const createVersions = (v: AppVersion[], _installed?: string[]) => v;

function RowSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      {[0, 1, 2].map(i => (
        <div key={i} className={i > 0 ? 'border-t border-white/10' : ''}>
          <div className="flex items-center gap-4 px-5 py-3">
            <div className="animate-pulse bg-white/10 rounded-lg w-12 h-12" />
            <div className="flex-1"><div className="animate-pulse bg-white/10 rounded h-5 w-[35%]" /><div className="animate-pulse bg-white/10 rounded h-3.5 w-[45%] mt-1" /><div className="animate-pulse bg-white/10 rounded h-3 w-[15%] mt-1" /></div>
            <div className="animate-pulse bg-white/10 rounded-lg w-[72px] h-8" />
            <div className="animate-pulse bg-white/10 rounded-full w-7 h-7" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getAppsWithUpdates(apps: EnrichedApp[]) { return apps.filter(app => { if (!app.versions || !app.installedVersions) return false; const v = createVersions(app.versions, app.installedVersions); const l = getLatestVersion(v); return l && !app.installedVersions.includes(l.version); }); }

/** Parse "Install io.linuxserver.mariadb-11.4.4" → { name, version } */
function parseInstallQuest(desc: string) {
  const m = desc.match(/^Install\s+(\S+)-(\S+)$/);
  return m ? { name: m[1], version: m[2] } : null;
}

export default function InstalledApps() {
  const { appList, isLoading: appListLoading, isError: appListError } = useAppList();
  const { data: pingData } = useGetSystemPing({ query: { retry: false, refetchInterval: 30_000 } });
  const { data: questsData } = useGetQuests({ query: { refetchInterval: 2000 } });
  const ping = !!pingData;
  const [sideloadManifest, setSideloadManifest] = useState<string | null>(null);
  const [sideloadPickerOpen, setSideloadPickerOpen] = useState(false);
  const [sideloadRunning, setSideloadRunning] = useState(false);
  const [updateAllOpen, setUpdateAllOpen] = useState(false);
  const sideloadInputRef = useRef<HTMLInputElement>(null);
  const installedApps = (appList ?? []).filter((app: EnrichedApp) => app?.status === 'installed');

  // Derive phantom "installing" entries from active install quests
  const installingApps = useMemo(() => {
    const quests = unwrapSuccess(questsData) ?? ([] as Quest[]);
    const activeInstalls = quests.filter(q =>
      (q.state === QuestState.ongoing || q.state === QuestState.pending) &&
      q.description?.startsWith('Install ')
    );
    const installedNames = new Set(installedApps.map((a: EnrichedApp) => a.appKey?.name));
    return activeInstalls
      .map(q => {
        const parsed = parseInstallQuest(q.description);
        if (!parsed || installedNames.has(parsed.name)) return null;
        const progress = q.progress;
        const pct = progress?.total ? Math.round((progress.current / progress.total) * 100) : undefined;
        return {
          appKey: { name: parsed.name, version: parsed.version },
          status: 'installing',
          title: parsed.name.split('.').pop(),
          _quest: { description: q.description, progress: pct, state: q.state },
        };
      })
      .filter(Boolean);
  }, [questsData, installedApps]);

  const allApps = [...installedApps, ...installingApps] as EnrichedApp[];
  const appsWithUpdates = getAppsWithUpdates(installedApps);
  const updateCount = appsWithUpdates.length;

  const handleSideloadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const MAX_BYTES = 1 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      toast.error(`Manifest too large (${Math.round(file.size / 1024)} KiB, max ${MAX_BYTES / 1024} KiB).`);
      return;
    }

    try {
      const raw = await file.text();
      if (!raw.trim()) {
        toast.error('Manifest file is empty.');
        return;
      }
      setSideloadManifest(raw);
      setSideloadPickerOpen(false);
      setSideloadRunning(true);
    } catch (err) {
      toast.error('Failed to read file', { description: err instanceof Error ? err.message : String(err) });
    }
  };

  if (!ping) return <div className="py-20 text-center"><p className="text-muted">FLECS services are not ready. Please try again in a moment.</p></div>;
  if (appListError) return <div className="py-20 text-center"><p className="text-error">Failed to load installed apps from the device.</p></div>;

  return (
    <div>
      <input ref={sideloadInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleSideloadFile} />

      <div className="mb-6">
        <span className="text-xs uppercase tracking-wider text-muted font-semibold">APPS</span>
        <h4 className="text-2xl font-extrabold">Installed Apps</h4>
        <p className="text-base text-muted mt-1">{installedApps.length} app{installedApps.length !== 1 ? 's' : ''} active on this device.{installingApps.length > 0 && ` ${installingApps.length} installing.`}</p>
      </div>

      <div className="flex gap-4 mb-5">
        <div onClick={() => setSideloadPickerOpen(true)} className="flex-1 px-5 py-4 rounded-xl border border-dashed border-white/10 flex items-center gap-4 cursor-pointer hover:border-brand hover:bg-brand/3 transition">
          <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-muted shrink-0"><PackagePlus size={22} /></div>
          <div className="flex-1"><span className="text-sm font-bold block">Deploy Your Own App</span><span className="text-xs text-muted">Upload a custom app manifest to sideload private Docker apps.</span></div>
          <button className="px-4 py-1.5 border border-brand text-brand rounded-lg text-sm font-semibold hover:bg-brand/10 transition whitespace-nowrap inline-flex items-center gap-1" onClick={() => setSideloadPickerOpen(true)}><PackagePlus size={14} /> Upload Manifest</button>
        </div>
        <div className="px-5 rounded-xl border border-dashed border-white/10 flex items-center gap-4 hover:border-brand hover:bg-brand/3 transition">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-muted shrink-0"><FolderUp size={18} /></div>
          <Import />
        </div>
      </div>

      {updateCount > 0 && (
        <div className="mb-5 px-5 py-3.5 rounded-xl border border-accent bg-accent/5 flex items-center gap-4">
          <RefreshCw size={20} className="text-accent shrink-0" />
          <div className="flex-1"><span className="text-sm font-bold block">{updateCount} update{updateCount !== 1 ? 's' : ''} available</span><span className="text-xs text-muted">{appsWithUpdates.map(a => a.title).join(', ')}</span></div>
          <button className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/80 transition whitespace-nowrap inline-flex items-center gap-1" onClick={() => setUpdateAllOpen(true)}><RefreshCw size={14} /> Update All</button>
        </div>
      )}

      {appListLoading && ping && allApps.length === 0 ? <RowSkeleton /> : allApps.length === 0 && !appListLoading ? (
        <div className="rounded-xl border border-white/10"><EmptyApps onSideload={() => setSideloadPickerOpen(true)} /></div>
      ) : <InstalledAppsTable apps={allApps} />}

      {installedApps.length > 0 && <div className="flex justify-end mt-4"><Export disabled={installedApps.length === 0} /></div>}

      <ContentDialog open={sideloadPickerOpen} setOpen={setSideloadPickerOpen} title="Deploy Your Own App">
        <div className="p-2">
          <p className="text-sm text-muted mb-5">Sideload a private or custom Docker app by uploading its manifest.</p>
          <div className="border-2 border-dashed border-white/10 rounded-xl py-10 px-6 text-center cursor-pointer hover:border-brand hover:bg-brand/3 transition" onClick={() => sideloadInputRef.current?.click()}>
            <FileCode2 size={32} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: 8, display: 'inline-block' }} />
            <span className="text-sm font-bold block mb-1">Select app manifest</span>
            <span className="text-xs text-muted">Accepts .json (max 1 MiB)</span>
          </div>
          <p className="text-xs text-muted mt-4">The manifest defines the app name, version, Docker image, ports, and other configuration.</p>
        </div>
      </ContentDialog>

      <ContentDialog open={sideloadRunning} setOpen={setSideloadRunning} title="Installing Sideloaded App">
        <InstallationStepper manifest={sideloadManifest ?? undefined} sideload={true} />
      </ContentDialog>

      <ContentDialog open={updateAllOpen} setOpen={setUpdateAllOpen} title={`Update ${updateCount} app${updateCount !== 1 ? 's' : ''}`}>
        <div className="flex flex-col gap-4 p-2">{appsWithUpdates.map(app => { const v = createVersions(app.versions || [], app.installedVersions || []); const l = getLatestVersion(v); if (!l) return null; return <div key={app.appKey?.name}><InstallationStepper app={app} version={l.version} update={true} /></div>; })}</div>
      </ContentDialog>
    </div>
  );
}
