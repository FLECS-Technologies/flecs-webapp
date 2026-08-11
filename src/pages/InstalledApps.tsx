import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArchiveRestore,
  ArrowRight,
  ChevronRight,
  FileCode2,
  PackagePlus,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useAppList } from '@features/apps/app-queries';
import { useGetSystemPing } from '@generated/core/system/system';
import { useGetQuests } from '@generated/core/quests/quests';
import EmptyApps from '@features/apps/components/EmptyApps';
import InstalledAppsTable from '../features/apps/components/InstalledAppsTable';
import RowSkeleton from '@features/apps/components/RowSkeleton';
import ContentDialog from '@app/components/ContentDialog';
import PageHeader from '@app/components/PageHeader';
import { useFileDrop } from '@app/components/useFileDrop';
import InstallationStepper from '@features/apps/components/installation/InstallationStepper';
import type { EnrichedApp, AppVersion } from '@features/apps/types';
import { deriveInstallingApps } from '@features/apps/installing';
const getLatestVersion = (versions: AppVersion[]) => versions?.[0];
const createVersions = (v: AppVersion[], _installed?: string[]) => v;

function getAppsWithUpdates(apps: EnrichedApp[]) {
  return apps.filter((app) => {
    if (!app.versions || !app.installedVersions) return false;
    const v = createVersions(app.versions, app.installedVersions);
    const l = getLatestVersion(v);
    return l && !app.installedVersions.includes(l.version);
  });
}

export default function InstalledApps() {
  const { appList, isLoading: appListLoading, isError: appListError } = useAppList();
  const { data: pingData, isLoading: pingLoading } = useGetSystemPing({
    query: { retry: false, refetchInterval: 30_000 },
  });
  // Read from the shared /quests cache. Polling is driven by useQuestPolling
  // in JobsRail (globally mounted in Frame) — adding another refetchInterval
  // here would force the shared query to 2s even when nothing is active.
  const { data: questsData } = useGetQuests();
  const ping = !!pingData;
  const isLoading = appListLoading || pingLoading;
  const [sideloadManifest, setSideloadManifest] = useState<string | null>(null);
  const [sideloadPickerOpen, setSideloadPickerOpen] = useState(false);
  const [sideloadRunning, setSideloadRunning] = useState(false);
  const [updateAllOpen, setUpdateAllOpen] = useState(false);
  const sideloadInputRef = useRef<HTMLInputElement>(null);
  const installedApps = (appList ?? []).filter((app: EnrichedApp) => app?.status === 'installed');

  // Derive "installing" entries from the durable /apps + /quests caches (shared with
  // the Marketplace cards so both surfaces reconstruct the state after any remount).
  const installingApps = useMemo(
    () => deriveInstallingApps(appList, questsData),
    [appList, questsData],
  );

  const allApps = useMemo(() => {
    const combined = [...installedApps, ...installingApps] as EnrichedApp[];
    const c = new Intl.Collator('en', { sensitivity: 'base', usage: 'sort' });
    return combined.sort((a, b) => c.compare(a.title ?? a.appKey.name, b.title ?? b.appKey.name));
  }, [installedApps, installingApps]);
  const appsWithUpdates = getAppsWithUpdates(installedApps);
  const updateCount = appsWithUpdates.length;

  const sideloadFile = async (file: File) => {
    const MAX_BYTES = 1 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      toast.error(
        `Manifest too large (${Math.round(file.size / 1024)} KiB, max ${MAX_BYTES / 1024} KiB).`,
      );
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
      toast.error('Failed to read file', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleSideloadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) sideloadFile(file);
  };

  const rejectManifest = () =>
    toast.error('Unsupported file type. Please drop a .json manifest file.');
  const cardDrop = useFileDrop({
    accept: ['.json'],
    onFile: sideloadFile,
    onReject: rejectManifest,
  });
  const dialogDrop = useFileDrop({
    accept: ['.json'],
    onFile: sideloadFile,
    onReject: rejectManifest,
  });

  // A file dropped outside a dropzone must not navigate the browser away
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  // Only surface "not ready" once the ping has actually settled without a pong.
  // While it's still in flight we fall through to the skeleton, so a reload goes
  // straight from skeleton to data — no "services not ready" flash in between.
  if (!pingLoading && !ping)
    return (
      <div className="py-20 text-center">
        <p className="text-muted">FLECS services are not ready. Please try again in a moment.</p>
      </div>
    );
  if (appListError)
    return (
      <div className="py-20 text-center">
        <p className="text-error">Failed to load installed apps from the device.</p>
      </div>
    );

  return (
    <div>
      <input
        ref={sideloadInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleSideloadFile}
      />

      <PageHeader
        title="Installed Apps"
        description="Manage apps and instances running on this device."
      />

      <div className="mb-5 flex flex-col gap-4 lg:flex-row">
        <div
          data-testid="sideload-dropzone"
          role="button"
          tabIndex={0}
          onClick={() => setSideloadPickerOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setSideloadPickerOpen(true);
            }
          }}
          {...cardDrop.dropProps}
          className={`flex-1 px-5 py-4 rounded-xl border border-dashed flex items-center gap-4 cursor-pointer hover:border-brand hover:bg-brand/3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${cardDrop.isDragOver ? 'border-brand bg-brand/3' : 'border-border'}`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <PackagePlus size={22} />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold block">Deploy Your Own App</span>
            <span className="text-xs text-muted">Drop a manifest here or choose a file.</span>
          </div>
        </div>
        <Link
          to="/system?section=backup-migration"
          className="group flex min-h-[76px] items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 transition hover:border-brand hover:bg-brand/3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:w-72 lg:flex-none"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-muted transition group-hover:text-brand">
            <ArchiveRestore size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Backup &amp; migration</span>
            <span className="mt-0.5 block text-xs text-muted">Back up, restore, or onboard.</span>
          </span>
          <span className="relative h-[18px] w-[18px] shrink-0 text-muted transition-colors group-hover:text-brand group-focus-visible:text-brand">
            <ChevronRight
              size={18}
              className="absolute inset-0 transition-all duration-200 ease-out group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0"
            />
            <ArrowRight
              size={16}
              className="absolute inset-y-px left-px scale-75 opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
            />
          </span>
        </Link>
      </div>

      {updateCount > 0 && (
        <div className="mb-5 px-5 py-3.5 rounded-xl border border-accent bg-accent/5 flex items-center gap-4">
          <RefreshCw size={20} className="text-accent shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-bold block">
              {updateCount} update{updateCount !== 1 ? 's' : ''} available
            </span>
            <span className="text-xs text-muted">
              {appsWithUpdates.map((a) => a.title).join(', ')}
            </span>
          </div>
          <button
            className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/80 transition whitespace-nowrap inline-flex items-center gap-1"
            onClick={() => setUpdateAllOpen(true)}
          >
            <RefreshCw size={14} /> Update All
          </button>
        </div>
      )}

      {isLoading && allApps.length === 0 ? (
        <RowSkeleton />
      ) : allApps.length === 0 ? (
        <div className="rounded-xl border border-border">
          <EmptyApps onSideload={() => setSideloadPickerOpen(true)} />
        </div>
      ) : (
        <InstalledAppsTable apps={allApps} />
      )}

      <ContentDialog
        open={sideloadPickerOpen}
        setOpen={setSideloadPickerOpen}
        title="Deploy Your Own App"
      >
        <div className="p-2">
          <p className="text-sm text-muted mb-5">
            Install one private or custom Docker app from its manifest.json.
          </p>
          <div
            data-testid="sideload-dialog-dropzone"
            role="button"
            tabIndex={0}
            className={`border-2 border-dashed rounded-xl py-10 px-6 text-center cursor-pointer hover:border-brand hover:bg-brand/3 transition ${dialogDrop.isDragOver ? 'border-brand bg-brand/3' : 'border-border'}`}
            onClick={() => sideloadInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                sideloadInputRef.current?.click();
              }
            }}
            {...dialogDrop.dropProps}
          >
            <FileCode2
              size={32}
              strokeWidth={1.5}
              style={{ opacity: 0.4, marginBottom: 8, display: 'inline-block' }}
            />
            <span className="text-sm font-bold block mb-1">
              Drop manifest.json here or choose a file
            </span>
            <span className="text-xs text-muted">Accepts .json (max 1 MiB)</span>
          </div>
          <p className="text-xs text-muted mt-4">
            The manifest defines the app name, version, Docker image, ports, and other
            configuration.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-4 text-xs text-muted">
            <span>Have an apps.json from D-O-S?</span>
            <Link
              to="/system?section=backup-migration"
              className="group inline-flex items-center gap-1 font-medium text-brand hover:underline"
            >
              Onboard device
              <span className="relative h-3 w-3 shrink-0">
                <ChevronRight
                  size={12}
                  className="absolute inset-0 transition-all duration-200 ease-out group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0"
                />
                <ArrowRight
                  size={12}
                  className="absolute inset-0 scale-75 opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                />
              </span>
            </Link>
          </div>
        </div>
      </ContentDialog>

      <ContentDialog
        open={sideloadRunning}
        setOpen={setSideloadRunning}
        title="Installing Sideloaded App"
      >
        <InstallationStepper manifest={sideloadManifest ?? undefined} sideload={true} />
      </ContentDialog>

      <ContentDialog
        open={updateAllOpen}
        setOpen={setUpdateAllOpen}
        title={`Update ${updateCount} app${updateCount !== 1 ? 's' : ''}`}
      >
        <div className="flex flex-col gap-4 p-2">
          {appsWithUpdates.map((app) => {
            const v = createVersions(app.versions || [], app.installedVersions || []);
            const l = getLatestVersion(v);
            if (!l) return null;
            return (
              <div key={`${app.appKey?.name}\u0000${app.appKey?.version}`}>
                <InstallationStepper app={app} version={l.version} update={true} />
              </div>
            );
          })}
        </div>
      </ContentDialog>
    </div>
  );
}
