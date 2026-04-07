import { useRef, useState } from 'react';
import { FileCode2, FolderUp, PackagePlus, RefreshCw } from 'lucide-react';
import Yaml from 'js-yaml';
import { useAppList } from '@features/apps/app-queries';
import { useGetSystemPing } from '@generated/core/system/system';
import EmptyApps from '@features/apps/components/EmptyApps';
import InstalledAppsTable from '../features/apps/components/InstalledAppsTable';
import ContentDialog from '@app/components/ContentDialog';
import InstallationStepper from '@features/apps/components/installation/InstallationStepper';
import Import from '@features/system/components/data-transfer/Import';
import Export from '@features/system/components/data-transfer/Export';
type App = any;
const getLatestVersion = (versions: string[]) => versions?.[0]; const createVersions = (v: string[]) => v;

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

function getAppsWithUpdates(apps: App[]) { return apps.filter(app => { if (!app.versions || !app.installedVersions) return false; const v = createVersions(app.versions, app.installedVersions); const l = getLatestVersion(v); return l && !app.installedVersions.includes(l.version); }); }

export default function InstalledApps() {
  const { appList, isLoading: appListLoading, isError: appListError } = useAppList();
  const { data: pingData } = useGetSystemPing({ query: { retry: false, refetchInterval: 30_000 } });
  const ping = !!pingData;
  const [sideloadDoc, setSideloadDoc] = useState<any>(null);
  const [sideloadPickerOpen, setSideloadPickerOpen] = useState(false);
  const [sideloadRunning, setSideloadRunning] = useState(false);
  const [updateAllOpen, setUpdateAllOpen] = useState(false);
  const sideloadInputRef = useRef<HTMLInputElement>(null);
  const installedApps = (appList ?? []).filter((app: App) => app?.status === 'installed');
  const appsWithUpdates = getAppsWithUpdates(installedApps);
  const updateCount = appsWithUpdates.length;

  const handleSideloadFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { try { const doc = Yaml.load(ev.target?.result as string); setSideloadDoc(doc); setSideloadPickerOpen(false); setSideloadRunning(true); } catch (err) { console.error('Failed to parse sideload file:', err); } }; reader.readAsText(file); e.target.value = ''; };

  if (!ping) return <div className="py-20 text-center"><p className="text-muted">FLECS services are not ready. Please try again in a moment.</p></div>;
  if (appListError) return <div className="py-20 text-center"><p className="text-error">Failed to load installed apps from the device.</p></div>;

  return (
    <div>
      <input ref={sideloadInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleSideloadFile} />

      <div className="mb-6">
        <span className="text-xs uppercase tracking-wider text-muted font-semibold">APPS</span>
        <h4 className="text-2xl font-extrabold">Installed Apps</h4>
        <p className="text-base text-muted mt-1">{installedApps.length} app{installedApps.length !== 1 ? 's' : ''} active on this device.</p>
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

      {appListLoading && ping && installedApps.length === 0 ? <RowSkeleton /> : installedApps.length === 0 && !appListLoading ? (
        <div className="rounded-xl border border-white/10"><EmptyApps onSideload={() => setSideloadPickerOpen(true)} /></div>
      ) : <InstalledAppsTable apps={installedApps} />}

      {installedApps.length > 0 && <div className="flex justify-end mt-4"><Export disabled={installedApps.length === 0} /></div>}

      <ContentDialog open={sideloadPickerOpen} setOpen={setSideloadPickerOpen} title="Deploy Your Own App">
        <div className="p-2">
          <p className="text-sm text-muted mb-5">Sideload a private or custom Docker app by uploading its JSON manifest.</p>
          <div className="border-2 border-dashed border-white/10 rounded-xl py-10 px-6 text-center cursor-pointer hover:border-brand hover:bg-brand/3 transition" onClick={() => sideloadInputRef.current?.click()}>
            <FileCode2 size={32} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: 8, display: 'inline-block' }} />
            <span className="text-sm font-bold block mb-1">Select app manifest</span>
            <span className="text-xs text-muted">Accepts .json files</span>
          </div>
          <p className="text-xs text-muted mt-4">The manifest defines the app name, version, Docker image, ports, and other configuration.</p>
        </div>
      </ContentDialog>

      <ContentDialog open={sideloadRunning} setOpen={setSideloadRunning} title="Installing Sideloaded App">
        <InstallationStepper app={sideloadDoc} sideload={true} />
      </ContentDialog>

      <ContentDialog open={updateAllOpen} setOpen={setUpdateAllOpen} title={`Update ${updateCount} app${updateCount !== 1 ? 's' : ''}`}>
        <div className="flex flex-col gap-4 p-2">{appsWithUpdates.map(app => { const v = createVersions(app.versions || [], app.installedVersions || []); const l = getLatestVersion(v); if (!l) return null; return <div key={app.appKey?.name}><InstallationStepper app={app} version={l.version} update={true} /></div>; })}</div>
      </ContentDialog>
    </div>
  );
}
